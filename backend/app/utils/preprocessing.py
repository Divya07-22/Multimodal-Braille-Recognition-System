import logging
from typing import List, Tuple

import cv2
import numpy as np
import torch
from torchvision import transforms

from app.core.config import settings

logger = logging.getLogger(__name__)

IMAGE_MEAN = [0.485, 0.456, 0.406]
IMAGE_STD  = [0.229, 0.224, 0.225]

_detector_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGE_MEAN, std=IMAGE_STD),
])

_cell_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5], std=[0.5]),
])


def preprocess_for_detector(
    image: np.ndarray,
    size: int = settings.IMAGE_SIZE,
) -> Tuple[torch.Tensor, Tuple[int, int]]:
    """
    Resize + normalize for DotDetectorCNN.
    Returns (tensor [1,3,H,W], original_size (H,W))
    """
    original_size = (image.shape[0], image.shape[1])

    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)

    resized = cv2.resize(image, (size, size), interpolation=cv2.INTER_LINEAR)
    tensor = _detector_transform(resized).unsqueeze(0)
    return tensor, original_size


def preprocess_cell_for_classifier(
    cell: np.ndarray,
    size: int = settings.CELL_SIZE,
) -> torch.Tensor:
    """
    Preprocess a single braille cell crop for CellClassifierCNN.
    Returns tensor [1, 1, CELL_SIZE, CELL_SIZE]
    """
    if len(cell.shape) == 3:
        cell = cv2.cvtColor(cell, cv2.COLOR_RGB2GRAY)

    resized = cv2.resize(cell, (size, size), interpolation=cv2.INTER_AREA)
    tensor = _cell_transform(resized).unsqueeze(0)
    return tensor


def preprocess_cell_batch(
    cells: List[np.ndarray],
    size: int = settings.CELL_SIZE,
) -> torch.Tensor:
    """
    Batch-preprocess a list of cell crops.
    Returns tensor [N, 1, CELL_SIZE, CELL_SIZE]
    """
    tensors = [preprocess_cell_for_classifier(c, size) for c in cells]
    return torch.cat(tensors, dim=0)


def scale_mask_to_original(
    mask: np.ndarray,
    original_size: Tuple[int, int],
) -> np.ndarray:
    """
    Resize a predicted mask back to the original image dimensions.
    original_size: (H, W)
    """
    return cv2.resize(
        mask,
        (original_size[1], original_size[0]),
        interpolation=cv2.INTER_LINEAR,
    )


def extract_cell_crops(
    image: np.ndarray,
    bboxes: List[Tuple[int, int, int, int]],
    padding: int = 2,
) -> List[np.ndarray]:
    """
    Extract cell crops from image given list of (x, y, w, h) bboxes.
    Adds optional padding and clips to image bounds.
    """
    h, w = image.shape[:2]
    crops = []
    for (x, y, bw, bh) in bboxes:
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(w, x + bw + padding)
        y2 = min(h, y + bh + padding)
        crop = image[y1:y2, x1:x2]
        crops.append(crop)
    return crops


def apply_morphology(
    binary: np.ndarray,
    kernel_size: int = 3,
    operation: str = "dilate",
) -> np.ndarray:
    """Apply morphological operation to binary image."""
    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (kernel_size, kernel_size)
    )
    if operation == "dilate":
        return cv2.dilate(binary, kernel, iterations=1)
    elif operation == "erode":
        return cv2.erode(binary, kernel, iterations=1)
    elif operation == "open":
        return cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    elif operation == "close":
        return cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    else:
        raise ValueError(f"Unknown morphology operation: {operation}")


def find_dot_contours(
    mask: np.ndarray,
    min_area: int = 5,
    max_area: int = 2000,
) -> List[Tuple[int, int, int, int]]:
    """
    Find contours of braille dots from binary mask.
    Returns list of (x, y, w, h) bounding boxes.
    """
    contours, _ = cv2.findContours(
        mask.astype(np.uint8),
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )
    bboxes = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if min_area <= area <= max_area:
            x, y, w, h = cv2.boundingRect(cnt)
            bboxes.append((x, y, w, h))
    return bboxes


def sort_bboxes_reading_order(
    bboxes: List[Tuple[int, int, int, int]],
    row_tolerance: int = 10,
) -> List[Tuple[int, int, int, int]]:
    """
    Sort bounding boxes in reading order (top-to-bottom, left-to-right).
    Groups boxes into rows using row_tolerance.
    """
    if not bboxes:
        return []

    sorted_by_y = sorted(bboxes, key=lambda b: b[1])
    rows: List[List[Tuple[int, int, int, int]]] = []
    current_row = [sorted_by_y[0]]

    for bbox in sorted_by_y[1:]:
        if abs(bbox[1] - current_row[-1][1]) <= row_tolerance:
            current_row.append(bbox)
        else:
            rows.append(sorted(current_row, key=lambda b: b[0]))
            current_row = [bbox]
    rows.append(sorted(current_row, key=lambda b: b[0]))

    return [bbox for row in rows for bbox in row]