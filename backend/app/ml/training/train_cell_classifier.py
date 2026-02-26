"""
Train a lightweight MobileNetV3 cell classifier — optimized for edge deployment.
Uses knowledge distillation from the ResNet-18 teacher model.
"""
import os
import logging
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast
from torchvision import models

from app.ml.training.dataset import get_classification_dataloaders
from app.ml.training.losses import FocalLoss, LabelSmoothingCrossEntropy
from app.ml.training.callbacks import EarlyStopping, ModelCheckpoint, MetricsTracker
from app.ml.training.train_classifier import build_classifier, evaluate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def build_student_model(num_classes: int = 64) -> nn.Module:
    """Lightweight MobileNetV3-Small student model."""
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model


class KnowledgeDistillationLoss(nn.Module):
    """
    Knowledge Distillation Loss.
    L = alpha * CE(student, labels) + (1-alpha) * KL(student, teacher)
    """

    def __init__(self, temperature: float = 4.0, alpha: float = 0.3):
        super().__init__()
        self.T = temperature
        self.alpha = alpha
        self.ce = LabelSmoothingCrossEntropy(smoothing=0.05)
        self.kl = nn.KLDivLoss(reduction="batchmean")

    def forward(
        self,
        student_logits: torch.Tensor,
        teacher_logits: torch.Tensor,
        labels: torch.Tensor,
    ) -> torch.Tensor:
        hard_loss = self.ce(student_logits, labels)
        soft_student = torch.log_softmax(student_logits / self.T, dim=-1)
        soft_teacher = torch.softmax(teacher_logits / self.T, dim=-1)
        distill_loss = self.kl(soft_student, soft_teacher) * (self.T ** 2)
        return self.alpha * hard_loss + (1.0 - self.alpha) * distill_loss


def train_cell_classifier_with_distillation(
    data_dir: str = "app/ml/data/synthetic/cells",
    artifacts_dir: str = "app/ml/artifacts",
    teacher_path: str = "app/ml/artifacts/classifier_best.pt",
    num_epochs: int = 60,
    batch_size: int = 64,
    lr: float = 5e-4,
    num_classes: int = 64,
    image_size: int = 32,
    num_workers: int = 4,
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training student cell classifier on: {device}")

    # Load teacher
    teacher = build_classifier(num_classes=num_classes).to(device)
    if os.path.exists(teacher_path):
        teacher.load_state_dict(torch.load(teacher_path, map_location=device))
        logger.info(f"Loaded teacher model from {teacher_path}")
    teacher.eval()
    for p in teacher.parameters():
        p.requires_grad_(False)

    student = build_student_model(num_classes=num_classes).to(device)
    criterion = KnowledgeDistillationLoss(temperature=4.0, alpha=0.3)
    optimizer = optim.AdamW(student.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-6)
    scaler = GradScaler()

    dataloaders = get_classification_dataloaders(
        root_dir=data_dir, batch_size=batch_size, num_workers=num_workers, image_size=image_size
    )

    early_stopping = EarlyStopping(patience=12, mode="min")
    checkpoint = ModelCheckpoint(artifacts_dir, "cell_classifier", monitor="val_loss", mode="min")
    tracker = MetricsTracker(os.path.join(artifacts_dir, "cell_classifier_metrics.json"))

    for epoch in range(1, num_epochs + 1):
        student.train()
        total_loss = 0.0
        correct = 0
        total = 0

        for images, labels in dataloaders["train"]:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()

            with autocast():
                student_logits = student(images)
                with torch.no_grad():
                    teacher_logits = teacher(images)
                loss = criterion(student_logits, teacher_logits, labels)

            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(student.parameters(), 1.0)
            scaler.step(optimizer)
            scaler.update()

            total_loss += loss.item()
            correct += (student_logits.argmax(1) == labels).sum().item()
            total += labels.size(0)

        val_ce = FocalLoss()
        val_metrics = evaluate(student, dataloaders["val"], val_ce, device)
        scheduler.step()

        metrics = {
            "train_loss": total_loss / len(dataloaders["train"]),
            "train_accuracy": correct / total,
            "val_loss": val_metrics["loss"],
            "val_accuracy": val_metrics["accuracy"],
        }
        tracker.update(metrics, epoch)
        checkpoint(student, val_metrics["loss"], epoch)
        logger.info(f"Epoch {epoch}/{num_epochs} | Val Loss: {val_metrics['loss']:.4f} Acc: {val_metrics['accuracy']:.4f}")

        if early_stopping(val_metrics["loss"]):
            break

    logger.info("Cell classifier training complete.")


if __name__ == "__main__":
    train_cell_classifier_with_distillation()