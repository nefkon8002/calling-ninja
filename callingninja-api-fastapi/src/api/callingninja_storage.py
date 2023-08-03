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
    prefix="/storage",
    tags=["storage"],
    dependencies="",
    responses={404: {"description": "Not found"}},
)


# works
@router.put(
    "/upload_audio/",
    summary="Sync Upload to S3",
    description="Upload a file to a S3 bucket using the standard boto3 lib - sync",
)
async def upload_audio(
    uploaded_audio: UploadFile,
    config: Annotated[Config, Depends(config_setter)],
    current_user=auth_levels.auth_all,
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
@router.put(
    "/upload_audio_async",
    summary="Async Upload to S3",
    description="Upload a file to a S3 bucket using the async wrapper for boto3 - aiboto3 - async",
)
async def upload_audio_async(
    uploaded_audio: UploadFile,
    request: Request,
    config: Annotated[Config, Depends(config_setter)],
    current_user=auth_levels.auth_all,
):
    try:
        if (
            magic.from_buffer(await uploaded_audio.read(), mime=True).split("/")[0]
            == "audio"
        ):
            # Reset the file cursor to the beginning
            uploaded_audio.file.seek(0)

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


@router.get("/query_audios/")
async def query_audios(
    config: Annotated[Config, Depends(config_setter)], current_user=auth_levels.auth_all
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


@router.put("/upload_numbers_s3")
async def upload_numbers_s3(
    request: Request,
    uploaded_numbers: UploadFile,
    contents_str,
    config: Annotated[Config, Depends(config_setter)],
    current_user=auth_levels.auth_all,
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
@router.post("/upload_numbers")
async def upload_numbers(
    request: Request,
    uploaded_numbers: UploadFile,
    config: Annotated[Config, Depends(config_setter)],
    current_user=auth_levels.auth_all,
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
