# 🦾 BrailleAI — Braille Conversion Tool

> AI-powered Braille ↔ Text conversion system using CNN-based ML models with ONNX inference.  
> Built for accessibility. Designed for everyone.

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange?style=for-the-badge&logo=mysql)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [ML Model](#-ml-model)
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
- 🔐 JWT Authentication (Register / Login / Logout)
- ♿ Full Accessibility Panel (High Contrast, Font Size, Screen Reader, Reduced Motion)
- 📊 Dashboard with conversion history
- 🖼️ Image upload with drag & drop
- 📱 Fully responsive UI
- 🌙 Dark mode by default

### Backend
- ⚡ Async FastAPI with SQLAlchemy 2.0
- 🔒 JWT Access + Refresh tokens
- 🗄️ MySQL database with full ORM models
- 🤖 ONNX ML inference engine
- 📁 File upload & storage
- 📋 Audit logging
- 🔄 Background job processing

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| State Management | Zustand + persist |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Backend | FastAPI, Python 3.11+ |
| ORM | SQLAlchemy 2.0 async |
| Database | MySQL 8.0 |
| Auth | JWT (python-jose) + bcrypt |
| ML Inference | ONNX Runtime |
| ML Training | PyTorch / TensorFlow |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
braille-conversion-tool/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── router.py
│   │   │       └── endpoints/
│   │   │           ├── auth.py
│   │   │           ├── users.py
│   │   │           ├── braille.py
│   │   │           ├── ocr.py
│   │   │           ├── inference.py
│   │   │           ├── documents.py
│   │   │           ├── jobs.py
│   │   │           ├── history.py
│   │   │           ├── upload.py
│   │   │           ├── export.py
│   │   │           └── health.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── exceptions.py
│   │   │   └── logging.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── models/
│   │   │       ├── user.py
│   │   │       ├── document.py
│   │   │       ├── conversion_job.py
│   │   │       ├── inference_result.py
│   │   │       └── audit_log.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   └── user.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   └── user_service.py
│   │   └── main.py
│   ├── ml/
│   │   ├── train.py
│   │   ├── model.py
│   │   └── artifacts/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   ├── AccessibilityContext.tsx
│   │   │   ├── AccessibilityContextValue.ts
│   │   │   └── useAccessibility.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TextToBraille.tsx
│   │   │   ├── BrailleToText.tsx
│   │   │   ├── ImageToBraille.tsx
│   │   │   ├── History.tsx
│   │   │   └── Profile.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Git

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
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file (see Environment Variables section)
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

# Create .env file
copy .env.example .env

# Start dev server
npm run dev
```

---

### 4. Database Setup

```sql
CREATE DATABASE braille_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'braille_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON braille_db.* TO 'braille_user'@'localhost';
FLUSH PRIVILEGES;
```

> Tables are created **automatically** on first server start via SQLAlchemy.

---

## 🔑 Environment Variables

### Backend `.env`

```env
# Database
DATABASE_URL=mysql+aiomysql://braille_user:yourpassword@localhost:3306/braille_db

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# App
ENVIRONMENT=development
ALLOWED_ORIGINS=["http://localhost:5173"]
ALLOWED_HOSTS=["localhost", "127.0.0.1"]

# ML
MODEL_ARTIFACTS_DIR=./ml/artifacts
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 📖 API Documentation

Once the backend is running, visit:

| URL | Description |
|-----|-------------|
| `http://localhost:8000/api/docs` | Swagger UI |
| `http://localhost:8000/api/redoc` | ReDoc |
| `http://localhost:8000/health` | Health check |

### Key Endpoints

```
POST   /api/v1/auth/register       — Register new user
POST   /api/v1/auth/login          — Login (returns JWT)
POST   /api/v1/auth/refresh        — Refresh access token
POST   /api/v1/auth/logout         — Logout

GET    /api/v1/users/me            — Get current user profile
PUT    /api/v1/users/me            — Update profile

POST   /api/v1/braille/convert     — Text to Braille
POST   /api/v1/ocr/extract         — Image OCR
POST   /api/v1/inference/run       — Run ML inference
POST   /api/v1/upload              — Upload file

GET    /api/v1/history             — Conversion history
GET    /api/v1/jobs                — Job status
GET    /api/v1/documents           — User documents
```

---

## 🤖 ML Model

The system uses a **CNN-based model** trained on Braille cell images:

- **Architecture:** Custom CNN → ONNX export
- **Input:** Braille cell images (grayscale)
- **Output:** Recognized Braille characters + confidence scores
- **Inference:** ONNX Runtime (CPU & GPU)
- **Training:** PyTorch

### Train the model

```bash
cd backend/ml
python train.py
```

Model artifacts are saved to `backend/ml/artifacts/`

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

This project is licensed under the MIT License.

---

## 👥 Team

Built with ❤️ at **Hacknight** by the BrailleAI team.

> Making the world more accessible — one braille cell at a time. ♿
