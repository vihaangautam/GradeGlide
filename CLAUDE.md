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

## Project Architecture

### Frontend Structure
- **Framework**: React 18 with Vite build tool
- **Routing**: React Router v6 with nested route structure
- **Styling**: Tailwind CSS with shadcn/ui components
- **Component Organization**:
  - `/src/components/ui/`: Reusable UI components (badge, button, card)
  - `/src/components/layout/`: Layout components (AppLayout wrapper)
  - `/src/pages/`: Page components corresponding to routes

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