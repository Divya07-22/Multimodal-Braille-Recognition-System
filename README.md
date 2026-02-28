# 🦾 BrailleAI — Braille Conversion Tool

> AI-powered Braille ↔ Text conversion system using CNN-based ML models with ONNX inference.  
> Built for accessibility. Designed for everyone.

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange?style=for-the-badge&logo=mysql)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=for-the-badge&logo=pytorch)
![ONNX](https://img.shields.io/badge/ONNX-Runtime-005CED?style=for-the-badge&logo=onnx)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [ML Pipeline](#-ml-pipeline)
- [Contributing](#-contributing)

---

## 🧠 Overview

BrailleAI is a full-stack web application that converts:
- 📝 **Text → Braille**
- 🖼️ **Image → Braille** (via CNN-based OCR)
- 📄 **PDF → Braille**
- 🔤 **Braille → Text**

The system uses a **real trained CNN model exported to ONNX** for fast inference,  
wrapped in a **FastAPI async backend** and a **React + TypeScript frontend**.

---

## ✨ Features

### Frontend
- 🔐 JWT Authentication (Register / Login / Logout / Refresh)
- ♿ Full Accessibility Panel (High Contrast, Font Size, Screen Reader, Reduced Motion, Keyboard Navigation)
- 📊 Dashboard with conversion stats and history
- 🖼️ Image upload with drag & drop for Braille image recognition
- 📋 Clipboard copy support
- 🔁 Conversion history with search
- 👤 User profile management
- 📱 Fully responsive UI
- 🌙 Dark mode by default

### Backend
- ⚡ Async FastAPI with SQLAlchemy 2.0
- 🔒 JWT Access + Refresh tokens with bcrypt hashing
- 🗄️ MySQL database with full async ORM models
- 🤖 ONNX Runtime ML inference engine
- 🧠 CNN-based Braille cell detector + classifier
- 📁 File upload & storage management
- 📋 Full audit logging system
- 🔄 Background job processing
- 📊 Analytics service
- 📧 Email service
- 🐳 Docker support

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| State Management | Zustand + persist middleware |
| Routing | React Router v6 |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Backend | FastAPI, Python 3.11+ |
| ORM | SQLAlchemy 2.0 async |
| Database | MySQL 8.0 |
| Migrations | Alembic |
| Auth | JWT (python-jose) + bcrypt |
| ML Training | PyTorch 2.0+ |
| ML Inference | ONNX Runtime |
| ML Preprocessing | OpenCV, Pillow |
| Containerization | Docker + Docker Compose |

---

## 📁 Project Structure

```
braille-conversion-tool/
├── backend/
│   ├── alembic/                        # Alembic migration config
│   │   └── versions/
│   │       └── 001_initial_tables.py
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py         # Register, Login, Refresh, Logout
│   │   │       │   ├── braille.py      # Text ↔ Braille conversion
│   │   │       │   ├── documents.py    # Document management
│   │   │       │   ├── export.py       # Export results
│   │   │       │   ├── health.py       # Health check
│   │   │       │   ├── history.py      # Conversion history
│   │   │       │   ├── inference.py    # ML inference
│   │   │       │   ├── jobs.py         # Job status
│   │   │       │   ├── ocr.py          # OCR extraction
│   │   │       │   ├── recognition.py  # Braille recognition
│   │   │       │   ├── upload.py       # File upload
│   │   │       │   └── users.py        # User management
│   │   │       └── router.py
│   │   ├── core/
│   │   │   ├── config.py               # Settings & env vars
│   │   │   ├── dependencies.py         # Shared FastAPI deps
│   │   │   ├── exceptions.py           # Custom exceptions
│   │   │   ├── logging.py              # Logging setup
│   │   │   └── security.py             # JWT & password utils
│   │   ├── db/
│   │   │   ├── migrations/             # DB migration scripts
│   │   │   ├── models/
│   │   │   │   ├── user.py             # User model
│   │   │   │   ├── document.py         # Document model
│   │   │   │   ├── conversion_job.py   # Job model
│   │   │   │   ├── inference_result.py # Inference result model
│   │   │   │   └── audit_log.py        # Audit log model
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── ml/
│   │   │   ├── artifacts/              # Trained model files (.pt, .onnx)
│   │   │   ├── data/                   # Training data
│   │   │   ├── evaluation/             # Evaluation & metrics
│   │   │   │   ├── evaluate_pipeline.py
│   │   │   │   ├── metrics_report.py
│   │   │   │   └── tesseract_baseline.py
│   │   │   ├── export/                 # ONNX export & quantization
│   │   │   │   ├── export_to_onnx.py
│   │   │   │   ├── quantize_dynamic.py
│   │   │   │   └── benchmark_latency.py
│   │   │   ├── inference/              # Inference pipeline
│   │   │   │   ├── pipeline.py
│   │   │   │   ├── braille_classifier.py
│   │   │   │   ├── braille_detector.py
│   │   │   │   ├── cell_classifier_cnn.py
│   │   │   │   ├── dot_detector_cnn.py
│   │   │   │   ├── model_loader.py
│   │   │   │   └── postprocess.py
│   │   │   ├── nlp/                    # NLP post-processing
│   │   │   │   └── nlp_postprocess.py
│   │   │   ├── preprocessing/          # Image preprocessing
│   │   │   │   ├── binarize.py
│   │   │   │   ├── denoise.py
│   │   │   │   ├── perspective.py
│   │   │   │   ├── resize.py
│   │   │   │   └── unwarp.py
│   │   │   └── training/               # Model training scripts
│   │   │       ├── train_classifier.py
│   │   │       ├── train_detector.py
│   │   │       ├── train_cell_classifier.py
│   │   │       ├── train_dot_detector.py
│   │   │       ├── dataset.py
│   │   │       ├── augmentations.py
│   │   │       ├── losses.py
│   │   │       └── callbacks.py
│   │   ├── schemas/                    # Pydantic schemas
│   │   │   ├── auth.py
│   │   │   ├── braille.py
│   │   │   ├── document.py
│   │   │   ├── export.py
│   │   │   ├── inference.py
│   │   │   ├── job.py
│   │   │   ├── recognition.py
│   │   │   ├── upload.py
│   │   │   └── user.py
│   │   ├── services/                   # Business logic
│   │   │   ├── analytics_service.py
│   │   │   ├── auth_service.py
│   │   │   ├── braille_service.py
│   │   │   ├── document_service.py
│   │   │   ├── email_service.py
│   │   │   ├── export_service.py
│   │   │   ├── inference_service.py
│   │   │   ├── job_service.py
│   │   │   ├── ocr_service.py
│   │   │   ├── recognition_service.py
│   │   │   ├── storage_service.py
│   │   │   └── user_service.py
│   │   ├── tests/                      # Unit & integration tests
│   │   │   ├── test_auth.py
│   │   │   ├── test_braille.py
│   │   │   ├── test_ml_models.py
│   │   │   ├── test_ocr.py
│   │   │   └── test_recognition_pipeline.py
│   │   ├── utils/                      # Utility helpers
│   │   │   ├── file_utils.py
│   │   │   ├── image_utils.py
│   │   │   ├── text_utils.py
│   │   │   ├── validators.py
│   │   │   └── response_utils.py
│   │   └── main.py                     # FastAPI app entry point
│   ├── uploads/
│   │   ├── images/
│   │   └── exports/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccessibilityPanel.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── context/
│   │   │   ├── AccessibilityContext.tsx
│   │   │   ├── AccessibilityContextValue.ts
│   │   │   └── useAccessibility.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useClipboard.ts
│   │   │   ├── useConversion.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useHistory.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── pages/
│   │   │   ├── BrailleToText.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── History.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── ImageToBraille.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Register.tsx
│   │   │   └── TextToBraille.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env
├── database/
├── docs/
├── mobile/
├── storage/
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Git
- Docker (optional)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/braille-conversion-tool.git
cd braille-conversion-tool
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Copy env file and fill in values
copy .env.example .env

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
copy .env.example .env

# Start dev server
npm run dev
```

---

### 4. Database Setup

```sql
CREATE DATABASE braille_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'braille_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON braille_db.* TO 'braille_user'@'localhost';
FLUSH PRIVILEGES;
```

> ✅ Tables are created **automatically** on first server start via SQLAlchemy.

---

### 5. Docker Setup (Alternative)

```bash
cd backend
docker-compose up --build
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
# Database
DATABASE_URL=mysql+aiomysql://braille_user:yourpassword@localhost:3306/braille_db

# Security
SECRET_KEY=your-super-secret-key-minimum-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# App
ENVIRONMENT=development
ALLOWED_ORIGINS=["http://localhost:5173"]
ALLOWED_HOSTS=["localhost", "127.0.0.1"]

# ML
MODEL_ARTIFACTS_DIR=./app/ml/artifacts

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 📖 API Documentation

Once backend is running, visit:

| URL | Description |
|-----|-------------|
| `http://localhost:8000/api/docs` | Swagger UI (interactive) |
| `http://localhost:8000/api/redoc` | ReDoc |
| `http://localhost:8000/health` | Root health check |

### Key Endpoints

```
AUTH
POST   /api/v1/auth/register         Register new user
POST   /api/v1/auth/login            Login → returns JWT tokens
POST   /api/v1/auth/refresh          Refresh access token
POST   /api/v1/auth/logout           Logout
POST   /api/v1/auth/change-password  Change password

USERS
GET    /api/v1/users/me              Get current user profile
PUT    /api/v1/users/me              Update profile
GET    /api/v1/users/                List all users (admin only)
DELETE /api/v1/users/{id}            Delete user (admin only)

CONVERSION
POST   /api/v1/braille/convert       Text → Braille / Braille → Text
POST   /api/v1/ocr/extract           Extract text from image
POST   /api/v1/inference/run         Run full ML inference pipeline
POST   /api/v1/recognition/recognize Braille cell recognition

FILES
POST   /api/v1/upload                Upload image/PDF file
GET    /api/v1/documents             List user documents
GET    /api/v1/documents/{id}        Get document details
DELETE /api/v1/documents/{id}        Delete document

JOBS & HISTORY
GET    /api/v1/jobs                  List conversion jobs
GET    /api/v1/jobs/{id}             Get job status
GET    /api/v1/history               Conversion history

EXPORT
POST   /api/v1/export                Export result as PDF/TXT/BRF

HEALTH
GET    /api/v1/health                API health + model status
GET    /health                       Root health check
```

---

## 🤖 ML Pipeline

The system uses a **two-stage CNN pipeline**:

```
Input Image
    │
    ▼
┌─────────────────────┐
│   Preprocessing      │  → Denoise, Binarize, Perspective Correction, Unwarp
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   Dot Detector CNN   │  → Detects individual Braille dots
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  Cell Classifier CNN │  → Classifies Braille cells (64 patterns)
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│   NLP Postprocess    │  → Translates cells → text, grammar correction
└─────────────────────┘
    │
    ▼
Output Text
```

### Trained Model Artifacts

| File | Description |
|------|-------------|
| `detector.onnx` | Braille dot detector (ONNX) |
| `classifier.onnx` | Braille cell classifier (ONNX) |
| `detector_best.pt` | Best detector checkpoint |
| `classifier_best.pt` | Best classifier checkpoint |
| `evaluation_report.json` | Model evaluation metrics |
| `latency_benchmark.json` | Inference speed benchmark |

### Train the Models

```bash
cd backend

# Generate synthetic training data
python app/ml/training/generate_synthetic_data.py

# Train dot detector
python app/ml/training/train_dot_detector.py

# Train cell classifier
python app/ml/training/train_cell_classifier.py

# Export to ONNX
python app/ml/export/export_to_onnx.py

# Quantize for faster inference
python app/ml/export/quantize_dynamic.py

# Evaluate pipeline
python app/ml/evaluation/evaluate_pipeline.py

# Or run everything at once
python quick_train.py
```

---

## 🧪 Running Tests

```bash
cd backend

# Run all tests
pytest app/tests/ -v

# Run specific test
pytest app/tests/test_auth.py -v
pytest app/tests/test_ml_models.py -v
pytest app/tests/test_recognition_pipeline.py -v
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](backend/LICENSE) file for details.

---

## 👥 Team

Built with ❤️ at **Hacknight** by the BrailleAI team.

> Making the world more accessible — one braille cell at a time. ♿
