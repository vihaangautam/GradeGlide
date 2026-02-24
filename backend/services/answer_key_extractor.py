"""
answer_key_extractor.py
Extract structured marking schemes from uploaded PDF / DOCX files using Gemini.
Falls back gracefully when libraries or API key are missing.
"""
import os
import json
import re
from pathlib import Path

# ── Optional PDF text extraction ─────────────────────────────────────────────
try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

# ── Optional DOCX text extraction ────────────────────────────────────────────
try:
    from docx import Document as DocxDocument
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

# ── Optional Tesseract fallback ───────────────────────────────────────────────
try:
    import pytesseract
    from PIL import Image
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

# ── Gemini ────────────────────────────────────────────────────────────────────
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

_model = None

def _get_model():
    global _model
    if _model is None and GEMINI_AVAILABLE and GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        _model = genai.GenerativeModel("gemini-1.5-flash")
    return _model


# ── Text extraction ───────────────────────────────────────────────────────────

def _extract_text_from_pdf(file_path: str) -> str:
    if PDFPLUMBER_AVAILABLE:
        try:
            with pdfplumber.open(file_path) as pdf:
                return "\n".join(
                    page.extract_text() or "" for page in pdf.pages
                ).strip()
        except Exception as e:
            print(f"[extractor] pdfplumber failed: {e}")

    # Tesseract fallback for scanned PDFs
    if TESSERACT_AVAILABLE:
        try:
            from services.pdf_processor import file_to_images
            images = file_to_images(file_path)
            return "\n".join(
                pytesseract.image_to_string(img, lang="eng") for img in images
            ).strip()
        except Exception as e:
            print(f"[extractor] OCR fallback failed: {e}")

    return ""


def _extract_text_from_docx(file_path: str) -> str:
    if not DOCX_AVAILABLE:
        return ""
    try:
        doc = DocxDocument(file_path)
        return "\n".join(para.text for para in doc.paragraphs if para.text.strip())
    except Exception as e:
        print(f"[extractor] python-docx failed: {e}")
        return ""


def extract_text(file_path: str) -> str:
    """Dispatch to the appropriate extractor based on file extension."""
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return _extract_text_from_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return _extract_text_from_docx(file_path)
    else:
        # Image file — use Tesseract directly
        if TESSERACT_AVAILABLE:
            try:
                img = Image.open(file_path)
                return pytesseract.image_to_string(img, lang="eng").strip()
            except Exception as e:
                print(f"[extractor] image OCR failed: {e}")
    return ""


# ── Gemini extraction prompt ──────────────────────────────────────────────────

EXTRACTION_PROMPT = """You are an expert at parsing Indian school exam marking schemes (CBSE/ICSE).

Given the following text extracted from an answer key / marking scheme document, return a structured JSON array of questions.

TEXT:
{text}

Return ONLY a valid JSON array (no markdown fences, no commentary) with this exact shape:
[
  {{
    "q_number": 1,
    "type": "SHORT_ANSWER",
    "text": "Define Ohm's Law.",
    "max_marks": 2,
    "steps": []
  }},
  {{
    "q_number": 2,
    "type": "LONG_ANSWER",
    "text": "Explain working of a transformer.",
    "max_marks": 5,
    "steps": [
      {{"step_key": "a", "label": "Principle of mutual induction stated", "max_marks": 1}},
      {{"step_key": "b", "label": "Working explanation (step-up/step-down)", "max_marks": 1}},
      {{"step_key": "c", "label": "Labelled diagram", "max_marks": 2}},
      {{"step_key": "d", "label": "Correct formula", "max_marks": 1}}
    ]
  }}
]

Rules:
- type must be exactly one of: SHORT_ANSWER, LONG_ANSWER, NUMERICAL
- Use SHORT_ANSWER for 1-2 mark define/state questions with no sub-steps
- Use LONG_ANSWER for descriptive questions with step-wise marks
- Use NUMERICAL for calculation/problem-solving questions with step-wise marks
- steps is always a list (empty [] for SHORT_ANSWER)
- step_key must be a single lowercase letter: a, b, c, d, ...
- max_marks should be a number (integer or half-mark increments like 0.5)
- If you cannot parse any questions from the text, return an empty array: []
- Do NOT wrap the output in ```json or any code block
"""


def parse_with_gemini(raw_text: str) -> tuple[list, str | None]:
    """
    Send extracted text to Gemini for structured parsing.
    Returns (questions_list, error_message_or_None).
    """
    model = _get_model()
    if not model:
        reason = (
            "Gemini API key not configured — please add GEMINI_API_KEY to your .env file."
            if not GEMINI_API_KEY
            else "Gemini library not installed."
        )
        return [], reason

    if not raw_text.strip():
        return [], "No readable text could be extracted from the file."

    try:
        prompt = EXTRACTION_PROMPT.format(text=raw_text[:8000])  # cap to avoid token limits
        response = model.generate_content(prompt)
        raw = response.text.strip()
        # Strip accidental markdown fences
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
        questions = json.loads(raw)
        if not isinstance(questions, list):
            return [], "Gemini returned unexpected format."
        return questions, None
    except json.JSONDecodeError as e:
        print(f"[extractor] JSON parse error: {e}")
        return [], f"AI returned invalid JSON: {e}"
    except Exception as e:
        print(f"[extractor] Gemini error: {e}")
        return [], f"AI extraction failed: {e}"


# ── Main entry point ──────────────────────────────────────────────────────────

def extract_answer_key(file_path: str) -> dict:
    """
    Full pipeline: extract text → parse with Gemini.
    Returns:
    {
        "questions": [...],   # may be empty
        "raw_text": "...",    # for debugging / manual review
        "error": "..." | None
    }
    """
    raw_text = extract_text(file_path)
    questions, error = parse_with_gemini(raw_text)
    return {
        "questions": questions,
        "raw_text": raw_text,
        "error": error,
    }
