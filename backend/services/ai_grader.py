"""
ai_grader.py — Grade student answers using Google Gemini 1.5 Flash (free tier).
Falls back to a deterministic heuristic when the API key is not set.
"""
import os
import json
import re
from PIL import Image
import io

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Confidence thresholds
HIGH_CONF = 0.85
MED_CONF = 0.65

_model = None


def _get_model():
    global _model
    if _model is None and GEMINI_AVAILABLE and GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        _model = genai.GenerativeModel("gemini-1.5-flash")
    return _model


GRADING_PROMPT = """You are an expert CBSE/ICSE teacher grading a student's handwritten answer.

QUESTION: {question}
QUESTION TYPE: {question_type}
MAX MARKS: {max_marks}

MARKING SCHEME:
{marking_scheme}

STUDENT'S ANSWER (OCR transcription):
{student_text}

Grade this answer strictly according to the marking scheme.
Return ONLY valid JSON in this exact format (no markdown, no explanation):
{{
  "obtained_marks": <number>,
  "confidence": "<high|medium|low>",
  "ai_remark": "<one sentence feedback>",
  "steps": [
    {{
      "step_key": "<letter>",
      "obtained_marks": <number>,
      "ai_status": "<correct|incorrect|low_confidence>",
      "ai_note": "<optional short note>"
    }}
  ]
}}

Rules:
- confidence="high" if handwriting is clear and answer is unambiguous
- confidence="low" if OCR text looks garbled or answer is illegible
- For SHORT_ANSWER: steps array should be empty []
- Give partial credit where the marking scheme allows
"""


def _pil_to_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


def grade_answer(
    question_text: str,
    question_type: str,
    max_marks: int,
    marking_scheme: list[dict],  # list of {step_key, label, max_marks}
    student_text: str,
    cropped_image: Image.Image | None = None,
) -> dict:
    """
    Grade a student answer using Gemini.
    Returns a dict matching the GradingResult + QuestionStep shape.
    """
    model = _get_model()

    # Build a readable marking scheme string
    if marking_scheme:
        scheme_str = "\n".join(
            f"  Step {s['step_key']}: {s['label']} ({s['max_marks']} mark{'s' if s['max_marks'] != 1 else ''})"
            for s in marking_scheme
        )
    else:
        scheme_str = f"Award marks for a correct and complete answer. Total: {max_marks}"

    prompt = GRADING_PROMPT.format(
        question=question_text,
        question_type=question_type,
        max_marks=max_marks,
        marking_scheme=scheme_str,
        student_text=student_text or "[No readable text — likely blank or illegible]",
    )

    if model:
        try:
            parts = [prompt]
            if cropped_image:
                parts.append({
                    "mime_type": "image/jpeg",
                    "data": _pil_to_bytes(cropped_image),
                })
            response = model.generate_content(parts)
            raw = response.text.strip()
            # Strip markdown code fences if present
            raw = re.sub(r"^```json\s*|```$", "", raw, flags=re.MULTILINE).strip()
            return json.loads(raw)
        except Exception as e:
            print(f"[ai_grader] Gemini error: {e} — falling back to heuristic")

    # ── Heuristic fallback (no API key or error) ──────────────────────────
    return _heuristic_grade(question_type, max_marks, marking_scheme, student_text)


def _heuristic_grade(question_type, max_marks, marking_scheme, student_text):
    """
    Simple keyword-based heuristic for when Gemini is unavailable.
    Always returns confidence=low so the teacher reviews manually.
    """
    has_text = bool(student_text and len(student_text.strip()) > 10)

    steps = []
    for s in (marking_scheme or []):
        steps.append({
            "step_key": s["step_key"],
            "obtained_marks": None,
            "ai_status": "low_confidence",
            "ai_note": "Manual review required — Gemini API not configured",
        })

    return {
        "obtained_marks": None,
        "confidence": "low",
        "ai_remark": (
            "Gemini API key not configured. Please enter marks manually."
            if not GEMINI_API_KEY
            else "Could not parse AI response. Please verify manually."
        ),
        "steps": steps,
    }
