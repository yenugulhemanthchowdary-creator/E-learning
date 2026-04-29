from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.core.security import decode_access_token
from app.db.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class CurrentUser(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str | None = None
    bio: str | None = None
    learning_goals: list[str] = []


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db = Depends(get_db),
) -> CurrentUser:
    """Resolve and return the authenticated user from JWT bearer token."""

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")
        if subject is None:
            raise credentials_error
        user_id = int(subject)
    except (JWTError, ValueError) as exc:
        raise credentials_error from exc

    user = await db["users"].find_one({"id": user_id})
    if user is None:
        raise credentials_error

    return CurrentUser(
        id=user["id"],
        full_name=user["full_name"],
        email=user["email"],
        phone=user.get("phone"),
        bio=user.get("bio"),
        learning_goals=list(user.get("learning_goals", [])),
    )
