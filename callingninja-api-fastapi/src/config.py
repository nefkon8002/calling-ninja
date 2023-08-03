from typing import Optional

from pydantic import BaseSettings, Field

from functools import lru_cache


class Config(BaseSettings):
    ENVIRONMENT: str = Field(None, env="ENVIRONMENT")
    JWT_SECRET: Optional[str]
    CN_FRONT: Optional[str]
    CN_USER: Optional[str]
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_DEFAULT_REGION: str = ""
    AWS_BUCKET_NAME: str = ""

    class Config:
        env_file: str = "config.env"


class DevelopmentConfig(Config):
    class Config:
        env_prefix: str = "DEV_"


class ProductionConfig(Config):
    class Config:
        env_prefix: str = "PROD_"


@lru_cache()
def get_config():
    if Config().ENVIRONMENT == "production":
        return ProductionConfig()
    else:
        return DevelopmentConfig()


# pydantic settings instance from src/config.py
@lru_cache()  # creates the config var on startup only. hot-reloading does not reload this variable! to turn this off comment this line and the same one in src/config.py
def config_setter():
    config = get_config()
    return config
