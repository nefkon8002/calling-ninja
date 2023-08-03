from typing import Union, Annotated
from fastapi import (
    APIRouter,
    HTTPException,
    Request,
    Depends,
)
from pydantic import BaseModel, HttpUrl

from src.security import auth_levels
from src.config import (
    Config,
    config_setter,
)

import httpx


from twilio.rest import Client


router = APIRouter(
    prefix="/ninja",
    tags=["ninja"],
    dependencies="",
    responses={404: {"description": "Not found"}},
)


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
@router.get("/get_from_numbers/")
async def get_from_numbers(
    request: Request,
    config: Annotated[Config, Depends(config_setter)],
    current_user=auth_levels.auth_all,
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
# missing: reporting function i.e. status callback
@router.post("/call/")
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


@router.post("/call_manual")
async def call_manual(
    call_request: CallRequest,
    config: Annotated[Config, Depends(config_setter)],
    current_user=auth_levels.auth_all,
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
    print(call_request.audio_url)
    print(twiml)
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


@router.post("/call_status")
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
