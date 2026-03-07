import pytest
import numpy as np
from PIL import Image
import io
from app.services.ocr_service import OCRService
from unittest.mock import patch


@pytest.fixture
def ocr_service():
    return OCRService()


def _make_white_image_bytes(w=200, h=100) -> bytes:
    img = Image.fromarray(np.full((h, w, 3), 255, dtype=np.uint8))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.mark.asyncio
async def test_ocr_process_bytes_returns_dict(ocr_service):
    with patch("app.services.ocr_service.pytesseract.image_to_string", return_value="mock text"), \
         patch("app.services.ocr_service.pytesseract.image_to_data", return_value={"text": ["mock", "text"], "conf": ["95", "92"]}):
        content = _make_white_image_bytes()
        result = await ocr_service.process_bytes(content)
        assert "text" in result
        assert "confidence" in result
        assert "word_count" in result


@pytest.mark.asyncio
async def test_ocr_empty_image(ocr_service):
    with patch("app.services.ocr_service.pytesseract.image_to_string", return_value=""), \
         patch("app.services.ocr_service.pytesseract.image_to_data", return_value={"text": [], "conf": []}):
        content = _make_white_image_bytes()
        result = await ocr_service.process_bytes(content)
        assert isinstance(result["text"], str)
        assert result["word_count"] >= 0


@pytest.mark.asyncio
async def test_ocr_confidence_range(ocr_service):
    with patch("app.services.ocr_service.pytesseract.image_to_string", return_value="mock text"), \
         patch("app.services.ocr_service.pytesseract.image_to_data", return_value={"text": ["mock", "text"], "conf": ["95", "92"]}):
        content = _make_white_image_bytes()
        result = await ocr_service.process_bytes(content)
        assert 0.0 <= result["confidence"] <= 1.0
