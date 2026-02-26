import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

# Index -> braille character mapping (64 cells, grade 1)
IDX_TO_CHAR: Dict[int, str] = {
    0: " ", 1: "a", 2: "b", 3: "c", 4: "d", 5: "e",
    6: "f", 7: "g", 8: "h", 9: "i", 10: "j",
    11: "k", 12: "l", 13: "m", 14: "n", 15: "o",
    16: "p", 17: "q", 18: "r", 19: "s", 20: "t",
    21: "u", 22: "v", 23: "w", 24: "x", 25: "y",
    26: "z", 27: "0", 28: "1", 29: "2", 30: "3",
    31: "4", 32: "5", 33: "6", 34: "7", 35: "8",
    36: "9", 37: ".", 38: ",", 39: "!", 40: "?",
    41: ";", 42: ":", 43: "'", 44: '"', 45: "-",
    46: "(", 47: ")", 48: "/", 49: "@", 50: "#",
    51: "$", 52: "%", 53: "&", 54: "*", 55: "+",
    56: "=", 57: "<", 58: ">", 59: "[", 60: "]",
    61: "_", 62: "^", 63: "~",
}


def indices_to_text(indices: List[int]) -> str:
    """Convert list of class indices to text string."""
    return "".join(IDX_TO_CHAR.get(i, "?") for i in indices)


def logits_to_indices(
    logits: np.ndarray,
    threshold: float = 0.0,
) -> List[int]:
    """
    Convert classifier logits [N, C] to predicted class indices.
    threshold: skip cells where max logit < threshold (uncertainty filter)
    """
    indices = []
    for row in logits:
        max_idx = int(np.argmax(row))
        if row[max_idx] >= threshold:
            indices.append(max_idx)
        else:
            indices.append(0)  # map uncertain to space
    return indices


def apply_confidence_filter(
    indices: List[int],
    probs: np.ndarray,
    min_confidence: float = 0.5,
) -> Tuple[List[int], List[float]]:
    """
    Filter classifier predictions by confidence.
    Returns (filtered_indices, confidence_scores)
    """
    filtered = []
    scores = []
    for i, idx in enumerate(indices):
        conf = float(probs[i, idx])
        if conf >= min_confidence:
            filtered.append(idx)
            scores.append(conf)
        else:
            filtered.append(0)
            scores.append(conf)
    return filtered, scores


def nms_bboxes(
    bboxes: List[Tuple[int, int, int, int]],
    scores: List[float],
    iou_threshold: float = 0.5,
) -> List[int]:
    """
    Non-Maximum Suppression for bounding boxes.
    Returns indices of kept boxes.
    bboxes: list of (x, y, w, h)
    """
    if not bboxes:
        return []

    boxes = np.array([[x, y, x + w, y + h] for (x, y, w, h) in bboxes], dtype=np.float32)
    scores_arr = np.array(scores, dtype=np.float32)

    x1, y1, x2, y2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    areas = (x2 - x1 + 1) * (y2 - y1 + 1)
    order = scores_arr.argsort()[::-1]

    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(int(i))
        if order.size == 1:
            break
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        inter_w = np.maximum(0.0, xx2 - xx1 + 1)
        inter_h = np.maximum(0.0, yy2 - yy1 + 1)
        inter = inter_w * inter_h
        iou = inter / (areas[i] + areas[order[1:]] - inter)
        inds = np.where(iou <= iou_threshold)[0]
        order = order[inds + 1]

    return keep


def mask_to_bboxes(
    mask: np.ndarray,
    threshold: float = 0.5,
    min_area: int = 5,
) -> List[Tuple[int, int, int, int]]:
    """Convert probability mask to bounding boxes."""
    import cv2
    binary = (mask > threshold).astype(np.uint8) * 255
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bboxes = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area >= min_area:
            x, y, w, h = cv2.boundingRect(cnt)
            bboxes.append((x, y, w, h))
    return bboxes


def clean_text(text: str) -> str:
    """Post-process recognized text: strip extra spaces, fix punctuation."""
    import re
    text = re.sub(r" {2,}", " ", text)
    text = text.strip()
    return text


def compute_mean_confidence(scores: List[float]) -> float:
    if not scores:
        return 0.0
    return round(float(np.mean(scores)), 4)


def build_cell_metadata(
    bboxes: List[Tuple[int, int, int, int]],
    indices: List[int],
    confidences: List[float],
) -> List[Dict[str, Any]]:
    """Build structured metadata for each detected braille cell."""
    cells = []
    for i, (bbox, idx, conf) in enumerate(zip(bboxes, indices, confidences)):
        x, y, w, h = bbox
        cells.append({
            "cell_id": i,
            "x": x, "y": y, "w": w, "h": h,
            "class_index": idx,
            "character": IDX_TO_CHAR.get(idx, "?"),
            "confidence": round(conf, 4),
        })
    return cells