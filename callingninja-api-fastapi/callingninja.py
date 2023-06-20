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

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import CallingninjaUser

# get enviroment variable file
load_dotenv(find_dotenv())

# Auth Secrets
SECRET_KEY = os.getenv("AUTH_SECRET_KEY")
ALGORITHM = os.getenv("AUTH_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("AUTH_ACCESS_TOKEN_EXPIRE_MINUTES"))

# Java backend URL
# JAVA_BACKEND_URL = "http://localhost:8081/users/{username}"

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

SQLALCHEMY_DATABASE_URL = "mysql+mysqlconnector://root:rootpwd@localhost/callingninja"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# init oauth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8081/users/token")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="custom_token")
# init httpbearer
security = HTTPBearer()


# pydantic Model
class Token(BaseModel):
    access_token: str | None
    token_type: str | None


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


def get_token(auth: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
    print(f"GET TOKEN {auth}")
    if auth.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authentication scheme",
        )
    token = auth.credentials
    return token


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(username: str, db: Session = Depends(get_db)):
    user = (
        db.query(CallingninjaUser)
        .filter(or_(mobile=username, email=username))
        .one_or_none()
    )
    if user:
        return user


def authenticate_user(username: str, password: str, db: Session = Depends(get_db)):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


async def get_current_user(
    access_token: Annotated[str, Depends(oauth2_scheme)], request: Request
):
    # async def get_current_user(token: Token = Depends(get_token)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = request.session.get("token")
    print(f"YOUR TOKEN {token}")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print(payload)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("user")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if current_user.active != 1:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


###############################################################################
###############################################################################
# endpoints
###############################################################################
###############################################################################


# AUTH TESTS
@app.get("/allusers")
async def allusers(db: Session = Depends(get_db)):
    allusers = db.query(CallingninjaUser).all()
    return allusers


@app.post("/custom_token", response_model=Token)
async def custom_token(username: str, password: str, request: Request):
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
    print(response.json())
    if response.status_code == 200:
        response = response.json()
        request.session["token"] = response["token"]
        return {"access_token": response["token"], "token_type": "bearer"}
    else:
        return {"token": None, "message": "Invalid user or password"}


"""
@app.get("/users/me/")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return current_user
"""


@app.get("/users/me/")
async def read_users_me(request: Request):
    token = request.session.get("token")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user = payload.get("user")
    headers = {"Authorization": f"Bearer {request.session.get('token')}"}
    response = requests.get(f"http://localhost:8081/users/{user}", headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch user details"}


@app.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return [{"item_id": "Foo", "owner": current_user.username}]


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
        "token": request.session.get("token"),
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
