import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.document import Document
from app.api.deps import get_current_user
from app.services.ocr_service import OCRService
from app.schemas.braille import OCRRequest, OCRResponse

router = APIRouter()
logger = logging.getLogger(__name__)
ocr_service = OCRService()


@router.post("/process", response_model=OCRResponse)
async def process_ocr(
    payload: OCRRequest,
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

    try:
        ocr_result = await ocr_service.process_document(
            file_path=document.file_path,
            language=payload.language,
            use_ml=payload.use_ml_enhancement,
        )
        return OCRResponse(
            document_id=document.id,
            extracted_text=ocr_result["text"],
            confidence=ocr_result["confidence"],
            word_count=ocr_result["word_count"],
            language=payload.language,
            processing_time_ms=ocr_result["processing_time_ms"],
        )
    except Exception as e:
        logger.error(f"OCR processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")


@router.post("/process-upload")
async def process_ocr_direct_upload(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    try:
        result = await ocr_service.process_bytes(content)
        return {
            "extracted_text": result["text"],
            "confidence": result["confidence"],
            "word_count": result["word_count"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))