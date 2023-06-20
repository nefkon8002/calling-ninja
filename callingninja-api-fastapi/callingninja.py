import requests
import asyncio
from typing import Union, Annotated, Optional
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
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)
from jose import JWTError, jwt
from passlib.context import CryptContext
import motor.motor_asyncio
from pydantic import BaseModel, HttpUrl
from starlette.middleware.sessions import SessionMiddleware

import csv
import os
import uuid
from datetime import datetime, timedelta
import requests
import base64

from dotenv import load_dotenv, find_dotenv

from twilio.rest import Client

import boto3  # aws python sdk
import aioboto3 as asyncboto  # async wrapper for boto3

import magic  # detects file type. python-magic, depends on local installation of `libmagic`

# get enviroment variable file
load_dotenv(find_dotenv())

# Auth Secrets
SECRET_KEY = os.getenv("AUTH_SECRET_KEY")
ALGORITHM = os.getenv("AUTH_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("AUTH_ACCESS_TOKEN_EXPIRE_MINUTES"))

# Java backend URL
JAVA_BACKEND_URL = "http://localhost:8081/users/{username}"

# init fastapi
app = FastAPI()
# register MiddleWare
session_secret_key = (
    os.getenv("SESSION_SECRET_KEY") or "very-top-secret-key-for-sessions"
)
app.add_middleware(SessionMiddleware, secret_key=session_secret_key)


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
# client = Client(account_sid, auth_token)

# init aws sdk boto3 client
# s3 = boto3.client("s3")

# connect to mongodb
# db_client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
# select collection from mongodb
# db = db_client.tpv


# init oauth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8081/users/token")
# init httpbearer
security = HTTPBearer()


# pydantic Model
class Token(BaseModel):
    token: Optional[str]


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    name: str
    role: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


class UserInDB(User):
    hashed_password: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


###############################################################################
###############################################################################
# endpoints
###############################################################################
###############################################################################


# AUTH TESTS
"""
    if not is_valid_token(token.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # If the token is valid, you can extract the user information from it
    user = extract_user_from_token(token.credentials)

    # You can return the user object or any additional information
    # that you want to make available in your protected endpoint
    return user
"""


def verify_token(token, current_user_number):
    try:
        token = token.credentials
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded_token
    except IndexError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def is_valid_token(token, current_user_number: str):
    print(token)
    print(SECRET_KEY)
    base64_secretkey = base64.b64encode(SECRET_KEY.encode("utf-8")).decode("utf-8")
    token_claims = jwt.get_unverified_claims(token.credentials)
    print(token_claims)
    print(
        jwt.decode(token.credentials, SECRET_KEY.encode("utf-8"), algorithms=ALGORITHM)
    )
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        # Process the decoded token as needed
        if decoded_token["user"] == current_user_number:
            print("right user")
            return True
        else:
            return False
    except jwt.JWTError:
        # Invalid token or signature verification failed
        return False


async def extract_data_from_token(token: str):
    decoded_token = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
    user = User(
        username=decoded_token["user"],
        role=decoded_token["role"],
        name=decoded_token["name"],
    )
    return user


async def get_current_user(
    current_user_number: str, token: HTTPAuthorizationCredentials = Depends(security)
):
    # Perform token validation logic here
    # For example, verify the token with your Java backend or decode it if needed
    # print(token)
    url = f"http://localhost:8081/users/{current_user_number}"
    headers = {
        "accept": "*/*",
        "Authorization": f"Bearer {token.credentials}",
        "Content-Type": "application/json",
    }
    payload = {}
    params = {"current_user_number": current_user_number}
    response = requests.get(url, headers=headers, json=payload, params=params)
    # If token is invalid or expired, raise an HTTPException
    # with 401 Unauthorized status code
    if not await verify_token(token, current_user_number):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # If the token is valid, you can extract the user information from it
    user = await extract_data_from_token(token.credentials)

    # You can return the user object or any additional information
    # that you want to make available in your protected endpoint
    return user


@app.post("/custom_token", response_model=Token)
async def custom_token(username: str, password: str):
    url = "http://localhost:8081/users/token"
    auth_base64_base = username + ":" + password
    auth_base64_encoded = base64.b64encode(auth_base64_base.encode("utf-8")).decode(
        "utf-8"
    )
    headers = {
        "accept": "*/*",
        "Authorization": f"Basic {auth_base64_encoded}",
        "Content-Type": "application/json",
    }
    payload = {
        "username": username,
        "password": password,
        "authorities": [{"authority": "string"}],
        "accountNonExpired": True,
        "accountNonLocked": True,
        "credentialsNonExpired": True,
        "enabled": True,
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        response = response.json()
        return {"token": response["token"]}
    else:
        return {"token": None, "message": "Invalid user or password"}


@app.get("/protected")
async def protected_endpoint(current_user: User = Depends(get_current_user)):
    # Access the authenticated user and perform protected operations here
    return {"message": "Protected endpoint accessed"}


"""
@app.get("/users/me")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return current_user


@app.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return [{"item_id": "Foo", "owner": current_user.username}]
"""

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
