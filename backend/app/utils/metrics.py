import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    top_k_accuracy_score,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Text Recognition Metrics
# ---------------------------------------------------------------------------

def levenshtein_distance(s1: Any, s2: Any) -> int:
    if isinstance(s1, str):
        s1, s2 = list(s1), list(s2)
    m, n = len(s1), len(s2)
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev = dp[:]
        dp[0] = i
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[j] = prev[j - 1]
            else:
                dp[j] = 1 + min(prev[j], dp[j - 1], prev[j - 1])
    return dp[n]


def compute_cer(reference: str, hypothesis: str) -> float:
    """Character Error Rate = edit_distance / len(reference)."""
    if len(reference) == 0:
        return 0.0 if len(hypothesis) == 0 else 1.0
    return round(levenshtein_distance(reference, hypothesis) / len(reference), 6)


def compute_wer(reference: str, hypothesis: str) -> float:
    """Word Error Rate = edit_distance(words) / len(ref_words)."""
    ref_words = reference.strip().split()
    hyp_words = hypothesis.strip().split()
    if len(ref_words) == 0:
        return 0.0 if len(hyp_words) == 0 else 1.0
    return round(levenshtein_distance(ref_words, hyp_words) / len(ref_words), 6)


def compute_exact_match(reference: str, hypothesis: str) -> float:
    return 1.0 if reference.strip() == hypothesis.strip() else 0.0


def compute_bleu_score(
    references: List[str],
    hypotheses: List[str],
    max_n: int = 4,
) -> float:
    try:
        from nltk.translate.bleu_score import corpus_bleu, SmoothingFunction
        smoothie = SmoothingFunction().method4
        ref_tokenized = [[ref.split()] for ref in references]
        hyp_tokenized = [hyp.split() for hyp in hypotheses]
        score = corpus_bleu(ref_tokenized, hyp_tokenized, smoothing_function=smoothie)
        return round(float(score), 6)
    except ImportError:
        logger.warning("nltk not installed — BLEU score unavailable")
        return 0.0
    except Exception as e:
        logger.warning(f"BLEU computation failed: {e}")
        return 0.0


def compute_batch_cer(
    references: List[str],
    hypotheses: List[str],
) -> Dict[str, float]:
    cers = [compute_cer(r, h) for r, h in zip(references, hypotheses)]
    return {
        "mean_cer": round(float(np.mean(cers)), 6),
        "min_cer":  round(float(np.min(cers)), 6),
        "max_cer":  round(float(np.max(cers)), 6),
        "std_cer":  round(float(np.std(cers)), 6),
        "num_samples": len(cers),
    }


def compute_batch_wer(
    references: List[str],
    hypotheses: List[str],
) -> Dict[str, float]:
    wers = [compute_wer(r, h) for r, h in zip(references, hypotheses)]
    return {
        "mean_wer": round(float(np.mean(wers)), 6),
        "min_wer":  round(float(np.min(wers)), 6),
        "max_wer":  round(float(np.max(wers)), 6),
        "std_wer":  round(float(np.std(wers)), 6),
        "num_samples": len(wers),
    }


# ---------------------------------------------------------------------------
# Detection Metrics
# ---------------------------------------------------------------------------

def compute_iou(
    box_a: Tuple[int, int, int, int],
    box_b: Tuple[int, int, int, int],
) -> float:
    """IoU between two (x, y, w, h) bounding boxes."""
    ax, ay, aw, ah = box_a
    bx, by, bw, bh = box_b
    ax2, ay2 = ax + aw, ay + ah
    bx2, by2 = bx + bw, by + bh

    inter_x1 = max(ax, bx)
    inter_y1 = max(ay, by)
    inter_x2 = min(ax2, bx2)
    inter_y2 = min(ay2, by2)

    inter_w = max(0, inter_x2 - inter_x1)
    inter_h = max(0, inter_y2 - inter_y1)
    inter_area = inter_w * inter_h

    union_area = aw * ah + bw * bh - inter_area
    if union_area <= 0:
        return 0.0
    return round(inter_area / union_area, 6)


def compute_mask_iou(
    pred_mask: np.ndarray,
    true_mask: np.ndarray,
    threshold: float = 0.5,
) -> float:
    """IoU between predicted probability mask and binary ground truth."""
    pred_bin = (pred_mask > threshold).astype(np.uint8)
    true_bin = (true_mask > threshold).astype(np.uint8)
    intersection = np.logical_and(pred_bin, true_bin).sum()
    union        = np.logical_or(pred_bin, true_bin).sum()
    if union == 0:
        return 1.0
    return round(float(intersection / union), 6)


def compute_dice_coefficient(
    pred_mask: np.ndarray,
    true_mask: np.ndarray,
    threshold: float = 0.5,
    smooth: float = 1e-6,
) -> float:
    """Dice coefficient for binary segmentation masks."""
    pred_bin = (pred_mask > threshold).astype(np.float32)
    true_bin = (true_mask > threshold).astype(np.float32)
    intersection = (pred_bin * true_bin).sum()
    return round(
        float((2.0 * intersection + smooth) / (pred_bin.sum() + true_bin.sum() + smooth)),
        6,
    )


def compute_pixel_accuracy(
    pred_mask: np.ndarray,
    true_mask: np.ndarray,
    threshold: float = 0.5,
) -> float:
    """Pixel-level accuracy for segmentation masks."""
    pred_bin = (pred_mask > threshold).astype(np.uint8)
    true_bin = (true_mask > threshold).astype(np.uint8)
    correct  = (pred_bin == true_bin).sum()
    return round(float(correct / true_bin.size), 6)


def compute_average_precision(
    y_true: np.ndarray,
    y_scores: np.ndarray,
) -> float:
    """Average Precision (AP) via precision-recall curve area."""
    sorted_idx    = np.argsort(-y_scores)
    y_true_sorted = y_true[sorted_idx]
    tp_cumsum     = np.cumsum(y_true_sorted)
    total_pos     = y_true.sum()
    if total_pos == 0:
        return 0.0
    precisions = tp_cumsum / (np.arange(len(y_true)) + 1)
    recalls    = tp_cumsum / total_pos
    precisions = np.concatenate([[1.0], precisions])
    recalls    = np.concatenate([[0.0], recalls])
    return round(abs(float(np.trapz(precisions, recalls))), 6)


def compute_map(
    y_true_list: List[np.ndarray],
    y_scores_list: List[np.ndarray],
) -> float:
    """Mean Average Precision (mAP) over multiple classes."""
    aps = [
        compute_average_precision(yt, ys)
        for yt, ys in zip(y_true_list, y_scores_list)
    ]
    return round(float(np.mean(aps)), 6)


# ---------------------------------------------------------------------------
# Classification Metrics
# ---------------------------------------------------------------------------

def compute_precision_recall_f1(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    average: str = "macro",
    zero_division: int = 0,
) -> Dict[str, float]:
    """Precision, Recall, F1, Accuracy for classification."""
    return {
        "precision": round(float(precision_score(
            y_true, y_pred, average=average, zero_division=zero_division)), 6),
        "recall":    round(float(recall_score(
            y_true, y_pred, average=average, zero_division=zero_division)), 6),
        "f1":        round(float(f1_score(
            y_true, y_pred, average=average, zero_division=zero_division)), 6),
        "accuracy":  round(float(accuracy_score(y_true, y_pred)), 6),
    }


def compute_top_k_accuracy(
    y_true: np.ndarray,
    y_scores: np.ndarray,
    k: int = 5,
) -> float:
    """Top-K accuracy for multi-class classification."""
    try:
        return round(float(top_k_accuracy_score(y_true, y_scores, k=k)), 6)
    except Exception as e:
        logger.warning(f"Top-K accuracy failed: {e}")
        return 0.0


def compute_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    normalize: Optional[str] = None,
) -> np.ndarray:
    """Confusion matrix. normalize: None | 'true' | 'pred' | 'all'"""
    return confusion_matrix(y_true, y_pred, normalize=normalize)


def compute_per_class_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    class_names: Optional[List[str]] = None,
) -> Dict[str, Dict[str, float]]:
    """Per-class precision, recall, F1, support."""
    classes = np.unique(np.concatenate([y_true, y_pred]))
    result: Dict[str, Dict[str, float]] = {}
    for cls in classes:
        key  = class_names[cls] if class_names and cls < len(class_names) else str(cls)
        tp   = int(((y_pred == cls) & (y_true == cls)).sum())
        fp   = int(((y_pred == cls) & (y_true != cls)).sum())
        fn   = int(((y_pred != cls) & (y_true == cls)).sum())
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec  = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1   = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0
        result[key] = {
            "precision": round(prec, 6),
            "recall":    round(rec,  6),
            "f1":        round(f1,   6),
            "support":   int((y_true == cls).sum()),
        }
    return result


def compute_roc_auc(
    y_true: np.ndarray,
    y_scores: np.ndarray,
    multi_class: str = "ovr",
) -> float:
    """ROC-AUC score for binary or multiclass."""
    try:
        return round(float(roc_auc_score(y_true, y_scores, multi_class=multi_class)), 6)
    except Exception as e:
        logger.warning(f"ROC-AUC failed: {e}")
        return 0.0


# ---------------------------------------------------------------------------
# Regression / Confidence Metrics
# ---------------------------------------------------------------------------

def compute_mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return round(float(np.mean(np.abs(y_true - y_pred))), 6)


def compute_mse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return round(float(np.mean((y_true - y_pred) ** 2)), 6)


def compute_rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return round(float(np.sqrt(compute_mse(y_true, y_pred))), 6)


def compute_r2(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    if ss_tot == 0:
        return 1.0 if ss_res == 0 else 0.0
    return round(float(1 - ss_res / ss_tot), 6)


# ---------------------------------------------------------------------------
# Latency / Throughput Metrics
# ---------------------------------------------------------------------------

def compute_latency_stats(latencies_ms: List[float]) -> Dict[str, float]:
    """Full latency statistics from list of ms timings."""
    arr = np.array(latencies_ms, dtype=np.float32)
    return {
        "mean_ms":        round(float(np.mean(arr)), 4),
        "median_ms":      round(float(np.median(arr)), 4),
        "std_ms":         round(float(np.std(arr)), 4),
        "min_ms":         round(float(np.min(arr)), 4),
        "max_ms":         round(float(np.max(arr)), 4),
        "p50_ms":         round(float(np.percentile(arr, 50)), 4),
        "p90_ms":         round(float(np.percentile(arr, 90)), 4),
        "p95_ms":         round(float(np.percentile(arr, 95)), 4),
        "p99_ms":         round(float(np.percentile(arr, 99)), 4),
        "throughput_fps": round(float(1000.0 / np.mean(arr)), 4),
        "num_runs":       len(latencies_ms),
    }


def compute_speedup(baseline_ms: float, optimized_ms: float) -> float:
    """Speedup ratio: baseline / optimized."""
    if optimized_ms <= 0:
        return 0.0
    return round(baseline_ms / optimized_ms, 4)


def compute_memory_reduction(baseline_mb: float, optimized_mb: float) -> float:
    """Percentage memory reduction."""
    if baseline_mb <= 0:
        return 0.0
    return round((baseline_mb - optimized_mb) / baseline_mb * 100, 2)


# ---------------------------------------------------------------------------
# End-to-End Evaluation Summary
# ---------------------------------------------------------------------------

def build_evaluation_summary(
    references: List[str],
    hypotheses: List[str],
    y_true: Optional[np.ndarray] = None,
    y_pred: Optional[np.ndarray] = None,
    latencies_ms: Optional[List[float]] = None,
) -> Dict[str, Any]:
    """Build complete evaluation summary combining text, classification and latency metrics."""
    summary: Dict[str, Any] = {}

    summary["cer"]  = compute_batch_cer(references, hypotheses)
    summary["wer"]  = compute_batch_wer(references, hypotheses)
    summary["bleu"] = compute_bleu_score(references, hypotheses)
    exact_matches   = [compute_exact_match(r, h) for r, h in zip(references, hypotheses)]
    summary["exact_match_accuracy"] = round(float(np.mean(exact_matches)), 6)

    if y_true is not None and y_pred is not None:
        summary["classification"] = compute_precision_recall_f1(y_true, y_pred)

    if latencies_ms:
        summary["latency"] = compute_latency_stats(latencies_ms)

    logger.info(
        f"Evaluation — CER={summary['cer']['mean_cer']:.4f} "
        f"WER={summary['wer']['mean_wer']:.4f} "
        f"BLEU={summary['bleu']:.4f} "
        f"ExactMatch={summary['exact_match_accuracy']:.4f}"
    )
    return summary