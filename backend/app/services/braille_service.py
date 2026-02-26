import logging
import time
from typing import Any, Dict, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

# Grade 1 Braille unicode map (U+2800–U+283F)
BRAILLE_TO_CHAR: Dict[str, str] = {
    "⠁": "a", "⠃": "b", "⠉": "c", "⠙": "d", "⠑": "e",
    "⠋": "f", "⠛": "g", "⠓": "h", "⠊": "i", "⠚": "j",
    "⠅": "k", "⠇": "l", "⠍": "m", "⠝": "n", "⠕": "o",
    "⠏": "p", "⠟": "q", "⠗": "r", "⠎": "s", "⠞": "t",
    "⠥": "u", "⠧": "v", "⠺": "w", "⠭": "x", "⠽": "y",
    "⠵": "z", "⠀": " ",
}

CHAR_TO_BRAILLE: Dict[str, str] = {v: k for k, v in BRAILLE_TO_CHAR.items()}

# Dot pattern to character map (6-dot braille cell)
DOT_PATTERN_TO_CHAR: Dict[int, str] = {
    0b000001: "a", 0b000011: "b", 0b001001: "c", 0b011001: "d",
    0b010001: "e", 0b001011: "f", 0b011011: "g", 0b010011: "h",
    0b001010: "i", 0b011010: "j", 0b000101: "k", 0b000111: "l",
    0b001101: "m", 0b011101: "n", 0b010101: "o", 0b001111: "p",
    0b011111: "q", 0b010111: "r", 0b001110: "s", 0b011110: "t",
    0b100101: "u", 0b100111: "v", 0b111010: "w", 0b101101: "x",
    0b111101: "y", 0b110101: "z", 0b000000: " ",
}


class BrailleService:
    def __init__(self):
        self._pipeline = None
        logger.info("BrailleService initialized")

    def _get_pipeline(self):
        if self._pipeline is None:
            from app.ml.inference.pipeline import BrailleInferencePipeline
            self._pipeline = BrailleInferencePipeline()
        return self._pipeline

    def translate_braille_to_text(self, braille_text: str) -> Dict[str, Any]:
        """Translate unicode braille string to plain text."""
        t0 = time.perf_counter()
        result_chars = []
        for ch in braille_text:
            mapped = BRAILLE_TO_CHAR.get(ch, ch)
            result_chars.append(mapped)
        text = "".join(result_chars)
        elapsed = (time.perf_counter() - t0) * 1000

        known = sum(1 for ch in braille_text if ch in BRAILLE_TO_CHAR)
        confidence = known / max(len(braille_text), 1)

        return {
            "text": text,
            "grade": 1,
            "confidence": round(confidence, 4),
            "processing_time_ms": round(elapsed, 2),
        }

    def dot_pattern_to_char(self, dot_pattern: int) -> str:
        """Convert 6-bit dot pattern integer to character."""
        return DOT_PATTERN_TO_CHAR.get(dot_pattern, "?")

    def dots_array_to_text(self, dot_patterns: list) -> str:
        """Convert list of 6-bit dot pattern ints to text string."""
        return "".join(self.dot_pattern_to_char(p) for p in dot_patterns)

    async def process_conversion_job(
        self,
        job_id: int,
        document_path: str,
        options: Optional[Dict] = None,
    ) -> None:
        """Background task: run full pipeline and update job in DB."""
        from app.db.session import AsyncSessionLocal
        from app.db.models.conversion_job import ConversionJob
        from sqlalchemy import select
        import datetime

        logger.info(f"Processing conversion job {job_id} for {document_path}")
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(ConversionJob).where(ConversionJob.id == job_id)
            )
            job = result.scalar_one_or_none()
            if not job:
                logger.error(f"Job {job_id} not found")
                return

            job.status = "processing"
            await db.commit()

            try:
                pipeline = self._get_pipeline()
                inference_result = await pipeline.run(document_path)
                job.status = "completed"
                job.result_text = inference_result.get("text", "")
                job.completed_at = datetime.datetime.utcnow()
                logger.info(f"Job {job_id} completed successfully")
            except Exception as e:
                logger.error(f"Job {job_id} failed: {e}")
                job.status = "failed"
                job.error_message = str(e)
                job.completed_at = datetime.datetime.utcnow()

            await db.commit()