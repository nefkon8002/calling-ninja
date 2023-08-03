import logging
from http.client import responses
from typing import Annotated

from fastapi import FastAPI, status, Request, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException
from starlette.responses import JSONResponse

from src.api import callingninja_ninja, callingninja_storage, callingninja_user
from src.config import get_config, Config, config_setter
from src.security import auth_levels
from src.data.database import start_database

from src.dtq_celery.celery_utils import create_celery


### retrieve config variables temporarily to set in origins list
init_config = get_config()
# set origins
origins = [
    f"{init_config.CN_FRONT}",  # Replace with the actual origin of your Angular application
    "http://localhost",
    "http://localhost:4200",
    f"{init_config.CN_USER}",
    "callingninja-api-user",
    "callingninja-ui-web",
    "callingninja.xyz",
    "http://callingninja.xyz",
    "https://callingninja.xyz",
    "www.callingninja.xyz",
    "https://api.caller.callingninja.xyz",
    "http://api.caller.callingninja.xyz",
]
# delete temporary init config
del init_config


def create_app() -> FastAPI:
    config = config_setter()
    logging.getLogger("uvicorn.error").propagate = False
    logging.getLogger().setLevel(logging.INFO)
    logging.info("Configuration environment: " + config.ENVIRONMENT)
    logging.info("Creating App...")
    logging.info("App loaded and ready to go! Ka-chow!")
    _app = FastAPI(title="callingninja-api-fastapi", debug=True)
    # set up celery
    _app.celery_app = create_celery()
    # include APIRouters
    _app.include_router(callingninja_ninja.router)
    _app.include_router(callingninja_storage.router)
    _app.include_router(callingninja_user.router)
    # register MiddleWare
    ## CORS middleware
    # actually register CORS Middleware
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],  # this has to be restricted to the absolute minimum
        allow_headers=["*"],  # this has to be restricted to the absolute minimum
        # allow_headers=["Content-Type", "Access-Control-Request-Method"],
    )
    start_database()
    return _app


app = create_app()
celery = app.celery_app


@app.exception_handler(HTTPException)
async def unicorn_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": responses[exc.status_code],
            "message": exc.detail,
            "code": exc.status_code,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": responses[status.HTTP_422_UNPROCESSABLE_ENTITY],
            "message": str(exc.errors()),
            "code": status.HTTP_422_UNPROCESSABLE_ENTITY,
        },
    )


@app.get("/info", tags=["info"])
async def info(
    config: Annotated[Config, Depends(config_setter)], current_user=auth_levels.auth_all
):
    print(current_user)
    print(origins)
    return {"config": config, "current_user": current_user}


@app.get("/example_customer", tags=["test"])
async def example_customer(request: Request, customer=auth_levels.auth_customer):
    host = request.client.host
    return {"host": host, "current_user": customer}


@app.get("/example_admin", tags=["test"])
async def example_admin(request: Request, admin=auth_levels.auth_admin):
    host = request.client.host
    return {"host": host, "current_user": admin}


@app.get("/example_all", tags=["test"])
async def example_all(
    request: Request,
    user=auth_levels.auth_all,
):
    host = request.client.host
    return {"host": host, "current_user": user}
