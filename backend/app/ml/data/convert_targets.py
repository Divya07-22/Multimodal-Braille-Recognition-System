import os
import json
import numpy as np
import cv2

def mask_to_bboxes(mask):
    """Convert binary mask (0 and 255) to list of bounding boxes [x1, y1, x2, y2]."""
    # Threshold mask just in case
    binary = (mask > 0).astype(np.uint8) * 255
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    boxes = []
    labels = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > 2 and h > 2:  # Filter out very small noise
            boxes.append([float(x), float(y), float(x + w), float(y + h)])
            labels.append(1) # Class 1 (braille cell)
            
    return boxes, labels

def main():
    targets_dir = "dot_detector/targets"
    if not os.path.exists(targets_dir):
        print(f"Directory {targets_dir} does not exist.")
        return
        
    files = [f for f in os.listdir(targets_dir) if f.endswith(".npy")]
    print(f"Found {len(files)} .npy files. Converting to .json...")
    
    for f in files:
        mask_path = os.path.join(targets_dir, f)
        mask = np.load(mask_path)
        boxes, labels = mask_to_bboxes(mask)
        
        target_dict = {
            "boxes": boxes,
            "labels": labels
        }
        
        json_path = os.path.join(targets_dir, f.replace(".npy", ".json"))
        with open(json_path, "w") as jf:
            json.dump(target_dict, jf)
            
    print(f"Conversion complete. Created {len(files)} .json files.")

if __name__ == "__main__":
    main()
