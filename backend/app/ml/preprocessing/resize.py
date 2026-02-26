import numpy as np
from app.core.config import settings


def resize_image(
    image: np.ndarray,
    target_size: int = None,
    keep_aspect: bool = True,
    pad_value: int = 0,
) -> np.ndarray:
    """
    Resize image to target_size x target_size with optional letterboxing.
    """
    target = target_size or settings.IMAGE_SIZE
    h, w = image.shape[:2]

    if not keep_aspect:
        return cv2.resize(image, (target, target), interpolation=cv2.INTER_LINEAR)

    scale = target / max(h, w)
    new_w = int(w * scale)
    new_h = int(h * scale)
    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    # Letterbox padding
    if len(image.shape) == 3:
        canvas = np.full((target, target, image.shape[2]), pad_value, dtype=np.uint8)
    else:
        canvas = np.full((target, target), pad_value, dtype=np.uint8)

    pad_top = (target - new_h) // 2
    pad_left = (target - new_w) // 2
    canvas[pad_top:pad_top + new_h, pad_left:pad_left + new_w] = resized

    return canvas


def resize_cell(image: np.ndarray, cell_size: int = None) -> np.ndarray:
    """Resize a braille cell crop to a fixed size for classification."""
    size = cell_size or settings.CELL_SIZE
    return cv2.resize(image, (size, size), interpolation=cv2.INTER_AREA)