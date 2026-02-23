"""
pdf_processor.py — Convert uploaded PDFs or images to PIL Image objects.
Falls back gracefully when Poppler is not installed.
"""
import os
from pathlib import Path
from PIL import Image

try:
    from pdf2image import convert_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False

# Read optional Poppler path from env (needed on Windows)
POPPLER_PATH = os.getenv("POPPLER_PATH", None) or None


def file_to_images(file_path: str) -> list[Image.Image]:
    """
    Convert an uploaded file (PDF or image) to a list of PIL Images.
    Returns one image per page for PDFs, or a single-item list for images.
    """
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext in (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"):
        img = Image.open(file_path).convert("RGB")
        return [img]

    if ext == ".pdf":
        if not PDF2IMAGE_AVAILABLE:
            raise RuntimeError(
                "pdf2image is not installed. Run: pip install pdf2image\n"
                "Also install Poppler: https://github.com/oschwartz10612/poppler-windows/releases"
            )
        kwargs = {"dpi": 200}
        if POPPLER_PATH:
            kwargs["poppler_path"] = POPPLER_PATH
        images = convert_from_path(file_path, **kwargs)
        return [img.convert("RGB") for img in images]

    raise ValueError(f"Unsupported file type: {ext}")


def save_page_images(images: list[Image.Image], session_id: str, upload_dir: str) -> list[str]:
    """
    Save PIL images to disk as PNGs, return their file paths.
    """
    session_dir = Path(upload_dir) / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    paths = []
    for i, img in enumerate(images):
        out_path = session_dir / f"page_{i + 1}.png"
        img.save(str(out_path), "PNG")
        paths.append(str(out_path))
    return paths
