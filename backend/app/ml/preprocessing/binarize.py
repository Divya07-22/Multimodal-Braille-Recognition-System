import cv2
import numpy as np


def binarize_image(image: np.ndarray, method: str = "adaptive") -> np.ndarray:
    """
    Convert image to binary using multiple thresholding strategies.
    method: 'adaptive' | 'otsu' | 'sauvola'
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    if method == "adaptive":
        binary = cv2.adaptiveThreshold(
            gray,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            blockSize=31,
            C=10,
        )
    elif method == "otsu":
        _, binary = cv2.threshold(
            gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
        )
    elif method == "sauvola":
        binary = _sauvola_threshold(gray)
    else:
        raise ValueError(f"Unknown binarization method: {method}")

    # Morphological cleanup
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=1)

    return binary


def _sauvola_threshold(gray: np.ndarray, window_size: int = 25, k: float = 0.2) -> np.ndarray:
    """Sauvola local thresholding for uneven illumination."""
    gray_f = gray.astype(np.float64)
    mean = cv2.boxFilter(gray_f, -1, (window_size, window_size))
    mean_sq = cv2.boxFilter(gray_f ** 2, -1, (window_size, window_size))
    std = np.sqrt(np.maximum(mean_sq - mean ** 2, 0))
    threshold = mean * (1 + k * (std / 128.0 - 1))
    binary = np.where(gray_f < threshold, 255, 0).astype(np.uint8)
    return binary