import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.document import Document
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/bmp",
    "image/tiff", "application/pdf"
}


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}",
        )

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed size (10MB)",
        )

    file_id = str(uuid.uuid4())
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    filename = f"{file_id}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(content)

    document = Document(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=filename,
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type,
        status="uploaded",
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)

    logger.info(f"File uploaded: {filename} by user {current_user.id}")
    return {
        "document_id": document.id,
        "filename": document.original_filename,
        "file_id": file_id,
        "size": len(content),
        "status": "uploaded",
        "message": "File uploaded successfully",
    }