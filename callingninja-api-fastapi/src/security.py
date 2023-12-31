import jwt
from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# from src.config import config
from src.config import get_config

config = get_config()


class JWTBearer(HTTPBearer):
    def __init__(self, roles: []):
        super(JWTBearer, self).__init__()
        self.roles = roles

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(
            JWTBearer, self
        ).__call__(request)
        try:
            payload = jwt.decode(
                credentials.credentials, config.JWT_SECRET, algorithms=["HS256"]
            )
            role: str = payload.get("role")
            if role is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail="Non Role"
                )
            if role not in self.roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions",
                )
            customer = {
                "token": credentials.credentials,
                "mobile": int(payload.get("user")),
                "name": payload.get("name"),
                "role": role,
            }
            return customer
        except jwt.DecodeError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="expired token"
            )


class auth_levels:
    auth_all = Depends(JWTBearer(["ADMIN", "OPERATOR", "MANAGER", "CUSTOMER"]))
    auth_admin = Depends(JWTBearer(["ADMIN"]))
    auth_manager = Depends(JWTBearer(["MANAGER"]))
    auth_operator = Depends(JWTBearer(["OPERATOR"]))
    auth_customer = Depends(JWTBearer(["CUSTOMER"]))
