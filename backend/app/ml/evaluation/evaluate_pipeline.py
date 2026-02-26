"""
End-to-end pipeline evaluation.
Computes CER (Character Error Rate), WER (Word Error Rate),
precision, recall, F1 for both cell detection and classification.
"""
import os
import json
import logging
from typing import List, Dict, Tuple
import numpy as np
import cv2

logger = logging.getLogger(__name__)


def character_error_rate(reference: str, hypothesis: str) -> float:
    """Compute CER using dynamic programming (edit distance / len(reference))."""
    r, h = list(reference), list(hypothesis)
    n, m = len(r), len(h)
    dp = np.zeros((n + 1, m + 1), dtype=np.int32)
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if r[i - 1] == h[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[n][m] / max(n, 1)


def word_error_rate(reference: str, hypothesis: str) -> float:
    """Compute WER."""
    r, h = reference.split(), hypothesis.split()
    n, m = len(r), len(h)
    dp = np.zeros((n + 1, m + 1), dtype=np.int32)
    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            dp[i][j] = dp[i - 1][j - 1] if r[i-1] == h[j-1] else 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[n][m] / max(n, 1)


def compute_detection_metrics(
    pred_boxes: List[np.ndarray],
    gt_boxes: List[np.ndarray],
    iou_threshold: float = 0.5,
) -> Dict[str, float]:
    """Compute Precision, Recall, F1 for detection."""
    if not gt_boxes:
        return {"precision": 0.0, "recall": 0.0, "f1": 0.0}

    tp = 0
    matched = set()
    for pb in pred_boxes:
        for i, gb in enumerate(gt_boxes):
            if i in matched:
                continue
            iou = _compute_iou(pb, gb)
            if iou >= iou_threshold:
                tp += 1
                matched.add(i)
                break

    fp = len(pred_boxes) - tp
    fn = len(gt_boxes) - tp
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    return {"precision": precision, "recall": recall, "f1": f1}


def _compute_iou(box1: np.ndarray, box2: np.ndarray) -> float:
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - inter
    return inter / union if union > 0 else 0.0


def evaluate_full_pipeline(
    test_data: List[Dict],
    pipeline,
    output_path: str = "app/ml/artifacts/evaluation_report.json",
) -> Dict:
    all_cer, all_wer = [], []
    for sample in test_data:
        result = pipeline.run_from_path(sample["image_path"])
        cer = character_error_rate(sample["ground_truth"], result["text"])
        wer = word_error_rate(sample["ground_truth"], result["text"])
        all_cer.append(cer)
        all_wer.append(wer)

    report = {
        "num_samples": len(test_data),
        "mean_cer": float(np.mean(all_cer)),
        "mean_wer": float(np.mean(all_wer)),
        "std_cer": float(np.std(all_cer)),
        "std_wer": float(np.std(all_wer)),
    }
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)
    logger.info(f"Evaluation report saved to {output_path}")
    logger.info(f"Mean CER: {report['mean_cer']:.4f} | Mean WER: {report['mean_wer']:.4f}")
    return report