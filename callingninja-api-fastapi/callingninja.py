import asyncio
from typing import Union, Annotated
from fastapi import (
    FastAPI,
    Query,
    File,
    UploadFile,
    HTTPException,
    Request,
    Depends,
    status,
)
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import motor.motor_asyncio
from pydantic import BaseModel, HttpUrl

import csv
import os
import uuid


from dotenv import load_dotenv, find_dotenv

from twilio.rest import Client

import boto3  # aws python sdk
import aioboto3 as asyncboto  # async wrapper for boto3

import magic  # detects file type. python-magic

# init fastapi
app = FastAPI()
# init oauth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# get enviroment variable file
load_dotenv(find_dotenv())

# load env variables from env file
## twilio
account_sid = os.getenv("ACCOUNT_SID")
auth_token = os.getenv("AUTH_TOKEN")
##aws
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
region_name = os.getenv("AWS_DEFAULT_REGION")
bucket_name = os.getenv("AWS_BUCKET_NAME")

# init Client instance for twilio api
client = Client(account_sid, auth_token)

# init aws sdk boto3 client
s3 = boto3.client("s3")

# connect to mongodb
db_client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
# select collection from mongodb
db = db_client.tpv


# pydantic Model
class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


class UserInDB(User):
    hashed_password: str


# fake user table
fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "fakehashedsecret",
        "disabled": False,
    },
    "alice": {
        "username": "alice",
        "full_name": "Alice Wonderson",
        "email": "alice@example.com",
        "hashed_password": "fakehashedsecret2",
        "disabled": True,
    },
}


###############################################################################
###############################################################################
# endpoints
###############################################################################
###############################################################################


# AUTH TESTS
def fake_decode_token(token):
    return User(
        username=token + "fakedecoded", email="john@example.com", full_name="John Doe"
    )


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user = fake_decode_token(token)
    return user


@app.get("/users/me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@app.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user_dict = fake_users_db.get(form_data.username)
    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    user = UserInDB(**user_dict)
    hashed_password = fake_hash_password(form_data.password)
    if not hashed_password == user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    return {"access_token": user.username, "token_type": "bearer"}


##################################################################################################


# works
@app.get("/get_from_numbers/")
async def get_from_numbers():
    from_numbers_list = []
    incoming_phone_numbers = client.incoming_phone_numbers.list()
    # limit returned numbers?
    # ... .list(limit=20)

    for record in incoming_phone_numbers:
        from_numbers_list.append(record.phone_number)

    return {"from_numbers": from_numbers_list}


@app.get("/audio_checker")
async def audio_checker(url: HttpUrl):
    try:
        magic.from_file(url, mime=True).split("/")[0] == "audio"
        return True
    except Exception as e:
        raise HTTPException(400, "Only audio files allowed.")


# works
@app.put(
    "/upload_audio/",
    summary="Sync Upload to S3",
    description="Upload a file to a S3 bucket using the standard boto3 lib - sync",
)
async def upload_audio(uploaded_audio: UploadFile):
    # uses `upload_file`, which automagically splits big files
    # alternatively set up like this: `s3 = boto3.resource('s3')` and use function `put_object` --> no large file split, but more options
    file_key = str(uuid.uuid4()) + "_" + uploaded_audio.filename
    s3.upload_file(uploaded_audio.filename, bucket_name, file_key)
    file_url = "https://" + bucket_name + ".s3.amazonaws.com/" + file_key
    return {"file_key": file_key, "file_url": file_url}


# works
@app.put(
    "/upload_audio_async",
    summary="Async Upload to S3",
    description="Upload a file to a S3 bucket using the async wrapper for boto3 - aiboto3 - async",
)
async def upload_audio_async(uploaded_audio: UploadFile):
    try:
        await audio_checker(uploaded_audio)
        if uploaded_audio.content_type.startswith("audio/"):
            session = asyncboto.Session()
            async with session.client("s3") as s3_client:
                file_key = str(uuid.uuid4()) + "_" + uploaded_audio.filename
                await s3_client.upload_file(
                    uploaded_audio.filename, bucket_name, file_key
                )
                file_url = "https://" + bucket_name + ".s3.amazonaws.com/" + file_key
                return {"file_key": file_key, "file_url": file_url}
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to upload the file. Only audio files are allowed.",
            )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Failed to upload the file. Only audio files are allowed.",
        )


# works
# uploads numbers and initates calls through `call` endpoint
@app.post("/upload_numbers/")
async def upload_numbers(
    request: Request,
    uploaded_numbers: UploadFile,
    # audio: str = Query(..., description="URL for audio message."),
    audio: HttpUrl,
    from_number: str = Query(..., description="From Number."),
):
    numbers = []
    from_number = os.getenv("FROM_NUMBER")
    with open(uploaded_numbers.filename, "r") as f:
        csv_reader = csv.reader(f)
        for row in csv_reader:
            to_number = row[0]
            await call(to_number, from_number, audio, request)
            numbers.append(to_number)
        return {"numbers": numbers}


@app.get("/query_audios/")
async def query_audios():
    return {"nada": "nada"}


# works
# missing: reporting function i.e. status callback
@app.post("/call/")
async def call(to_number, from_number, audio, request: Request):
    host = request.client.host
    # status_callback_url = "https://" + host + ":8000" + "/call_status"
    status_callback_url = "https://7dbc-148-244-208-199.ngrok-free.app/call_status"
    try:
        # check if client is correctly set up
        call = client.calls.create(
            method="GET",
            status_callback=status_callback_url,
            status_callback_event=["initiated", "ringing", "answered", "completed"],
            status_callback_method="POST",
            url=audio,
            to=to_number,
            from_=from_number,
        )
        return {"message": "Call initiated successfully", "to_number": to_number}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/call_status")
async def call_status(call_status):
    fieldnames = call_status.keys()
    with open("status.csv", "r") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerow(call_status)

    return {"call_status": call_status}


@app.get("/example")
async def example(request: Request, token: Annotated[str, Depends(oauth2_scheme)]):
    host = request.client.host
    return {"host": host, "token": token}
