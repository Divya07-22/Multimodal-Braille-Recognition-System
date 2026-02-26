import logging
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.models.user import User

logger = logging.getLogger(__name__)


class UserService:
    async def get_by_id(self, db: AsyncSession, user_id: int) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_all(
        self, db: AsyncSession, skip: int = 0, limit: int = 20
    ) -> tuple[List[User], int]:
        total_r = await db.execute(select(func.count()).select_from(User))
        total = total_r.scalar()
        result = await db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all(), total

    async def deactivate(self, db: AsyncSession, user_id: int) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.is_active = False
            await db.commit()
            await db.refresh(user)
        return user