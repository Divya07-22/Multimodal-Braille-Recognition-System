import pytest
import torch
from app.ml.training.losses import DiceLoss, FocalLoss, LabelSmoothingCrossEntropy


def test_dice_loss_zero():
    loss_fn = DiceLoss()
    pred = torch.ones(2, 1, 64, 64)
    target = torch.ones(2, 1, 64, 64)
    loss = loss_fn(pred, target)
    assert loss.item() < 0.01


def test_dice_loss_max():
    loss_fn = DiceLoss()
    pred = torch.zeros(2, 1, 64, 64)
    target = torch.ones(2, 1, 64, 64)
    loss = loss_fn(pred, target)
    assert loss.item() > 0.5


def test_focal_loss_shape():
    loss_fn = FocalLoss(alpha=0.25, gamma=2.0)
    pred = torch.randn(4, 1, 32, 32)
    target = torch.randint(0, 2, (4, 1, 32, 32)).float()
    loss = loss_fn(pred, target)
    assert loss.item() >= 0.0


def test_label_smoothing_shape():
    loss_fn = LabelSmoothingCrossEntropy(num_classes=64, smoothing=0.1)
    logits = torch.randn(8, 64)
    targets = torch.randint(0, 64, (8,))
    loss = loss_fn(logits, targets)
    assert loss.item() >= 0.0


def test_dice_loss_gradient():
    loss_fn = DiceLoss()
    pred = torch.randn(2, 1, 32, 32, requires_grad=True)
    target = torch.randint(0, 2, (2, 1, 32, 32)).float()
    loss = loss_fn(pred, target)
    loss.backward()
    assert pred.grad is not None