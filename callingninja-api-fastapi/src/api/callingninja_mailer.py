import io
from typing import Union, Annotated
from fastapi import (
    APIRouter,
    UploadFile,
    HTTPException,
    Request,
    Depends,
)

from src.security import auth_levels
from src.config import (
    Config,
    config_setter,
)

import csv
import uuid


import boto3  # aws python sdk
import aioboto3 as asyncboto  # async wrapper for boto3

import magic  # detects file type. python-magic

router = APIRouter(
    prefix="/mailer",
    tags=["mailer"],
    dependencies="",
    responses={404: {"description": "Not found"}},
)

import json

import httpx

from schemas.schemas import University

url = "http://universities.hipolabs.com/search"


def get_all_universities_for_country(country: str) -> dict:
    print("get_all_universities_for_country ", country)
    params = {"country": country}
    client = httpx.Client()
    response = client.get(url, params=params)
    response_json = json.loads(response.text)
    universities = []
    for university in response_json:
        university_obj = University.parse_obj(university)
        universities.append(university_obj)
    return {country: universities}
