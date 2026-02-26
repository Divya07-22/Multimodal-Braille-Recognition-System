import logging
import os
from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.models.document import Document

logger = logging.getLogger(__name__)


class DocumentService:
    async def get_by_id(
        self, db: AsyncSession, document_id: int, user_id: int
    ) -> Optional[Document]:
        result = await db.execute(
            select(Document).where(
                Document.id == document_id,
                Document.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_all(
        self, db: AsyncSession, user_id: int, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Document], int]:
        total_r = await db.execute(
            select(func.count()).select_from(Document).where(Document.user_id == user_id)
        )
        total = total_r.scalar()
        result = await db.execute(
            select(Document)
            .where(Document.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .order_by(Document.created_at.desc())
        )
        return result.scalars().all(), total

    async def delete(
        self, db: AsyncSession, document_id: int, user_id: int
    ) -> bool:
        result = await db.execute(
            select(Document).where(
                Document.id == document_id,
                Document.user_id == user_id,
            )
        )
        doc = result.scalar_one_or_none()
        if not doc:
            return False
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
        await db.delete(doc)
        await db.commit()
        return True

    async def update_status(
        self, db: AsyncSession, document_id: int, status: str
    ) -> Optional[Document]:
        result = await db.execute(
            select(Document).where(Document.id == document_id)
        )
        doc = result.scalar_one_or_none()
        if doc:
            doc.status = status
            await db.commit()
            await db.refresh(doc)
        return doc