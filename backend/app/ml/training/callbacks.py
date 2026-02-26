import os
import json
import logging
import numpy as np
import torch
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class EarlyStopping:
    """Stop training when monitored metric stops improving."""

    def __init__(self, patience: int = 10, min_delta: float = 1e-4, mode: str = "min"):
        self.patience = patience
        self.min_delta = min_delta
        self.mode = mode
        self.counter = 0
        self.best_value = float("inf") if mode == "min" else float("-inf")
        self.should_stop = False

    def __call__(self, value: float) -> bool:
        improved = (
            value < self.best_value - self.min_delta
            if self.mode == "min"
            else value > self.best_value + self.min_delta
        )
        if improved:
            self.best_value = value
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.should_stop = True
                logger.info(f"Early stopping triggered after {self.patience} epochs without improvement.")
        return self.should_stop


class ModelCheckpoint:
    """Save best model checkpoint during training."""

    def __init__(
        self,
        save_dir: str,
        model_name: str,
        monitor: str = "val_loss",
        mode: str = "min",
        save_last: bool = True,
    ):
        self.save_dir = save_dir
        self.model_name = model_name
        self.monitor = monitor
        self.mode = mode
        self.save_last = save_last
        self.best_value = float("inf") if mode == "min" else float("-inf")
        os.makedirs(save_dir, exist_ok=True)

    def __call__(self, model: torch.nn.Module, value: float, epoch: int):
        improved = (
            value < self.best_value if self.mode == "min" else value > self.best_value
        )
        if improved:
            self.best_value = value
            best_path = os.path.join(self.save_dir, f"{self.model_name}_best.pt")
            torch.save(model.state_dict(), best_path)
            logger.info(f"Epoch {epoch}: Saved best model ({self.monitor}={value:.6f}) -> {best_path}")

        if self.save_last:
            last_path = os.path.join(self.save_dir, f"{self.model_name}_last.pt")
            torch.save(model.state_dict(), last_path)


class MetricsTracker:
    """Track and persist training metrics to JSON."""

    def __init__(self, save_path: str):
        self.save_path = save_path
        self.history: Dict[str, list] = {}

    def update(self, metrics: Dict[str, Any], epoch: int):
        for k, v in metrics.items():
            if k not in self.history:
                self.history[k] = []
            self.history[k].append({"epoch": epoch, "value": float(v) if isinstance(v, (int, float, np.floating)) else v})
        self._save()

    def _save(self):
        with open(self.save_path, "w") as f:
            json.dump(self.history, f, indent=2)

    def get_best(self, metric: str, mode: str = "min") -> Optional[float]:
        if metric not in self.history:
            return None
        values = [e["value"] for e in self.history[metric]]
        return min(values) if mode == "min" else max(values)