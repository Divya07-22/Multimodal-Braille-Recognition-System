import io
import logging
import time
from typing import Any, Dict

import pytesseract
from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)
pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH


class OCRService:
    def __init__(self):
        logger.info("OCRService initialized")

    async def process_document(
        self,
        file_path: str,
        language: str = "eng",
        use_ml: bool = True,
    ) -> Dict[str, Any]:
        t0 = time.perf_counter()
        try:
            image = Image.open(file_path).convert("RGB")
            if use_ml:
                image = self._preprocess_image(image)

            data = pytesseract.image_to_data(
                image,
                lang=language,
                output_type=pytesseract.Output.DICT,
            )
            text_parts = [
                w for w, c in zip(data["text"], data["conf"])
                if int(c) > 0 and w.strip()
            ]
            confs = [
                int(c) for c in data["conf"]
                if int(c) > 0
            ]
            text = " ".join(text_parts)
            avg_conf = sum(confs) / max(len(confs), 1) / 100.0
            elapsed = (time.perf_counter() - t0) * 1000

            return {
                "text": text,
                "confidence": round(avg_conf, 4),
                "word_count": len(text_parts),
                "processing_time_ms": round(elapsed, 2),
            }
        except Exception as e:
            logger.error(f"OCR failed for {file_path}: {e}")
            raise

    async def process_bytes(self, content: bytes) -> Dict[str, Any]:
        image = Image.open(io.BytesIO(content)).convert("RGB")
        text = pytesseract.image_to_string(image)
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        confs = [int(c) for c in data["conf"] if int(c) > 0]
        words = [w for w in text.split() if w.strip()]
        return {
            "text": text.strip(),
            "confidence": round(sum(confs) / max(len(confs), 1) / 100.0, 4),
            "word_count": len(words),
        }

    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """Basic preprocessing: grayscale + threshold."""
        import numpy as np
        import cv2

        arr = np.array(image)
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        denoised = cv2.fastNlMeansDenoising(binary, h=10)
        return Image.fromarray(denoised)