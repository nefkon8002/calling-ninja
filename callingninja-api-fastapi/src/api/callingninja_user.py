import base64
from typing import Annotated
from fastapi import (
    APIRouter,
    Depends,
)


from src.config import (
    Config,
    config_setter,
)


import requests


router = APIRouter(
    prefix="/user",
    tags=["user"],
    dependencies="",
    responses={404: {"description": "Not found"}},
)


# works
# used to manually obtain a token from api-user, copy from response to JWTBearer login in fastapi swagger ui
@router.post("/custom_token")
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
