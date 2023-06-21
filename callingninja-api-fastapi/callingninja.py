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
from fastapi.middleware.cors import CORSMiddleware

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
# register MiddleWare Session
session_secret_key = (
    os.getenv("SESSION_SECRET_KEY") or "very-top-secret-key-for-sessions"
)
app.add_middleware(SessionMiddleware, secret_key=session_secret_key)
# register MiddleWare CORS
origins = [
    "http://localhost:4200",  # Replace with the actual origin of your Angular application
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # this has to be restricted to the absolut minimum
    allow_headers=["*"],  # this has to be restricted to the absolut minimum
    # allow_headers=["Content-Type", "Access-Control-Request-Method"],
)


# load env variables from env file
## twilio
# account_sid = os.getenv("ACCOUNT_SID")
# auth_token = os.getenv("AUTH_TOKEN")
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


# pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None
    twilio_sid: str | None = None
    twilio_token: str | None = None
    mobile: str
    role: str


class UserInDB(User):
    hashed_password: str


fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
        "twilio_sid": os.getenv("ACCOUNT_SID"),
        "twilio_token": os.getenv("AUTH_TOKEN"),
        "mobile": "1234",
        "role": "ADMIN",
        "address": "Local Street 1, Dschibuti, IL",
        "password": "secret",
        "role": "ADMIN",
        "active": True,
        "registrationDate": "2023-06-20T10:04:41.037",
        "company": "Hansi Inc.",
        "id": 24,
        "guid": "eab0324c-75ef-49a1-9c49-be2d68f50b17",
        "balance": "$1,01",
        "picture": "http://localhost:4200/assets/images/eddie.png",
        "age": 56,
        "eyeColor": "white",
    },
    "hans": {
        "username": "hans",
        "full_name": "Hans Wurst",
        "email": "hanswurst@example.com",
        "hashed_password": "$2b$12$pFcGTUw8ycv.H6BaAiPSyu9TJh9hUbXvVeLbD2cpwNiNATx30Zymi",
        "disabled": False,
        "twilio_sid": os.getenv("ACCOUNT_SID2"),
        "twilio_token": os.getenv("AUTH_TOKEN2"),
        "mobile": "9876",
        "role": "OPERATOR",
    },
    "maria": {
        "username": "maria",
        "full_name": "Maria Chancla",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
        "twilio_sid": os.getenv("ACCOUNT_SID2"),
        "twilio_token": os.getenv("AUTH_TOKEN2"),
        "mobile": "666",
        "firstName": "mary",
        "email": "mary@example.com",
        "address": "Main Street 1, Hudriwudri, MN",
        "password": "secret",
        "role": "ADMIN",
        "active": True,
        "registrationDate": "2023-06-20T10:04:41.037",
        "company": "Chanclas Inc.",
        "id": 26,
        "guid": "eab0324c-75ef-49a1-9c49-be2d68f50b17",
        "balance": "$1,01",
        "picture": "http://localhost:4200/assets/images/eddie.png",
        "age": 24,
        "eyeColor": "green",
    },
}


#########################################
#########################################


# init oauth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# init pwd hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# auth functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)


def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    # set exp
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})

    # set iss:
    to_encode.update({"iss": "mx-calling-ninja"})

    # set iat (issued at) and nbf (not valid before)
    # both are set to the time of issue
    iatnbf = datetime.utcnow()
    to_encode.update({"iat": iatnbf})
    to_encode.update({"nbf": iatnbf})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


#########################################
#########################################

# auth endpoints


# works
@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    print(form_data.username)
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.username,
            "user": user.mobile,
            "name": user.username,
            "role": user.role,
        },
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


# works
@app.get("/users/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return current_user


# works
@app.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return [{"item_id": "Foo", "owner": current_user.username}]


@app.get("/users/{mobile}")
async def read_users_mobile(
    current_user: Annotated[User, Depends(get_current_active_user)], mobile
):
    if mobile == "undefined":
        return {"mobile": "undefined"}
    # return current_user.mobile
    for user in fake_users_db.values():
        for data in user.values():
            if data.mobile == mobile:
                user = user
    print(user)
    profiledata = user.copy()
    return profiledata


###############################################################################
###############################################################################
# endpoints
###############################################################################
###############################################################################


# AUTH TESTS
@app.get("/allusers")
async def allusers(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Session = Depends(get_db),
):
    allusers = db.query(CallingninjaUser).all()
    return allusers


# works
@app.get("/get_from_numbers/")
async def get_from_numbers(
    current_user: Annotated[User, Depends(get_current_active_user)], request: Request
):
    client = Client(current_user.twilio_sid, current_user.twilio_token)
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


@app.post("/call_manual")
async def call_manual(
    current_user: Annotated[User, Depends(get_current_active_user)],
    from_number: str,
    to_number: str,
    audio_url: str,
):
    # init twilio client
    client = Client(current_user.twilio_sid, current_user.twilio_token)
    # set url for callbacks on call events
    status_callback_url = "https://534c-189-216-168-189.ngrok-free.app/call_status"
    # send call request to twilio api
    client.calls.create(
        method="GET",
        status_callback=status_callback_url,
        status_callback_event=["initiated", "ringing", "answered", "completed"],
        status_callback_method="POST",
        url=audio_url,
        to=to_number,
        from_=from_number,
    )
    return {
        "message": "Call initiated successfully",
        "Recipients; to": to_number,
        "Emitter; from": from_number,
        "Played Audio Message; url": audio_url,
    }


# works
# missing: reporting function i.e. status callback
@app.post("/call/")
async def call(
    current_user: Annotated[User, Depends(get_current_active_user)], request: Request
):
    client = Client(current_user.twilio_sid, current_user.twilio_token)
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
    status_callback_url = "https://3450-201-137-187-214.ngrok-free.app" + "/call_status"
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
async def call_status(request: Request):
    payload = await request.json()
    # Process the status update payload received from Twilio
    # Extract relevant information from the payload
    call_sid = payload["CallSid"]
    call_status = payload["CallStatus"]
    # Handle the call status as needed
    # You can store the status in a database, update a webpage, or perform any other action

    return {"message": "Call status received"}


@app.get("/example")
async def example(request: Request, token: Annotated[str, Depends(oauth2_scheme)]):
    host = request.client.host
    return {"host": host, "token": token}
