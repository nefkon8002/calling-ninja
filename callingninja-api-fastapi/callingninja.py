import asyncio
import base64
from functools import lru_cache
import io
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
    Form,
)
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import motor.motor_asyncio
from pydantic import BaseModel, HttpUrl
from fastapi.middleware.cors import CORSMiddleware

from src.security import JWTBearer
from src.config import get_config, Config, ProductionConfig, DevelopmentConfig

import csv
import os
import uuid
import requests
import urllib.parse
import httpx


from dotenv import load_dotenv, find_dotenv

from twilio.rest import Client

import boto3  # aws python sdk
import aioboto3 as asyncboto  # async wrapper for boto3

import magic  # detects file type. python-magic

# init fastapi
app = FastAPI()
# register MiddleWare
## CORS middleware
### retrieve config variables temporarily to set in origins list
init_config = get_config()
### set origins list
origins = [
    f"{init_config.CN_FRONT}",  # Replace with the actual origin of your Angular application
    "http://localhost",
    f"{init_config.CN_USER}",
    "callingninja.duckdns.org",
    "callingninja-api-user",
    "callingninja-ui-web",
    "duckdns.org",
    "callingninja.duckdns.org:4200",
    "http://callingninja.duckdns.org:4200",
    "http://callingninja.duckdns.org",
    "callingninja.xyz",
    "http://callingninja.xyz",
    "https://callingninja.xyz",
    "www.callingninja.xyz",
]
### delete temporary config variables
del init_config

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # this has to be restricted to the absolute minimum
    allow_headers=["*"],  # this has to be restricted to the absolute minimum
    # allow_headers=["Content-Type", "Access-Control-Request-Method"],
)

# init oauth2
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# not needed bc custom jwt auth in security.py

# get enviroment variable file
# load_dotenv(find_dotenv())

# load env variables from env file
## twilio
# account_sid = os.getenv("ACCOUNT_SID2") or ""
# auth_token = os.getenv("AUTH_TOKEN2") or ""
##aws
# aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID") or ""
# aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY") or ""
# region_name = os.getenv("AWS_DEFAULT_REGION") or ""
# bucket_name = os.getenv("AWS_BUCKET_NAME") or ""


# pydantic settings instance from src/config.py
@lru_cache()  # creates the config var on startup only. hot-reloading does not reload this variable! to turn this off comment this line and the same one in src/config.py
def config_setter():
    config = get_config()
    return config


# config = config_setter()


# init Client instance for twilio api
# client = Client(account_sid, auth_token)


# connect to mongodb
# db_client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
# select collection from mongodb
# db = db_client.tpv

# helper variables for endpoint parameters
## Auth types
auth_all = Depends(JWTBearer(["ADMIN", "OPERATOR", "MANAGER", "CUSTOMER"]))
auth_admin = Depends(JWTBearer(["ADMIN"]))
auth_manager = Depends(JWTBearer(["MANAGER"]))
auth_operator = Depends(JWTBearer(["OPERATOR"]))
auth_customer = Depends(JWTBearer(["CUSTOMER"]))
## config
### not working!
config = Annotated[Config, Depends(config_setter)]


# pydantic Model
class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


class UserInDB(User):
    hashed_password: str


class CallRequest(BaseModel):
    from_number: str
    to_number: str
    audio_url: HttpUrl


###############################################################################
###############################################################################
# helper functions
###############################################################################
###############################################################################


async def get_user_details(
    current_user, config: Annotated[Config, Depends(config_setter)]
):
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {current_user['token']}"}
        endpoint_users_mobile = f"http://{config.CN_USER}/users/" + str(
            current_user["mobile"]
        )
        user_data = await client.get(endpoint_users_mobile, headers=headers)
        user_data = dict(user_data.json())
        return user_data


###############################################################################
###############################################################################
# endpoints
###############################################################################
###############################################################################


# works
# used to manually obtain a token from api-user, copy from response to JWTBearer login in fastapi swagger ui
@app.post("/custom_token")
async def custom_token(
    username: str, password: str, config: Annotated[Config, Depends(config_setter)]
):
    url = f"{config.CN_USER}/users/token"
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


##################################################################################################


# works
@app.get("/get_from_numbers/")
async def get_from_numbers(
    request: Request,
    config: Annotated[Config, Depends(config_setter)],
    current_user=Depends(JWTBearer(["ADMIN", "MANAGER", "OPERATOR", "CUSTOMER"])),
):
    # get user details from api-user
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {current_user['token']}"}
        endpoint_users_mobile = f"{config.CN_USER}/users/" + str(current_user["mobile"])
        user_data = await client.get(endpoint_users_mobile, headers=headers)
        user_data = dict(user_data.json())
    # extract current users' twilio credentials from former request
    sid = user_data["twilio_sid"]
    auth = user_data["twilio_auth"]
    # init twilio client with current users' credentials
    client = Client(sid, auth)

    # get all available from numbers for current user from twilio
    from_numbers_list = []
    incoming_phone_numbers = client.incoming_phone_numbers.list()
    # limit returned numbers?
    # ... .list(limit=20)

    # create a list of fully qualified from numbers
    for record in incoming_phone_numbers:
        from_numbers_list.append(record.phone_number)
    # request.session["from_numbers"] = from_numbers_list
    return {"from_numbers": from_numbers_list}


# works
@app.put(
    "/upload_audio/",
    summary="Sync Upload to S3",
    description="Upload a file to a S3 bucket using the standard boto3 lib - sync",
)
async def upload_audio(
    uploaded_audio: UploadFile,
    config: Annotated[Config, Depends(config_setter)],
    current_user=Depends(JWTBearer(["ADMIN", "MANAGER", "OPERATOR", "CUSTOMER"])),
):
    #########################################
    # DOES NOT CHECK IF FILE IS AUDIO FILE! #
    #########################################
    # uses `upload_file`, which automagically splits big files
    # alternatively set up like this: `s3 = boto3.resource('s3')` and use function `put_object` --> no large file split, but more options
    # init aws sdk boto3 client
    s3 = boto3.client(
        "s3",
        aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
        aws_access_key_id=config.AWS_ACCESS_KEY_ID,
    )
    file_key = (
        "public/"
        + str(current_user["mobile"])
        + "/"
        + str(uuid.uuid4())
        + "_"
        + uploaded_audio.filename
    )
    s3.upload_file(
        uploaded_audio.filename,
        config.AWS_BUCKET_NAME,
        file_key,
        ExtraArgs={"ContentType": uploaded_audio.content_type},
    )
    file_url = f"https://{config.AWS_BUCKET_NAME}.s3.amazonaws.com/{file_key}"
    return {"file_key": file_key, "file_url": file_url}


# works
@app.put(
    "/upload_audio_async",
    summary="Async Upload to S3",
    description="Upload a file to a S3 bucket using the async wrapper for boto3 - aiboto3 - async",
)
async def upload_audio_async(
    uploaded_audio: UploadFile,
    request: Request,
    config: Annotated[Config, Depends(config_setter)],
    current_user=Depends(JWTBearer(["ADMIN", "CUSTOMER", "OPERATOR", "MANAGER"])),
):
    try:
        if (
            magic.from_buffer(await uploaded_audio.read(), mime=True).split("/")[0]
            == "audio"
        ):
            session = asyncboto.Session()
            async with session.client(
                "s3",
                aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
                aws_access_key_id=config.AWS_ACCESS_KEY_ID,
            ) as s3_client:
                file_key = (
                    "public/"
                    + str(current_user["mobile"])
                    + "/"
                    + str(uuid.uuid4())
                    + "_"
                    + uploaded_audio.filename
                )
                await s3_client.upload_fileobj(
                    uploaded_audio.file,
                    config.AWS_BUCKET_NAME,
                    file_key,
                    ExtraArgs={"ContentType": uploaded_audio.content_type},
                )
                file_url = (
                    f"https://{config.AWS_BUCKET_NAME}.s3.amazonaws.com/{file_key}"
                )
                return {"file_key": file_key, "file_url": file_url}
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to upload the file. Only audio files are allowed.",
            )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to upload the file. Only audio files are allowed. Error-response: {e}",
        )


@app.put("/upload_numbers_s3")
async def upload_numbers_s3(
    request: Request,
    uploaded_numbers: UploadFile,
    contents_str,
    config: Annotated[Config, Depends(config_setter)],
    current_user=auth_all,
):
    try:
        # no file type check!
        session = asyncboto.Session()

        async with session.client(
            "s3",
            aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
            aws_access_key_id=config.AWS_ACCESS_KEY_ID,
        ) as s3_client:
            file_key = (
                "private/"
                + str(current_user["mobile"])
                + "/"
                + str(uuid.uuid4())
                + "_"
                + uploaded_numbers.filename
            )

            await s3_client.put_object(
                Body=contents_str,
                Bucket=config.AWS_BUCKET_NAME,
                Key=file_key,
                ContentType=uploaded_numbers.content_type,
            )
            file_url = f"https://{config.AWS_BUCKET_NAME}.s3.amazonaws.com/{file_key}"

            return {"file_key": file_key, "file_url": file_url}
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to upload the file: {e}",
        )


# works
@app.post("/upload_numbers")
async def upload_numbers(
    request: Request,
    uploaded_numbers: UploadFile,
    config: Annotated[Config, Depends(config_setter)],
    current_user=auth_all,
):
    numbers = []

    # read content of csv to str
    contents = await uploaded_numbers.read()
    contents_str = contents.decode()

    bucket_response = await upload_numbers_s3(
        request, uploaded_numbers, contents_str, config, current_user
    )

    # Use csv.reader on the string contents
    csv_reader = csv.reader(io.StringIO(contents_str))
    for row in csv_reader:
        numbers.append(row[0])

    return {"to_numbers": numbers, "bucket_response": bucket_response}


@app.get("/query_audios/")
async def query_audios(
    config: Annotated[Config, Depends(config_setter)], current_user=auth_all
):
    session = asyncboto.Session()
    try:
        async with session.client(
            "s3",
            aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
            aws_access_key_id=config.AWS_ACCESS_KEY_ID,
        ) as s3_client:
            available_audios = await s3_client.list_objects(
                Bucket=config.AWS_BUCKET_NAME, Prefix=f"public/{current_user['mobile']}"
            )

            audio_result = {}
            if available_audios.get("Contents") is not None:
                audio_result["ContentCount"] = len(available_audios["Contents"])
                audio_result["Contents"] = {}

                for content in available_audios["Contents"]:
                    audio_result["Contents"][content["Key"]] = {
                        "file_key": content["Key"],
                        "originalName": content["Key"].split("_")[1],
                        "lastModified": content["LastModified"],
                        "full_url": f"https://{config.AWS_BUCKET_NAME}.s3.amazonaws.com/{content['Key']}",
                    }
                return audio_result
            else:
                audio_result["ContentCount"] = 0
                audio_result["detail"] = "No audio files found."
                return audio_result
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to retrieve list of available audios Error-response: {e}",
        )


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
    status_callback_url = (
        "https://38e6-2806-106e-13-1995-449d-2bda-4b68-8f23.ngrok-free.app"
        + "/call_status"
    )
    # create TwiML string
    twiml = f"<Response><Play>{audio_url}</Play></Response>"
    for to_number in to_numbers:
        client.calls.create(
            method="GET",
            status_callback=status_callback_url,
            status_callback_event=[
                "queued",
                "initiated",
                "ringing",
                "answered",
                "in-progress",
                "completed",
                "busy",
                "no-answer",
                "canceled",
                "failed",
            ],
            status_callback_method="POST",
            twiml=twiml,
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


@app.post("/call_manual")
async def call_manual(
    call_request: CallRequest,
    config: Annotated[Config, Depends(config_setter)],
    current_user=Depends(JWTBearer(["ADMIN", "OPERATOR", "MANAGER", "CUSTOMER"])),
):
    # get user details from api-user
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {current_user['token']}"}
        endpoint_users_mobile = f"{config.CN_USER}/users/" + str(current_user["mobile"])
        user_data = await client.get(endpoint_users_mobile, headers=headers)
        user_data = dict(user_data.json())
    # extract current users' twilio credentials from former request
    sid = user_data["twilio_sid"]
    auth = user_data["twilio_auth"]
    # init twilio client with current users' credentials
    client = Client(sid, auth)

    # set url for callbacks on call events
    status_callback_url = "https://94f0-187-202-216-18.ngrok-free.app" + "/call_status"

    # create TwiML string
    twiml = f"<Response><Play>{call_request.audio_url}</Play></Response>"
    # send call request to twilio api
    client.calls.create(
        method="GET",
        twiml=twiml,
        status_callback=status_callback_url,
        status_callback_event=[
            "initiated",
            "ringing",
            "answered",
            "completed",
        ],
        status_callback_method="POST",
        to=call_request.to_number,
        from_=call_request.from_number,
    )
    return {
        "message": "Call initiated successfully",
        "Recipients; to": call_request.to_number,
        "Emitter; from": call_request.from_number,
        "Played Audio Message; url": call_request.audio_url,
    }


@app.post("/call_status")
async def call_status(request: Request):
    form_data = await request.form()
    decoded_data = {}

    for key, value in form_data.items():
        decoded_data[key] = value

    print(decoded_data)
    return {"decoded_data": decoded_data}


# Values sent in form from twilio:
"""
    Called: Annotated[str, Form()],
    ToState: Annotated[str, Form()],
    CallerCountry: Annotated[str, Form()],
    Direction: Annotated[str, Form()],
    Timestamp: Annotated[str, Form()],
    CallbackSource: Annotated[str, Form()],
    SipResponseCode: Annotated[str, Form()],
    CallerState: Annotated[str, Form()],
    ToZip: Annotated[str, Form()],
    SequenceNumber: Annotated[str, Form()],
    CallSid: Annotated[str, Form()],
    To: Annotated[str, Form()],
    CallerZip: Annotated[str, Form()],
    ToCountry: Annotated[str, Form()],
    CalledZip: Annotated[str, Form()],
    ApiVersion: Annotated[str, Form()],
    CalledCity: Annotated[str, Form()],
    CallStatus: Annotated[str, Form()],
    Duration: Annotated[str, Form()],
    From: Annotated[str, Form()],
    CallDuration: Annotated[str, Form()],
    AccountSid: Annotated[str, Form()],
    CalledCountry: Annotated[str, Form()],
    CallerCity: Annotated[str, Form()],
    ToCity: Annotated[str, Form()],
    FromCountry: Annotated[str, Form()],
    Caller: Annotated[str, Form()],
    FromCity: Annotated[str, Form()],
    CalledState: Annotated[str, Form()],
    FromZip: Annotated[str, Form()],
    FromState: Annotated[str, Form()],
"""


@app.get("/example_customer")
async def example_customer(request: Request, customer=Depends(JWTBearer(["CUSTOMER"]))):
    host = request.client.host
    return {"host": host, "current_user": customer}


@app.get("/example_admin")
async def example_admin(request: Request, admin=Depends(JWTBearer(["ADMIN"]))):
    host = request.client.host
    return {"host": host, "current_user": admin}


@app.get("/example_all")
async def example_all(
    request: Request,
    user=Depends(JWTBearer(["ADMIN", "MANAGER", "CUSTOMER", "OPERATOR"])),
):
    host = request.client.host
    return {"host": host, "current_user": user}


@app.get("/info")
async def info(
    config: Annotated[Config, Depends(config_setter)], current_user=auth_all
):
    print(current_user)
    print(origins)
    return {"config": config, "current_user": current_user}
