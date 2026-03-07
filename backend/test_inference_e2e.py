import cv2
import numpy as np
import asyncio
from app.ml.inference.pipeline import BrailleInferencePipeline

def draw_synthetic_braille_text(text="HELLO WORLD"):
    # 64x96 per cell roughly
    img_h, img_w = 200, 800
    img = np.ones((img_h, img_w, 3), dtype=np.uint8) * 255
    
    # Just draw some rectangles simulating braille cells
    # This won't test the *accuracy* of the trained models since they are still training
    # And we're just drawing boxes, but it WILL test that the pipeline can:
    # 1. Take an image
    # 2. Run object detection (or its fallback)
    # 3. Crop cells
    # 4. Run classification
    # 5. NLP Post processing
    # 6. JSON Return
    
    cv2.circle(img, (100, 100), 5, (0,0,0), -1)
    cv2.circle(img, (100, 120), 5, (0,0,0), -1)
    
    cv2.circle(img, (150, 100), 5, (0,0,0), -1)
    
    cv2.imwrite("test_braille.jpg", img)
    return img

async def main():
    print("--- Testing Core ML Pipeline Integration ---")
    img = draw_synthetic_braille_text()
    
    # Initialize pipeline
    pipeline = BrailleInferencePipeline(use_onnx=False)
    
    print("[*] Running image through inference pipeline...")
    result = await pipeline.run(img)
    
    print("\n--- Pipeline Result ---")
    print(f"Raw Text Extracted: {result.get('raw_text')}")
    print(f"NLP Corrected Text: {result.get('text')}")
    print(f"Cells Detected: {result.get('detected_cells')}")
    print(f"Confidence: {result.get('confidence'):.2f}")
    print(f"Processing Time: {result.get('processing_time_ms')}ms")
    
if __name__ == "__main__":
    asyncio.run(main())
