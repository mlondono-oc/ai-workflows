from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from supabase_auth.errors import AuthError

from backend.auth.deps import get_bearer_token
from backend.supabase_client import get_auth_client

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserMeResponse(BaseModel):
    id: str
    email: str | None


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest) -> LoginResponse:
    client = get_auth_client()
    try:
        res = client.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
    except AuthError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    if not res.session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return LoginResponse(access_token=res.session.access_token)


@router.get("/me", response_model=UserMeResponse)
def me(token: Annotated[str, Depends(get_bearer_token)]) -> UserMeResponse:
    client = get_auth_client()
    user_res = client.auth.get_user(token)
    if user_res is None or user_res.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    u = user_res.user
    return UserMeResponse(id=str(u.id), email=u.email)
