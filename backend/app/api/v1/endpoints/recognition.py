import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.user import User
from app.api.deps import get_current_user
from app.services.recognition_service import RecognitionService

router = APIRouter()
logger = logging.getLogger(__name__)
recognition_service = RecognitionService()


@router.post("/recognize")
async def recognize_braille(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    try:
        result = await recognition_service.recognize_from_bytes(content)
        return {
            "recognized_text": result["text"],
            "braille_cells": result["cells"],
            "confidence": result["confidence"],
            "cell_count": len(result["cells"]),
        }
    except Exception as e:
        logger.error(f"Recognition failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/supported-scripts")
async def get_supported_scripts():
    return {
        "scripts": ["english", "hindi", "math", "music"],
        "default": "english",
    }