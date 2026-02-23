# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GradeGlide is an AI-powered assessment platform for private tutors and coaching centers. The project uses React with Vite for the frontend, with plans for a Python FastAPI backend and Google Gemini 1.5 Pro for AI grading capabilities.

## Development Commands

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Backend Development
```bash
cd backend

# Create virtual environment (first time)
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy env template and add your Gemini API key
copy .env.example .env   # Windows

# Start API server using the venv's uvicorn (avoids system Python conflict)
.venv\Scripts\uvicorn.exe main:app --reload --port 8000

# View interactive API docs
# Open http://localhost:8000/docs in your browser
```

### Optional Tool Installation (enhances AI grading)
- **Tesseract OCR** (for handwriting text extraction):
  Download from https://github.com/UB-Mannheim/tesseract/wiki
  Set `TESSERACT_CMD=C:/Program Files/Tesseract-OCR/tesseract.exe` in `.env`
- **Poppler** (for PDF-to-image conversion):
  Download from https://github.com/oschwartz10612/poppler-windows/releases
  Set `POPPLER_PATH=C:/poppler/Library/bin` in `.env`
- **Gemini API Key** (free tier — 15 RPM, 1M tokens/day):
  Get at https://aistudio.google.com/app/apikey
  Set `GEMINI_API_KEY=your_key` in `.env`

> Both services degrade gracefully: without Tesseract, OCR uses synthetic regions;
> without Gemini API key, grading returns low-confidence placeholders for manual entry.
## Project Architecture

### Frontend Structure
- **Framework**: React 18 with Vite build tool
- **Routing**: React Router v6 with nested route structure
- **Styling**: Tailwind CSS with shadcn/ui components
- **API Client**: `src/lib/api.js` — all backend calls go through here
- **Component Organization**:
  - `/src/components/ui/`: Reusable UI components (badge, button, card)
  - `/src/components/layout/`: Layout components (AppLayout wrapper)
  - `/src/pages/`: Page components corresponding to routes

### Backend Structure
- **Framework**: FastAPI + Uvicorn (Python)
- **Database**: SQLite via SQLAlchemy (file: `backend/gradeglide.db`)
- **File Storage**: Local `backend/uploads/` directory
- **API Routers**:
  - `api/upload.py` — `POST /upload/session` (file upload + AI pipeline)
  - `api/grading.py` — `GET/PATCH /sessions/*` (review + mark updates)
  - `api/export.py` — `GET /sessions/{id}/export` (CSV/JSON download)
- **Services**:
  - `services/pdf_processor.py` — PDF/image → PIL images (pdf2image + Poppler)
  - `services/ocr_service.py` — Tesseract OCR, detects Q1/Q2 regions + bboxes
  - `services/ai_grader.py` — Gemini 1.5 Flash structured grading prompt

### Key Pages and Routes
- `/` - Dashboard: Main overview and metrics
- `/grading` - GradingWorkspace: Upload and process answer sheets
- `/grading/:id` - GradingReview: Review individual grading results
- `/answer-keys` - AnswerKeys: Manage answer keys for grading
- `/question-papers` - QuestionPapers: Manage question papers
- `/settings` - Settings: Application configuration
- `/pricing` - Pricing: Subscription and pricing information

### Component Conventions
- Uses absolute imports with `@/` alias pointing to `/src/`
- Components use PascalCase naming
- UI components follow shadcn/ui patterns with class-variance-authority for styling variants
- Icons from lucide-react library

## Future Integration Points

### Backend (Planned)
- FastAPI Python backend for API endpoints
- Supabase for database and authentication
- Google Gemini 1.5 Pro for AI grading engine

### Key Features to Implement
1. Answer sheet upload and processing pipeline
2. Split-screen review interface for AI grading verification
3. WhatsApp integration for document upload
4. Batch grading management
5. Student performance analytics