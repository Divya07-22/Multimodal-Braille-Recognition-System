import pytest
import torch
import numpy as np
from app.ml.inference.dot_detector_cnn import DotDetectorCNN
from app.ml.inference.cell_classifier_cnn import CellClassifierCNN
from app.core.config import settings


@pytest.fixture
def detector():
    model = DotDetectorCNN()
    model.eval()
    return model


@pytest.fixture
def classifier():
    model = CellClassifierCNN(num_classes=settings.NUM_BRAILLE_CLASSES)
    model.eval()
    return model


def test_detector_forward_shape(detector):
    x = torch.randn(1, 3, settings.IMAGE_SIZE, settings.IMAGE_SIZE)
    with torch.no_grad():
        out = detector(x)
    assert out.shape == (1, 1, settings.IMAGE_SIZE, settings.IMAGE_SIZE)


def test_detector_output_range(detector):
    x = torch.randn(1, 3, settings.IMAGE_SIZE, settings.IMAGE_SIZE)
    with torch.no_grad():
        out = torch.sigmoid(detector(x))
    assert out.min().item() >= 0.0
    assert out.max().item() <= 1.0


def test_classifier_forward_shape(classifier):
    x = torch.randn(4, 1, settings.CELL_SIZE, settings.CELL_SIZE)
    with torch.no_grad():
        out = classifier(x)
    assert out.shape == (4, settings.NUM_BRAILLE_CLASSES)


def test_classifier_softmax_sum(classifier):
    x = torch.randn(2, 1, settings.CELL_SIZE, settings.CELL_SIZE)
    with torch.no_grad():
        logits = classifier(x)
        probs = torch.softmax(logits, dim=1)
    sums = probs.sum(dim=1)
    assert torch.allclose(sums, torch.ones(2), atol=1e-5)


def test_detector_batch(detector):
    x = torch.randn(4, 3, settings.IMAGE_SIZE, settings.IMAGE_SIZE)
    with torch.no_grad():
        out = detector(x)
    assert out.shape[0] == 4


def test_classifier_top1_valid(classifier):
    x = torch.randn(1, 1, settings.CELL_SIZE, settings.CELL_SIZE)
    with torch.no_grad():
        out = classifier(x)
        pred = out.argmax(dim=1).item()
    assert 0 <= pred < settings.NUM_BRAILLE_CLASSES