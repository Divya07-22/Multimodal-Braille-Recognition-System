import cv2
import numpy as np


def denoise_image(image: np.ndarray, method: str = "nlmeans") -> np.ndarray:
    """
    Denoise image using multiple methods.
    method: 'nlmeans' | 'bilateral' | 'gaussian' | 'median'
    """
    if len(image.shape) == 3:
        if method == "nlmeans":
            denoised = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
        elif method == "bilateral":
            denoised = cv2.bilateralFilter(image, 9, 75, 75)
        elif method == "gaussian":
            denoised = cv2.GaussianBlur(image, (5, 5), 0)
        elif method == "median":
            denoised = cv2.medianBlur(image, 5)
        else:
            raise ValueError(f"Unknown denoise method: {method}")
    else:
        if method == "nlmeans":
            denoised = cv2.fastNlMeansDenoising(image, None, 10, 7, 21)
        elif method == "bilateral":
            denoised = cv2.bilateralFilter(image, 9, 75, 75)
        elif method == "gaussian":
            denoised = cv2.GaussianBlur(image, (5, 5), 0)
        elif method == "median":
            denoised = cv2.medianBlur(image, 5)
        else:
            raise ValueError(f"Unknown denoise method: {method}")

    return denoised


def enhance_contrast(image: np.ndarray) -> np.ndarray:
    """CLAHE contrast enhancement for better dot visibility."""
    if len(image.shape) == 3:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l_channel, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l_channel = clahe.apply(l_channel)
        merged = cv2.merge([l_channel, a, b])
        return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
    else:
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        return clahe.apply(image)