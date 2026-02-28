"""
Train Braille Cell Classifier CNN.
Uses ResNet-18 backbone with custom head for 64-class classification.
Includes: mixed precision, cosine annealing LR, label smoothing, focal loss.
"""
import os
import json
import logging
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast
from torchvision import models
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

from app.ml.training.dataset import get_classification_dataloaders
from app.ml.training.losses import LabelSmoothingCrossEntropy, FocalLoss
from app.ml.training.callbacks import EarlyStopping, ModelCheckpoint, MetricsTracker
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def build_classifier(num_classes: int = 64, pretrained: bool = True) -> nn.Module:
    """Build ResNet-18 based classifier for Braille cells."""
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT if pretrained else None)
    # Modify first conv for single-channel or keep RGB
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(0.3),
        nn.Linear(256, num_classes),
    )
    return model


def train_one_epoch(
    model: nn.Module,
    loader,
    optimizer: optim.Optimizer,
    criterion: nn.Module,
    scaler: GradScaler,
    device: torch.device,
    epoch: int,
) -> dict:
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (images, labels) in enumerate(loader):
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()

        with autocast():
            logits = model(images)
            loss = criterion(logits, labels)

        scaler.scale(loss).backward()
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        scaler.step(optimizer)
        scaler.update()

        total_loss += loss.item()
        preds = logits.argmax(dim=1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

        if batch_idx % 50 == 0:
            logger.info(f"Epoch {epoch} [{batch_idx}/{len(loader)}] Loss: {loss.item():.4f}")

    return {
        "loss": total_loss / len(loader),
        "accuracy": correct / total,
    }


@torch.no_grad()
def evaluate(
    model: nn.Module,
    loader,
    criterion: nn.Module,
    device: torch.device,
) -> dict:
    model.eval()
    total_loss = 0.0
    all_preds = []
    all_labels = []

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        with autocast():
            logits = model(images)
            loss = criterion(logits, labels)
        total_loss += loss.item()
        preds = logits.argmax(dim=1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)
    accuracy = (all_preds == all_labels).mean()

    return {
        "loss": total_loss / len(loader),
        "accuracy": float(accuracy),
        "preds": all_preds,
        "labels": all_labels,
    }


def train_classifier(
    data_dir: str = "app/ml/data/synthetic/cells",
    artifacts_dir: str = "app/ml/artifacts",
    num_epochs: int = 80,
    batch_size: int = 64,
    lr: float = 1e-3,
    weight_decay: float = 1e-4,
    num_classes: int = 256,
    image_size: int = 32,
    num_workers: int = 4,
    cell_size: int = 32,
    epochs: int = 20,
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training on device: {device}")

    dataloaders = get_classification_dataloaders(
        root_dir=data_dir,
        batch_size=batch_size,
        num_workers=num_workers,
        image_size=image_size,
    )

    model = build_classifier(num_classes=num_classes).to(device)
    criterion = LabelSmoothingCrossEntropy(smoothing=0.1)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-6)
    scaler = GradScaler()

    early_stopping = EarlyStopping(patience=15, mode="min")
    checkpoint = ModelCheckpoint(
        save_dir=artifacts_dir,
        model_name="classifier",
        monitor="val_loss",
        mode="min",
    )
    tracker = MetricsTracker(os.path.join(artifacts_dir, "classifier_metrics.json"))

    logger.info(f"Starting training: {num_epochs} epochs, {len(dataloaders['train'])} batches/epoch")

    for epoch in range(1, num_epochs + 1):
        train_metrics = train_one_epoch(
            model, dataloaders["train"], optimizer, criterion, scaler, device, epoch
        )
        val_metrics = evaluate(model, dataloaders["val"], criterion, device)
        scheduler.step()

        metrics = {
            "train_loss": train_metrics["loss"],
            "train_accuracy": train_metrics["accuracy"],
            "val_loss": val_metrics["loss"],
            "val_accuracy": val_metrics["accuracy"],
            "lr": optimizer.param_groups[0]["lr"],
        }
        tracker.update(metrics, epoch)
        checkpoint(model, val_metrics["loss"], epoch)

        logger.info(
            f"Epoch {epoch}/{num_epochs} | "
            f"Train Loss: {train_metrics['loss']:.4f} Acc: {train_metrics['accuracy']:.4f} | "
            f"Val Loss: {val_metrics['loss']:.4f} Acc: {val_metrics['accuracy']:.4f}"
        )

        if early_stopping(val_metrics["loss"]):
            logger.info("Early stopping triggered.")
            break

    # Final test evaluation
    test_metrics = evaluate(model, dataloaders["test"], criterion, device)
    report = classification_report(test_metrics["labels"], test_metrics["preds"], output_dict=True)
    with open(os.path.join(artifacts_dir, "classifier_eval_report.json"), "w") as f:
        json.dump(report, f, indent=2)
    logger.info(f"Test Accuracy: {test_metrics['accuracy']:.4f}")
    logger.info("Training complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default="app/ml/data/synthetic/cells")
    parser.add_argument("--artifacts-dir", default="app/ml/artifacts")
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=1e-3)
    args = parser.parse_args()
    train_classifier(
        data_dir=args.data_dir,
        artifacts_dir=args.artifacts_dir,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
    )