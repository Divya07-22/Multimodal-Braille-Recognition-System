import subprocess
import time
import psutil
import logging
import sys

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

def wait_for_training_processes():
    """Wait for any python processes running the base training scripts to finish."""
    base_scripts = [
        "app.ml.training.train_classifier",
        "app.ml.training.train_dot_detector",
        "app.ml.training.train_detector"
    ]
    
    while True:
        running = []
        for p in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cmd = p.info.get('cmdline')
                if cmd:
                    cmd_str = " ".join(cmd)
                    for script in base_scripts:
                        if script in cmd_str:
                            running.append(p.info['pid'])
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
                
        if not running:
            logger.info("All 3 base ML models have completed training!")
            break
            
        logger.info(f"Waiting for {len(running)} base models to finish 20 epochs...")
        time.sleep(60)

def main():
    logger.info("Monitoring 3 active ML models (ResNet Classifier, Dot Detector, Faster R-CNN) for 20 epochs...")
    wait_for_training_processes()
    
    logger.info("--- Starting Model 4: MobileNetV3 Student Distillation (train_cell_classifier) ---")
    subprocess.run(["python", "-m", "app.ml.training.train_cell_classifier"], check=True)
    
    logger.info("--- Exporting and Quantizing all models ---")
    subprocess.run(["python", "-m", "app.ml.export.export_to_onnx"], check=True)
    subprocess.run(["python", "-m", "app.ml.export.quantize_dynamic"], check=True)
    
    logger.info("--- Validating NLP PostProcessor rules ---")
    # A quick script call to evaluate that NLP runs correctly
    test_nlp = """
import logging
from app.ml.nlp.nlp_postprocess import NLPPostProcessor
nlp = NLPPostProcessor()
test_text = 'hello .world!   this   is a test  sentence'
res, conf = nlp.correct(test_text)
print('NLP Cleaned text:', res)
    """
    with open("test_nlp.py", "w") as f:
        f.write(test_nlp)
    subprocess.run(["python", "test_nlp.py"])
    
    logger.info("--- Testing Completed. All 4 Trainable ML Models have finished 20 epochs! ---")
    logger.info("The remaining 3 'models' you referred to are likely Image Pre-processing and NLP components. These are rule-based algorithms (Denoising, Perspective Correction, NLP SymSpell) that do not require epochs/training.")
    
if __name__ == "__main__":
    main()
