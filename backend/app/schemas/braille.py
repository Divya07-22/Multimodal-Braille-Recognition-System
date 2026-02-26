from typing import Any, Dict, Optional
from pydantic import BaseModel


class BrailleConvertRequest(BaseModel):
    document_id: int
    options: Optional[Dict[str, Any]] = {}


class BrailleConvertResponse(BaseModel):
    job_id: int
    document_id: int
    status: str
    message: str


class BrailleTranslateRequest(BaseModel):
    braille_text: str
    grade: int = 1


class BrailleTranslateResponse(BaseModel):
    original: str
    translated: str
    grade: int
    confidence: float


class OCRRequest(BaseModel):
    document_id: int
    language: str = "eng"
    use_ml_enhancement: bool = True


class OCRResponse(BaseModel):
    document_id: int
    extracted_text: str
    confidence: float
    word_count: int
    language: str
    processing_time_ms: float