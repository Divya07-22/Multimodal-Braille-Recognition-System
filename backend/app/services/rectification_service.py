import logging
import numpy as np
import cv2
from PIL import Image

logger = logging.getLogger(__name__)


class RectificationService:
    """Geometric rectification: perspective correction + deskew."""

    def rectify(self, image: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        corrected = self._deskew(gray)
        return corrected

    def _deskew(self, gray: np.ndarray) -> np.ndarray:
        coords = np.column_stack(np.where(gray < 128))
        if len(coords) == 0:
            return gray
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = 90 + angle
        if abs(angle) < 0.5:
            return gray
        h, w = gray.shape
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            gray, M, (w, h),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE,
        )
        logger.debug(f"Deskewed image by {angle:.2f} degrees")
        return rotated

    def perspective_correct(
        self, image: np.ndarray, corners: np.ndarray
    ) -> np.ndarray:
        """Apply perspective transform given 4 corner points."""
        h, w = image.shape[:2]
        dst = np.array(
            [[0, 0], [w - 1, 0], [w - 1, h - 1], [0, h - 1]],
            dtype=np.float32,
        )
        M = cv2.getPerspectiveTransform(corners.astype(np.float32), dst)
        return cv2.warpPerspective(image, M, (w, h))