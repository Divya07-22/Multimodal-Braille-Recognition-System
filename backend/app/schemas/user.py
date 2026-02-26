from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class UserProfile(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None


class UserListResponse(BaseModel):
    users: List[UserProfile]
    total: int
    skip: int
    limit: int