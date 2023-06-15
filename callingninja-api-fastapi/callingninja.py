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
from starlette.middleware.sessions import SessionMiddleware

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
# register MiddleWare
session_secret_key = (
    os.getenv("SESSION_SECRET_KEY") or "very-top-secret-key-for-sessions"
)
app.add_middleware(SessionMiddleware, secret_key=session_secret_key)
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
async def get_from_numbers(request: Request):
    from_numbers_list = []
    incoming_phone_numbers = client.incoming_phone_numbers.list()
    # limit returned numbers?
    # ... .list(limit=20)

    for record in incoming_phone_numbers:
        from_numbers_list.append(record.phone_number)
    request.session["from_numbers"] = from_numbers_list
    return {"from_numbers": from_numbers_list}


# works
@app.put(
    "/upload_audio/",
    summary="Sync Upload to S3",
    description="Upload a file to a S3 bucket using the standard boto3 lib - sync",
)
async def upload_audio(uploaded_audio: UploadFile):
    #########################################
    # DOES NOT CHECK IF FILE IS AUDIO FILE! #
    #########################################
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
async def upload_audio_async(uploaded_audio: UploadFile, request: Request):
    try:
        if magic.from_file(uploaded_audio.filename, mime=True).split("/")[0] == "audio":
            session = asyncboto.Session()
            async with session.client("s3") as s3_client:
                file_key = str(uuid.uuid4()) + "_" + uploaded_audio.filename
                await s3_client.upload_file(
                    uploaded_audio.filename, bucket_name, file_key
                )
                file_url = "https://" + bucket_name + ".s3.amazonaws.com/" + file_key
                request.session["audio_url"] = file_url
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
@app.post("/upload_numbers/")
async def upload_numbers(
    request: Request,
    uploaded_numbers: UploadFile,
):
    numbers = []
    # takes simple .csv with only one column and each number in the first cell of each row
    with open(uploaded_numbers.filename, "r") as f:
        csv_reader = csv.reader(f)
        for row in csv_reader:
            numbers.append(row[0])
            # to_number = row[0]
            # await call(to_number, from_number, audio, request)
            # numbers.append(to_number)
        request.session["to_numbers"] = numbers
        return {"numbers": numbers}


@app.get("/a")
async def a(request: Request):
    from_numbers = request.session.get("from_numbers", [])
    to_numbers = request.session.get("to_numbers", [])
    audio_url = request.session.get("audio_url", [])
    return {
        "from_numbers": from_numbers,
        "to_numbers": to_numbers,
        "audio_url": audio_url,
    }


@app.get("/query_audios/")
async def query_audios():
    return {"nada": "nada"}


# works
# missing: reporting function i.e. status callback
@app.post("/call/")
async def call(request: Request):
    to_numbers = request.session.get("to_numbers", [])
    from_numbers = request.session.get("from_numbers", [])
    audio_url = request.session.get("audio_url", [])

    if to_numbers == [] or from_numbers == [] or audio_url == []:
        missing_parameters = []
        if to_numbers == []:
            missing_parameters.append("to_numbers")
        if from_numbers == []:
            missing_parameters.append("from_numbers")
        if audio_url == []:
            missing_parameters.append("audio_url")

        raise HTTPException(
            422, detail=f"Missing parameters {missing_parameters} to fulfill request."
        )

    host = request.client.host
    # status_callback_url = "https://" + host + ":8000" + "/call_status"
    status_callback_url = "https://b489-148-244-208-199.ngrok-free.app" + "/call_status"
    for to_number in to_numbers:
        client.calls.create(
            method="GET",
            status_callback=status_callback_url,
            status_callback_event=["initiated", "ringing", "answered", "completed"],
            status_callback_method="POST",
            url=audio_url,
            to=to_number,
            from_=from_numbers[
                0
            ],  # use first number in from_numbers. UPDATE through other endpoint or from frontend
        )
        return {
            "message": "Calls initiated successfully",
            "Number of recipients": len(to_numbers),
            "Emitter": from_numbers[0],
            "Played Audio Message": audio_url,
        }


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
