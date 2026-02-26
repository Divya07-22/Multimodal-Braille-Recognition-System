import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.document import Document
from app.db.models.conversion_job import ConversionJob
from app.api.deps import get_current_user
from app.schemas.braille import (
    BrailleConvertRequest,
    BrailleConvertResponse,
    BrailleTranslateRequest,
    BrailleTranslateResponse,
)
from app.services.braille_service import BrailleService

router = APIRouter()
logger = logging.getLogger(__name__)
braille_service = BrailleService()


@router.post("/convert", response_model=BrailleConvertResponse)
async def convert_braille_image(
    payload: BrailleConvertRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(
            Document.id == payload.document_id,
            Document.user_id == current_user.id,
        )
    )
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    job = ConversionJob(
        user_id=current_user.id,
        document_id=document.id,
        status="pending",
        job_type="braille_conversion",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    background_tasks.add_task(
        braille_service.process_conversion_job,
        job_id=job.id,
        document_path=document.file_path,
        options=payload.options,
    )

    return BrailleConvertResponse(
        job_id=job.id,
        document_id=document.id,
        status="pending",
        message="Conversion job queued successfully",
    )


@router.post("/translate", response_model=BrailleTranslateResponse)
async def translate_braille_unicode(
    payload: BrailleTranslateRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        result = braille_service.translate_braille_to_text(payload.braille_text)
        return BrailleTranslateResponse(
            original=payload.braille_text,
            translated=result["text"],
            grade=result["grade"],
            confidence=result["confidence"],
        )
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail="Translation failed")


@router.get("/grades")
async def get_supported_grades():
    return {
        "grades": [
            {"grade": 1, "description": "Uncontracted Braille - letter by letter"},
            {"grade": 2, "description": "Contracted Braille - uses contractions"},
        ]
    }