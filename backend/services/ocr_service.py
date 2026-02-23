"""
ocr_service.py — Extract text regions from answer sheet images.
Uses pytesseract + Tesseract OCR.  Falls back to placeholder text
when Tesseract is not installed so the rest of the app still works.
"""
import os
import re
from PIL import Image

try:
    import pytesseract
    # Allow override of Tesseract path via env (needed on Windows)
    tesseract_cmd = os.getenv("TESSERACT_CMD")
    if tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


def extract_full_text(image: Image.Image) -> str:
    """Run OCR on the entire image and return raw text."""
    if not TESSERACT_AVAILABLE:
        return "[OCR unavailable — install Tesseract and pytesseract]"
    return pytesseract.image_to_string(image, lang="eng")


def detect_question_regions(image: Image.Image) -> list[dict]:
    """
    Detect answer regions labelled Q1, Q2, Q3, etc. in the image.
    Returns a list of dicts: {q_num, bbox_pct, cropped_image, raw_text}
    bbox_pct is normalised 0-100 (x, y, w, h) for the React bounding boxes.
    """
    width, height = image.size

    if not TESSERACT_AVAILABLE:
        # Return synthetic regions so the app can still be demoed
        return _synthetic_regions(image, width, height)

    # Get word-level data with positions
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    n_boxes = len(data["text"])

    # Find lines that contain Q1, Q2 … Q9 labels
    question_anchors: list[tuple[int, int, int]] = []  # (q_num, y_pixel, word_index)
    q_pattern = re.compile(r"^[Qq](\d+)[.\-:]?$")

    for i in range(n_boxes):
        text = str(data["text"][i]).strip()
        m = q_pattern.match(text)
        if m and int(data["conf"][i]) > 40:
            q_num = int(m.group(1))
            y_top = data["top"][i]
            question_anchors.append((q_num, y_top, i))

    question_anchors.sort(key=lambda x: x[1])  # sort by vertical position

    regions = []
    for idx, (q_num, y_top, _) in enumerate(question_anchors):
        # Region spans from this Q label to the next one (or bottom of page)
        y_end = question_anchors[idx + 1][1] if idx + 1 < len(question_anchors) else height

        # Add a small margin
        y_start = max(0, y_top - 5)
        y_end = min(height, y_end - 5)

        cropped = image.crop((0, y_start, width, y_end))
        raw_text = pytesseract.image_to_string(cropped, lang="eng").strip()

        regions.append({
            "q_num": q_num,
            "bbox_pct": {
                "x": 0,
                "y": round(y_start / height * 100, 1),
                "w": 100,
                "h": round((y_end - y_start) / height * 100, 1),
            },
            "cropped_image": cropped,
            "raw_text": raw_text,
        })

    # If no Q-labels found, treat entire image as one region
    if not regions:
        raw_text = extract_full_text(image)
        regions = [{
            "q_num": 1,
            "bbox_pct": {"x": 0, "y": 0, "w": 100, "h": 100},
            "cropped_image": image,
            "raw_text": raw_text,
        }]

    return regions


def _synthetic_regions(image: Image.Image, width: int, height: int) -> list[dict]:
    """Return three fake regions so the UI works without Tesseract."""
    splits = [(0, 30), (30, 73), (73, 95)]
    labels = [
        "Ohm's law states V = IR. Current proportional to voltage.",
        "Transformer uses mutual induction to step up/down AC voltage.",
        "R = V x I [wrong formula, struck through]",
    ]
    regions = []
    for i, ((y0, y1), text) in enumerate(zip(splits, labels)):
        y_start = int(height * y0 / 100)
        y_end = int(height * y1 / 100)
        regions.append({
            "q_num": i + 1,
            "bbox_pct": {"x": 0, "y": y0, "w": 100, "h": y1 - y0},
            "cropped_image": image.crop((0, y_start, width, y_end)),
            "raw_text": text,
        })
    return regions
