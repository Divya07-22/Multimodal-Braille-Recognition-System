"""
Train Braille Cell Detector using Faster R-CNN with ResNet-50 FPN backbone.
Detects bounding boxes of individual Braille cells in a full page image.
"""
import os
import json
import logging
import torch
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision.models.detection import fasterrcnn_resnet50_fpn, FasterRCNN_ResNet50_FPN_Weights
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor

from app.ml.training.dataset import BrailleDotDetectorDataset
from app.ml.training.augmentations import get_detection_train_transforms, get_detection_val_transforms
from app.ml.training.callbacks import EarlyStopping, ModelCheckpoint, MetricsTracker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def build_detector(num_classes: int = 2) -> torch.nn.Module:
    """
    num_classes: background(0) + braille_cell(1) = 2
    """
    model = fasterrcnn_resnet50_fpn(weights=FasterRCNN_ResNet50_FPN_Weights.DEFAULT)
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)
    return model


def train_one_epoch_detector(model, loader, optimizer, device, epoch):
    model.train()
    total_loss = 0.0
    for batch_idx, (images, targets) in enumerate(loader):
        images = [img.to(device) for img in images]
        targets = [{k: v.to(device) for k, v in t.items()} for t in targets]

        loss_dict = model(images, targets)
        losses = sum(loss for loss in loss_dict.values())

        optimizer.zero_grad()
        losses.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
        optimizer.step()

        total_loss += losses.item()
        if batch_idx % 20 == 0:
            logger.info(
                f"Epoch {epoch} [{batch_idx}/{len(loader)}] "
                f"Loss: {losses.item():.4f} "
                f"({', '.join([f'{k}: {v.item():.4f}' for k, v in loss_dict.items()])})"
            )

    return {"loss": total_loss / len(loader)}


def collate_fn(batch):
    return tuple(zip(*batch))


def train_detector(
    images_dir: str = "app/ml/data/dot_detector/images",
    targets_dir: str = "app/ml/data/dot_detector/targets",
    artifacts_dir: str = "app/ml/artifacts",
    num_epochs: int = 50,
    batch_size: int = 4,
    lr: float = 5e-4,
    weight_decay: float = 1e-4,
    image_size: int = 640,
    num_workers: int = 2,
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training detector on: {device}")

    train_transform = get_detection_train_transforms(image_size)
    val_transform = get_detection_val_transforms(image_size)

    train_ds = BrailleDotDetectorDataset(images_dir, targets_dir, transform=train_transform, image_size=image_size)
    val_ds = BrailleDotDetectorDataset(images_dir, targets_dir, transform=val_transform, image_size=image_size)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True,
                              num_workers=num_workers, collate_fn=collate_fn, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=1, shuffle=False,
                            num_workers=num_workers, collate_fn=collate_fn, pin_memory=True)

    model = build_detector(num_classes=2).to(device)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=20, gamma=0.3)

    early_stopping = EarlyStopping(patience=12, mode="min")
    checkpoint = ModelCheckpoint(artifacts_dir, "detector", monitor="val_loss", mode="min")
    tracker = MetricsTracker(os.path.join(artifacts_dir, "detector_metrics.json"))

    for epoch in range(1, num_epochs + 1):
        train_metrics = train_one_epoch_detector(model, train_loader, optimizer, device, epoch)
        scheduler.step()

        metrics = {
            "train_loss": train_metrics["loss"],
            "lr": optimizer.param_groups[0]["lr"],
        }
        tracker.update(metrics, epoch)
        checkpoint(model, train_metrics["loss"], epoch)

        logger.info(f"Epoch {epoch}/{num_epochs} | Train Loss: {train_metrics['loss']:.4f}")
        if early_stopping(train_metrics["loss"]):
            logger.info("Early stopping triggered.")
            break

    logger.info("Detector training complete.")


if __name__ == "__main__":
    train_detector()