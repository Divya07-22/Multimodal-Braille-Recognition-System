import io
import logging
from typing import Optional, Tuple

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

logger = logging.getLogger(__name__)


def load_image_from_bytes(content: bytes) -> np.ndarray:
    """Load image bytes into RGB numpy array."""
    img = Image.open(io.BytesIO(content)).convert("RGB")
    return np.array(img)


def load_image_from_path(path: str) -> np.ndarray:
    """Load image from file path into RGB numpy array."""
    img = Image.open(path).convert("RGB")
    return np.array(img)


def resize_image(
    image: np.ndarray,
    target_size: Tuple[int, int],
    keep_aspect: bool = True,
) -> np.ndarray:
    """Resize image to target (W, H). Pad if keep_aspect=True."""
    h, w = image.shape[:2]
    tw, th = target_size

    if keep_aspect:
        scale = min(tw / w, th / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        canvas = np.full((th, tw, 3), 255, dtype=np.uint8)
        y_off = (th - new_h) // 2
        x_off = (tw - new_w) // 2
        canvas[y_off:y_off + new_h, x_off:x_off + new_w] = resized
        return canvas
    else:
        return cv2.resize(image, (tw, th), interpolation=cv2.INTER_LINEAR)


def normalize_image(image: np.ndarray) -> np.ndarray:
    """Normalize pixel values to [0, 1] float32."""
    return image.astype(np.float32) / 255.0


def denormalize_image(image: np.ndarray) -> np.ndarray:
    """Convert [0, 1] float32 back to uint8."""
    return (image * 255).clip(0, 255).astype(np.uint8)


def to_grayscale(image: np.ndarray) -> np.ndarray:
    """Convert RGB numpy array to grayscale."""
    if len(image.shape) == 2:
        return image
    return cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)


def binarize(
    image: np.ndarray,
    method: str = "otsu",
    block_size: int = 11,
    C: int = 2,
) -> np.ndarray:
    """
    Binarize grayscale image.
    method: 'otsu' | 'adaptive' | 'fixed'
    """
    gray = to_grayscale(image) if len(image.shape) == 3 else image

    if method == "otsu":
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    elif method == "adaptive":
        binary = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            block_size, C,
        )
    elif method == "fixed":
        _, binary = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY)
    else:
        raise ValueError(f"Unknown binarize method: {method}")

    return binary


def deskew(image: np.ndarray) -> np.ndarray:
    """Correct skew in a grayscale or binary image using minAreaRect."""
    gray = to_grayscale(image) if len(image.shape) == 3 else image
    coords = np.column_stack(np.where(gray < 128))
    if len(coords) < 5:
        return image
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = 90 + angle
    if abs(angle) < 0.3:
        return image
    h, w = image.shape[:2]
    M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
    rotated = cv2.warpAffine(
        image, M, (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )
    logger.debug(f"Deskewed by {angle:.2f}°")
    return rotated


def denoise(image: np.ndarray, h: int = 10) -> np.ndarray:
    """Apply Non-local Means Denoising."""
    gray = to_grayscale(image) if len(image.shape) == 3 else image
    return cv2.fastNlMeansDenoising(gray, h=h)


def enhance_contrast(image: np.ndarray, clip_limit: float = 2.0) -> np.ndarray:
    """Apply CLAHE contrast enhancement."""
    gray = to_grayscale(image) if len(image.shape) == 3 else image
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(8, 8))
    return clahe.apply(gray)


def detect_edges(image: np.ndarray, low: int = 50, high: int = 150) -> np.ndarray:
    """Canny edge detection."""
    gray = to_grayscale(image) if len(image.shape) == 3 else image
    return cv2.Canny(gray, low, high)


def crop_region(
    image: np.ndarray,
    x: int, y: int, w: int, h: int,
) -> np.ndarray:
    """Crop rectangular region from image."""
    return image[y:y + h, x:x + w]


def pad_image(
    image: np.ndarray,
    pad: int,
    value: int = 255,
) -> np.ndarray:
    """Add uniform padding around image."""
    if len(image.shape) == 3:
        return cv2.copyMakeBorder(image, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=(value, value, value))
    return cv2.copyMakeBorder(image, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=value)


def image_to_pil(image: np.ndarray) -> Image.Image:
    """Convert numpy array to PIL Image."""
    if len(image.shape) == 2:
        return Image.fromarray(image, mode="L")
    return Image.fromarray(image, mode="RGB")


def pil_to_numpy(image: Image.Image) -> np.ndarray:
    """Convert PIL Image to numpy array."""
    return np.array(image)


def validate_image_shape(image: np.ndarray, min_size: int = 32) -> bool:
    """Check image has valid dimensions."""
    if image is None:
        return False
    if len(image.shape) < 2:
        return False
    h, w = image.shape[:2]
    return h >= min_size and w >= min_size


def get_image_stats(image: np.ndarray) -> dict:
    """Return basic image statistics."""
    gray = to_grayscale(image) if len(image.shape) == 3 else image
    return {
        "height": image.shape[0],
        "width": image.shape[1],
        "channels": image.shape[2] if len(image.shape) == 3 else 1,
        "mean_pixel": float(np.mean(gray)),
        "std_pixel": float(np.std(gray)),
        "min_pixel": int(np.min(gray)),
        "max_pixel": int(np.max(gray)),
    }