import os
import json
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import albumentations as A
from albumentations.pytorch import ToTensorV2
from typing import Tuple, List, Dict, Optional
from app.ml.training.augmentations import get_train_transforms, get_val_transforms


class BrailleCellDataset(Dataset):
    """
    Dataset for Braille cell classification.
    Expects directory structure:
        data/
          class_0/  (dot pattern 000000)
          class_1/  (dot pattern 100000)
          ...
          class_63/ (dot pattern 111111)
    """

    BRAILLE_UNICODE_OFFSET = 0x2800

    def __init__(
        self,
        root_dir: str,
        transform: Optional[A.Compose] = None,
        split: str = "train",
        val_split: float = 0.15,
        test_split: float = 0.05,
        seed: int = 42,
    ):
        self.root_dir = root_dir
        self.transform = transform
        self.split = split
        self.samples: List[Tuple[str, int]] = []
        self.class_to_idx: Dict[str, int] = {}
        self._load_samples(val_split, test_split, seed)

    def _load_samples(self, val_split: float, test_split: float, seed: int):
        classes = sorted([
            d for d in os.listdir(self.root_dir)
            if os.path.isdir(os.path.join(self.root_dir, d))
        ])
        self.class_to_idx = {c: i for i, c in enumerate(classes)}

        all_samples = []
        for cls in classes:
            cls_dir = os.path.join(self.root_dir, cls)
            for fname in os.listdir(cls_dir):
                if fname.lower().endswith((".png", ".jpg", ".jpeg", ".bmp")):
                    all_samples.append((os.path.join(cls_dir, fname), self.class_to_idx[cls]))

        rng = np.random.RandomState(seed)
        indices = rng.permutation(len(all_samples))
        n_test = int(len(all_samples) * test_split)
        n_val = int(len(all_samples) * val_split)

        if self.split == "test":
            selected = indices[:n_test]
        elif self.split == "val":
            selected = indices[n_test: n_test + n_val]
        else:
            selected = indices[n_test + n_val:]

        self.samples = [all_samples[i] for i in selected]

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        path, label = self.samples[idx]
        image = np.array(Image.open(path).convert("RGB"))

        if self.transform:
            augmented = self.transform(image=image)
            image = augmented["image"]
        else:
            image = torch.from_numpy(image).permute(2, 0, 1).float() / 255.0

        return image, label


class BrailleDotDetectorDataset(Dataset):
    """
    Dataset for dot detection (object detection).
    Expects:
        data/dot_detector/images/  -> .png files
        data/dot_detector/targets/ -> .json files with {boxes: [[x1,y1,x2,y2,...]], labels: [0]}
    """

    def __init__(
        self,
        images_dir: str,
        targets_dir: str,
        transform: Optional[A.Compose] = None,
        image_size: int = 640,
    ):
        self.images_dir = images_dir
        self.targets_dir = targets_dir
        self.transform = transform
        self.image_size = image_size
        self.image_files = sorted([
            f for f in os.listdir(images_dir)
            if f.lower().endswith((".png", ".jpg", ".jpeg"))
        ])

    def __len__(self) -> int:
        return len(self.image_files)

    def __getitem__(self, idx: int):
        fname = self.image_files[idx]
        img_path = os.path.join(self.images_dir, fname)
        target_path = os.path.join(
            self.targets_dir, fname.rsplit(".", 1)[0] + ".json"
        )

        image = np.array(Image.open(img_path).convert("RGB"))
        with open(target_path) as f:
            annotation = json.load(f)

        boxes = np.array(annotation["boxes"], dtype=np.float32)
        labels = np.array(annotation["labels"], dtype=np.int64)

        if self.transform:
            if len(boxes) > 0:
                transformed = self.transform(
                    image=image,
                    bboxes=boxes.tolist(),
                    class_labels=labels.tolist(),
                )
                image = transformed["image"]
                boxes = np.array(transformed["bboxes"], dtype=np.float32) if transformed["bboxes"] else np.zeros((0, 4), dtype=np.float32)
                labels = np.array(transformed["class_labels"], dtype=np.int64)
            else:
                transformed = self.transform(image=image, bboxes=[], class_labels=[])
                image = transformed["image"]

        target = {
            "boxes": torch.as_tensor(boxes if len(boxes) > 0 else np.zeros((0, 4)), dtype=torch.float32),
            "labels": torch.as_tensor(labels if len(labels) > 0 else np.zeros(0), dtype=torch.int64),
        }
        return image, target


def get_classification_dataloaders(
    root_dir: str,
    batch_size: int = 32,
    num_workers: int = 4,
    image_size: int = 32,
) -> Dict[str, DataLoader]:
    train_transform = get_train_transforms(image_size)
    val_transform = get_val_transforms(image_size)

    train_ds = BrailleCellDataset(root_dir, transform=train_transform, split="train")
    val_ds = BrailleCellDataset(root_dir, transform=val_transform, split="val")
    test_ds = BrailleCellDataset(root_dir, transform=val_transform, split="test")

    return {
        "train": DataLoader(train_ds, batch_size=batch_size, shuffle=True,
                            num_workers=num_workers, pin_memory=True, drop_last=True),
        "val": DataLoader(val_ds, batch_size=batch_size, shuffle=False,
                          num_workers=num_workers, pin_memory=True),
        "test": DataLoader(test_ds, batch_size=batch_size, shuffle=False,
                           num_workers=num_workers, pin_memory=True),
    }