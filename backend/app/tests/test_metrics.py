import pytest
import numpy as np
from app.ml.evaluation.metrics_report import (
    compute_cer,
    compute_wer,
    compute_precision_recall_f1,
)


def test_cer_identical():
    assert compute_cer("hello", "hello") == 0.0


def test_cer_full_error():
    cer = compute_cer("abc", "xyz")
    assert cer == 1.0


def test_cer_partial():
    cer = compute_cer("hello", "helo")
    assert 0.0 < cer < 1.0


def test_wer_identical():
    assert compute_wer("hello world", "hello world") == 0.0


def test_wer_one_word_wrong():
    wer = compute_wer("hello world", "hello earth")
    assert wer == pytest.approx(0.5, abs=0.01)


def test_wer_empty():
    wer = compute_wer("", "")
    assert wer == 0.0


def test_precision_recall_f1_perfect():
    y_true = np.array([1, 0, 1, 1, 0])
    y_pred = np.array([1, 0, 1, 1, 0])
    metrics = compute_precision_recall_f1(y_true, y_pred)
    assert metrics["precision"] == pytest.approx(1.0)
    assert metrics["recall"] == pytest.approx(1.0)
    assert metrics["f1"] == pytest.approx(1.0)


def test_precision_recall_f1_zeros():
    y_true = np.array([0, 0, 0])
    y_pred = np.array([0, 0, 0])
    metrics = compute_precision_recall_f1(y_true, y_pred)
    assert metrics["precision"] >= 0.0
    assert metrics["recall"] >= 0.0