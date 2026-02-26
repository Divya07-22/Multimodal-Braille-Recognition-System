import io
import logging
from typing import Any, Dict

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


class RecognitionService:
    def __init__(self):
        self._pipeline = None
        logger.info("RecognitionService initialized")

    def _get_pipeline(self):
        if self._pipeline is None:
            from app.ml.inference.pipeline import BrailleInferencePipeline
            self._pipeline = BrailleInferencePipeline()
        return self._pipeline

    async def recognize_from_bytes(self, content: bytes) -> Dict[str, Any]:
        image = Image.open(io.BytesIO(content)).convert("RGB")
        arr = np.array(image)
        pipeline = self._get_pipeline()
        result = await pipeline.run_from_array(arr)
        return result