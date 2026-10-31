"""Reads uploaded documents into plain text: PDF, Word (.docx), plain text, and scans via OCR."""

import io
import zipfile
from typing import Tuple
from xml.etree import ElementTree

from app.services import ocr, text_extract

# Less than this is an empty or image-only document, not a readable source.
MIN_TEXT_CHARS = 40
MAX_DOCX_XML_BYTES = 50 * 1024 * 1024  # guards against zip bombs
_WORD_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

UNSUPPORTED = "Upload a PDF, Word (.docx), plain text or image (PNG, JPEG, TIFF, WebP) file."


class UploadError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


def _is_image(data: bytes) -> bool:
    return (
        data.startswith(b"\x89PNG\r\n\x1a\n")
        or data.startswith(b"\xff\xd8\xff")
        or data[:4] in (b"II*\x00", b"MM\x00*")
        or (data[:4] == b"RIFF" and data[8:12] == b"WEBP")
    )


def _docx_text(data: bytes) -> str:
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            info = archive.getinfo("word/document.xml")
            if info.file_size > MAX_DOCX_XML_BYTES:
                raise UploadError(413, "The Word document is too large to read.")
            root = ElementTree.fromstring(archive.read(info))
    except (KeyError, zipfile.BadZipFile, ElementTree.ParseError):
        raise UploadError(422, UNSUPPORTED)
    paragraphs = ["".join(t.text or "" for t in p.iter(f"{_WORD_NS}t")) for p in root.iter(f"{_WORD_NS}p")]
    return "\n".join(p for p in paragraphs if p.strip())


def _ocr(run, data: bytes, languages: str) -> str:
    if not ocr.available():
        raise UploadError(
            422, "This looks like a scan. Reading scans needs OCR, which is not installed on this server."
        )
    try:
        return run(data, languages)
    except ocr.OCRError as error:
        raise UploadError(422, f"{error}. Try a clearer scan.")


def extract_text(data: bytes, languages: str) -> Tuple[str, str]:
    """(text, extraction_method). Methods: pdf_text, ocr, docx, plain_text."""
    if data.startswith(b"%PDF-"):
        text, method = text_extract.pdf_to_text(data), "pdf_text"
        if len(text) < MIN_TEXT_CHARS:  # no text layer: a scanned PDF
            text, method = _ocr(ocr.pdf_to_text, data, languages), "ocr"
    elif data.startswith(b"PK\x03\x04"):
        text, method = _docx_text(data), "docx"
    elif _is_image(data):
        text, method = _ocr(ocr.image_to_text, data, languages), "ocr"
    else:
        if b"\x00" in data:
            raise UploadError(422, UNSUPPORTED)
        try:
            text, method = data.decode("utf-8-sig"), "plain_text"
        except UnicodeDecodeError:
            raise UploadError(422, UNSUPPORTED)

    text = text.strip()
    if len(text) < MIN_TEXT_CHARS:
        raise UploadError(422, "No readable text was found in this file.")
    return text, method
