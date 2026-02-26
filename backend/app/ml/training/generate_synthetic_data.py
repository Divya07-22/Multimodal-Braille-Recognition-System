"""
Generate synthetic Braille cell images for training.
Creates all 64 possible dot patterns (Grade 1 Braille) with
realistic rendering including noise, blur, and illumination variation.
"""
import os
import json
import random
import numpy as np
import cv2
from itertools import product
from typing import Tuple


BRAILLE_DOT_POSITIONS = [
    (0, 0), (1, 0),   # dots 1, 4
    (0, 1), (1, 1),   # dots 2, 5
    (0, 2), (1, 2),   # dots 3, 6
]


def render_braille_cell(
    pattern: int,
    cell_size: int = 32,
    dot_radius: int = 4,
    add_noise: bool = True,
    background: int = 255,
    dot_color: int = 0,
) -> np.ndarray:
    """
    Render a single Braille cell as a grayscale image.
    pattern: integer 0-63 where each bit = presence of dot 1-6
    """
    img = np.full((cell_size, cell_size), background, dtype=np.uint8)
    col_step = cell_size // 3
    row_step = cell_size // 4

    for bit_idx, (col, row) in enumerate(BRAILLE_DOT_POSITIONS):
        if pattern & (1 << bit_idx):
            cx = col_step + col * col_step
            cy = row_step + row * row_step
            # Add jitter for realism
            if add_noise:
                cx += random.randint(-2, 2)
                cy += random.randint(-2, 2)
                r = dot_radius + random.randint(-1, 1)
            else:
                r = dot_radius
            cx = max(r, min(cell_size - r, cx))
            cy = max(r, min(cell_size - r, cy))
            cv2.circle(img, (cx, cy), r, dot_color, -1)

    if add_noise:
        # Gaussian noise
        noise = np.random.normal(0, 10, img.shape).astype(np.int16)
        img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        # Random blur
        if random.random() > 0.5:
            k = random.choice([3, 5])
            img = cv2.GaussianBlur(img, (k, k), 0)
        # Random brightness
        factor = random.uniform(0.8, 1.2)
        img = np.clip(img.astype(np.float32) * factor, 0, 255).astype(np.uint8)

    return img


def generate_dataset(
    output_dir: str = "app/ml/data/synthetic/cells",
    samples_per_class: int = 500,
    cell_size: int = 32,
    val_ratio: float = 0.15,
    test_ratio: float = 0.05,
):
    """Generate synthetic dataset for all 64 Braille patterns."""
    print(f"Generating {64 * samples_per_class} synthetic braille cell images...")
    annotation = []

    for pattern in range(64):
        class_dir = os.path.join(output_dir, f"class_{pattern:02d}")
        os.makedirs(class_dir, exist_ok=True)

        for i in range(samples_per_class):
            img = render_braille_cell(
                pattern=pattern,
                cell_size=cell_size,
                dot_radius=random.randint(3, 5),
                add_noise=True,
            )
            fname = f"cell_{pattern:02d}_{i:04d}.png"
            cv2.imwrite(os.path.join(class_dir, fname), img)
            annotation.append({
                "filename": os.path.join(f"class_{pattern:02d}", fname),
                "pattern": pattern,
                "dots": [bool(pattern & (1 << k)) for k in range(6)],
            })

    annotation_path = os.path.join(output_dir, "annotations.json")
    with open(annotation_path, "w") as f:
        json.dump(annotation, f, indent=2)

    print(f"Done. Dataset saved to: {output_dir}")
    print(f"Total samples: {len(annotation)}")


if __name__ == "__main__":
    generate_dataset()