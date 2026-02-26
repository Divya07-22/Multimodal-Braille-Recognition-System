import logging
import time
from typing import Any, Dict

logger = logging.getLogger(__name__)


class InferenceService:
    def __init__(self):
        self._pipeline = None
        logger.info("InferenceService initialized")

    def _get_pipeline(self):
        if self._pipeline is None:
            from app.ml.inference.pipeline import BrailleInferencePipeline
            self._pipeline = BrailleInferencePipeline()
        return self._pipeline

    async def run_full_pipeline(
        self,
        image_path: str,
        use_onnx: bool = True,
    ) -> Dict[str, Any]:
        """Run the full braille detection + classification pipeline."""
        t0 = time.perf_counter()
        try:
            pipeline = self._get_pipeline()
            result = await pipeline.run(image_path, use_onnx=use_onnx)
            elapsed = (time.perf_counter() - t0) * 1000
            result["processing_time_ms"] = round(elapsed, 2)
            result["model_version"] = "1.0.0"
            return result
        except Exception as e:
            logger.error(f"Pipeline failed for {image_path}: {e}")
            raise