"""
Train a CNN-based dot presence detector per Braille cell.
Uses a custom lightweight CNN to predict which of 6 dot positions are raised.
This is a multi-label binary classification (6 binary outputs).
"""
import os
import logging
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
from torch.cuda.amp import GradScaler, autocast
import albumentations as A
from albumentations.pytorch import ToTensorV2
from PIL import Image

from app.ml.training.callbacks import EarlyStopping, ModelCheckpoint, MetricsTracker
from app.ml.training.generate_synthetic_data import render_braille_cell

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SyntheticDotDataset(Dataset):
    """On-the-fly synthetic dot pattern dataset."""

    def __init__(self, size: int = 50000, cell_size: int = 32):
        self.size = size
        self.cell_size = cell_size
        self.transform = A.Compose([
            A.RandomBrightnessContrast(p=0.5),
            A.GaussNoise(var_limit=(5, 25), p=0.4),
            A.Normalize(mean=(0.5,), std=(0.5,)),
            ToTensorV2(),
        ])

    def __len__(self):
        return self.size

    def __getitem__(self, idx):
        pattern = np.random.randint(0, 64)
        img = render_braille_cell(pattern, self.cell_size, add_noise=True)
        img_rgb = np.stack([img, img, img], axis=-1)
        transformed = self.transform(image=img_rgb)
        image = transformed["image"]
        label = torch.tensor(
            [(pattern >> i) & 1 for i in range(6)], dtype=torch.float32
        )
        return image, label, pattern


class DotDetectorCNN(nn.Module):
    """Lightweight CNN for 6-dot binary classification."""

    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),                  # 16x16
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),                  # 8x8
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d(1),          # 1x1
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(0.4),
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(64, 6),
        )

    def forward(self, x):
        return self.classifier(self.features(x))


def train_dot_detector(
    artifacts_dir: str = "app/ml/artifacts",
    num_epochs: int = 50,
    batch_size: int = 128,
    lr: float = 1e-3,
    dataset_size: int = 100000,
    cell_size: int = 32,
    num_workers: int = 4,
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training dot detector on: {device}")

    dataset = SyntheticDotDataset(size=dataset_size, cell_size=cell_size)
    val_size = int(0.15 * len(dataset))
    test_size = int(0.05 * len(dataset))
    train_size = len(dataset) - val_size - test_size
    train_ds, val_ds, test_ds = random_split(dataset, [train_size, val_size, test_size])

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)

    model = DotDetectorCNN().to(device)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.OneCycleLR(
        optimizer, max_lr=lr, steps_per_epoch=len(train_loader), epochs=num_epochs
    )
    scaler = GradScaler()

    early_stopping = EarlyStopping(patience=10, mode="min")
    checkpoint = ModelCheckpoint(artifacts_dir, "dot_detector", monitor="val_loss", mode="min")
    tracker = MetricsTracker(os.path.join(artifacts_dir, "dot_detector_metrics.json"))

    for epoch in range(1, num_epochs + 1):
        model.train()
        total_loss = 0.0
        for images, labels, _ in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            with autocast():
                logits = model(images)
                loss = criterion(logits, labels)
            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            scaler.step(optimizer)
            scaler.update()
            scheduler.step()
            total_loss += loss.item()

        # Validation
        model.eval()
        val_loss = 0.0
        all_preds = []
        all_labels = []
        with torch.no_grad():
            for images, labels, _ in val_loader:
                images, labels = images.to(device), labels.to(device)
                logits = model(images)
                val_loss += criterion(logits, labels).item()
                probs = torch.sigmoid(logits)
                preds = (probs > 0.5).float()
                all_preds.append(preds.cpu())
                all_labels.append(labels.cpu())

        all_preds = torch.cat(all_preds)
        all_labels = torch.cat(all_labels)
        dot_accuracy = (all_preds == all_labels).float().mean().item()
        exact_match = ((all_preds == all_labels).all(dim=1)).float().mean().item()

        val_loss /= len(val_loader)
        train_loss = total_loss / len(train_loader)

        metrics = {
            "train_loss": train_loss,
            "val_loss": val_loss,
            "dot_accuracy": dot_accuracy,
            "exact_match_accuracy": exact_match,
        }
        tracker.update(metrics, epoch)
        checkpoint(model, val_loss, epoch)
        logger.info(f"Epoch {epoch}/{num_epochs} | Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Dot Acc: {dot_accuracy:.4f} | Exact: {exact_match:.4f}")

        if early_stopping(val_loss):
            break

    logger.info("Dot detector training complete.")


if __name__ == "__main__":
    train_dot_detector()