"""
OCR for scanned documents with Tesseract (images) and Poppler's pdftoppm (scanned PDF pages).
Both are system programs installed in the server image (server/Dockerfile).
"""

import os
import shutil
import subprocess
import tempfile

# Tesseract language packs installed in server/Dockerfile.
LANGUAGES = {"eng", "hin", "mar", "san", "ben", "guj", "pan", "tam", "tel", "kan", "mal", "ori", "urd"}
MAX_LANGUAGES = 4
MAX_PDF_PAGES = 40
PAGE_TIMEOUT_SECONDS = 120


class OCRError(Exception):
    pass


def available() -> bool:
    return bool(shutil.which("tesseract") and shutil.which("pdftoppm"))


def valid_languages(languages: str) -> bool:
    """'eng', 'eng+mar' ...: only installed packs, so the value is safe to pass to tesseract."""
    codes = languages.split("+")
    return 0 < len(codes) <= MAX_LANGUAGES and all(code in LANGUAGES for code in codes)


def image_to_text(data: bytes, languages: str) -> str:
    if not valid_languages(languages):
        raise OCRError("Unsupported OCR language")
    try:
        result = subprocess.run(
            ["tesseract", "stdin", "stdout", "-l", languages],
            input=data, capture_output=True, timeout=PAGE_TIMEOUT_SECONDS, check=True,
        )
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as error:
        raise OCRError("The image could not be read") from error
    return result.stdout.decode("utf-8", errors="replace")


def pdf_to_text(data: bytes, languages: str) -> str:
    """Render each page (up to MAX_PDF_PAGES) to an image and OCR it."""
    with tempfile.TemporaryDirectory() as tmp:
        try:
            subprocess.run(
                ["pdftoppm", "-r", "200", "-png", "-l", str(MAX_PDF_PAGES), "-", os.path.join(tmp, "page")],
                input=data, capture_output=True, timeout=PAGE_TIMEOUT_SECONDS * 2, check=True,
            )
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as error:
            raise OCRError("The PDF pages could not be rendered for OCR") from error
        pages = []
        for name in sorted(os.listdir(tmp)):
            with open(os.path.join(tmp, name), "rb") as image:
                pages.append(image_to_text(image.read(), languages))
    return "\n".join(pages)
