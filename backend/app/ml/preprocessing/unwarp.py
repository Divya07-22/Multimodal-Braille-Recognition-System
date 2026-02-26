import cv2
import numpy as np


def unwarp_image(image: np.ndarray) -> np.ndarray:
    """
    Correct curved/warped documents using thin-plate spline-like approach
    via grid-based remapping derived from detected line curvature.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image

    # Detect horizontal text lines via horizontal projection
    binary = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 31, 10
    )
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    detected_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, horizontal_kernel)

    contours, _ = cv2.findContours(detected_lines, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if len(contours) < 3:
        return image

    # Fit polynomial to each line's centerline
    line_curves = []
    for cnt in sorted(contours, key=lambda c: cv2.boundingRect(c)[1]):
        x, y, w, h = cv2.boundingRect(cnt)
        if w < image.shape[1] * 0.3:
            continue
        pts = cnt.reshape(-1, 2)
        if len(pts) < 10:
            continue
        # Fit a 2nd-degree polynomial y = f(x)
        coeffs = np.polyfit(pts[:, 0], pts[:, 1], 2)
        line_curves.append(coeffs)

    if len(line_curves) < 2:
        return image

    # Build remapping grid — straighten curves
    h, w = image.shape[:2]
    map_x = np.tile(np.arange(w, dtype=np.float32), (h, 1))
    map_y = np.tile(np.arange(h, dtype=np.float32).reshape(-1, 1), (1, w))

    avg_coeffs = np.mean(line_curves, axis=0)
    xs = np.arange(w, dtype=np.float32)
    curve_y = np.polyval(avg_coeffs, xs)
    mid_y = h / 2.0
    correction = mid_y - curve_y

    for row in range(h):
        alpha = row / h
        map_y[row] += correction * np.sin(np.pi * alpha)

    unwarped = cv2.remap(image, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    return unwarped