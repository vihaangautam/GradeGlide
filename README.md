# GradeGlide

**The AI-Powered Assessment Co-pilot for Private Tutors & Coaching Centers.**
GradeGlide eliminates the manual burden of grading answer sheets, allowing tutors to focus on teaching. Using advanced AI (Gemini 1.5 Pro), it reads handwritten answers, grades them against a key, and provides detailed student feedback in seconds.


## 🚀 Core Features

### Phase 1: The Core Grader (Current)
-   **📝 Smart Ingestion**: Upload scanned answer sheets via Web (WhatsApp coming soon).
-   **👁️ Split-Screen Review**: A powerful interface to verify AI marks alongside the original student paper.
-   **📊 Classroom Dashboard**: Track performance metrics, grading batches, and student progress.
-   **🤖 AI Grading Engine**: Step-by-step marking with partial credit logic.

### Roadmap
-   **Phase 2**: AI Answer Key Generation from blank question papers.
-   **Phase 3**: Question Paper Creator with drag-and-drop support.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, `shadcn/ui`
-   **Backend**: Python (FastAPI) *[In Progress]*
-   **AI Model**: Google Gemini 1.5 Pro
-   **Database & Auth**: Supabase

## 🏁 Getting Started

This repository currently contains the **Frontend MVP**.

### Prerequisites
-   Node.js (v18+)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/gradeglide.git
    cd gradeglide
    ```

2.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:5173](http://localhost:5173) to view the app.

## 🤝 Contributing
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License
Attribute-NonCommercial 4.0 International
