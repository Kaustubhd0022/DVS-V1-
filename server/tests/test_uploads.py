"""Uploaded documents (PDF, text, Word, scans) stored as sources and quote-checked like fetched ones."""

import io
import shutil
import subprocess
import tempfile
import zipfile

import pytest

from app.services import ocr
from tests.test_api import create_project
from tests.test_source_registry import make_pdf

BOOK_TEXT = (
    "The sea fort of Sindhudurg was built between 1664 and 1667 on Kurte island, "
    "using lead poured into the foundation stones to hold them against the waves."
)


def make_docx(paragraphs) -> bytes:
    """A minimal Word document: just enough for word/document.xml to be read."""
    body = "".join(f"<w:p><w:r><w:t>{p}</w:t></w:r></w:p>" for p in paragraphs)
    document = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f"<w:body>{body}</w:body></w:document>"
    )
    out = io.BytesIO()
    with zipfile.ZipFile(out, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types/>")
        archive.writestr("word/document.xml", document)
    return out.getvalue()


@pytest.fixture
def project(client, user_a):
    headers, _ = user_a
    return headers, create_project(client, headers)


def upload(client, headers, project_id, content: bytes, filename: str, **fields):
    form = {
        "title": "Konkan Forts (1971)",
        "publisher": "Maharashtra State Gazetteers Department",
        "declared_tier": "primary",
        "rights_confirmed": "true",
        **fields,
    }
    return client.post(
        f"/api/research/sources/upload?project_id={project_id}",
        headers=headers,
        data=form,
        files={"file": (filename, content, "application/octet-stream")},
    )


def stored_text(client, headers, project_id, doc_id):
    return client.get(f"/api/research/sources/{doc_id}?project_id={project_id}", headers=headers).json()["text"]


def test_plain_text_upload_is_stored_with_its_citation(client, project):
    headers, p = project

    response = upload(client, headers, p["id"], BOOK_TEXT.encode("utf-8"), "notes.txt")

    assert response.status_code == 200, response.text
    doc = response.json()
    assert doc["provider"] == "upload"
    assert doc["source_tier"] == "primary"
    assert doc["extraction_method"] == "plain_text"
    assert doc["title"] == "Konkan Forts (1971)"
    assert doc["publisher"] == "Maharashtra State Gazetteers Department"
    assert doc["file_name"] == "notes.txt"
    assert doc["url"] is None
    assert stored_text(client, headers, p["id"], doc["id"]) == BOOK_TEXT


def test_pdf_with_a_text_layer_is_read_directly(client, project):
    headers, p = project

    doc = upload(client, headers, p["id"], make_pdf("Sindhudurg was built between 1664 and 1667"), "fort.pdf").json()

    assert doc["extraction_method"] == "pdf_text"
    assert "Sindhudurg was built between 1664 and 1667" in stored_text(client, headers, p["id"], doc["id"])


def test_word_documents_are_read(client, project):
    headers, p = project

    doc = upload(client, headers, p["id"], make_docx(["Chapter 3", BOOK_TEXT]), "chapter.docx").json()

    assert doc["extraction_method"] == "docx"
    assert BOOK_TEXT in stored_text(client, headers, p["id"], doc["id"])


def test_images_are_read_with_ocr(client, project, monkeypatch):
    headers, p = project
    calls = []
    monkeypatch.setattr(ocr, "available", lambda: True)

    def fake_ocr(data, languages):
        calls.append(languages)
        return BOOK_TEXT

    monkeypatch.setattr(ocr, "image_to_text", fake_ocr)
    png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64

    doc = upload(client, headers, p["id"], png, "scan.png", ocr_languages="eng+mar").json()

    assert doc["extraction_method"] == "ocr"
    assert calls == ["eng+mar"]


def test_scanned_pdfs_without_text_fall_back_to_ocr(client, project, monkeypatch):
    headers, p = project
    monkeypatch.setattr(ocr, "available", lambda: True)
    monkeypatch.setattr(ocr, "pdf_to_text", lambda data, languages: BOOK_TEXT)
    from pypdf import PdfWriter

    out = io.BytesIO()
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    writer.write(out)

    doc = upload(client, headers, p["id"], out.getvalue(), "scan.pdf").json()

    assert doc["extraction_method"] == "ocr"
    assert stored_text(client, headers, p["id"], doc["id"]) == BOOK_TEXT


def test_scans_explain_when_ocr_is_not_installed(client, project, monkeypatch):
    headers, p = project
    monkeypatch.setattr(ocr, "available", lambda: False)

    response = upload(client, headers, p["id"], b"\xff\xd8\xff\xe0" + b"\x00" * 64, "scan.jpg")

    assert response.status_code == 422
    assert "OCR" in response.json()["detail"]


def test_rights_must_be_confirmed(client, project):
    headers, p = project
    response = upload(client, headers, p["id"], BOOK_TEXT.encode(), "notes.txt", rights_confirmed="false")
    assert response.status_code == 422
    assert "allowed to use" in response.json()["detail"]


def test_declared_tier_must_be_primary_or_secondary(client, project):
    headers, p = project
    response = upload(client, headers, p["id"], BOOK_TEXT.encode(), "notes.txt", declared_tier="tertiary")
    assert response.status_code == 422


@pytest.mark.parametrize("languages", ["eng;rm -rf /", "english", "eng+", "xxx"])
def test_ocr_languages_are_restricted_to_installed_codes(client, project, languages):
    headers, p = project
    response = upload(client, headers, p["id"], BOOK_TEXT.encode(), "notes.txt", ocr_languages=languages)
    assert response.status_code == 422


def test_unsupported_files_are_refused(client, project):
    headers, p = project
    response = upload(client, headers, p["id"], b"MZ\x90\x00binary", "tool.exe")
    assert response.status_code == 422
    assert "PDF" in response.json()["detail"]


def test_files_over_the_size_limit_are_refused(client, project, monkeypatch):
    headers, p = project
    from app.api import research

    monkeypatch.setattr(research, "MAX_UPLOAD_BYTES", 100)
    response = upload(client, headers, p["id"], BOOK_TEXT.encode() * 5, "big.txt")
    assert response.status_code == 413


def test_the_same_file_uploaded_twice_is_stored_once(client, project):
    headers, p = project
    first = upload(client, headers, p["id"], BOOK_TEXT.encode(), "a.txt").json()
    second = upload(client, headers, p["id"], BOOK_TEXT.encode(), "b.txt").json()
    assert first["id"] == second["id"]


def test_quotes_are_checked_against_uploaded_text(client, project):
    headers, p = project
    doc = upload(client, headers, p["id"], BOOK_TEXT.encode(), "notes.txt").json()
    q = f"project_id={p['id']}"

    good = client.post(f"/api/research/evidence?{q}", headers=headers, json={
        "source_type": "book", "claim": "Lead was used in the foundations", "document_id": doc["id"],
        "supporting_excerpt": "using lead poured into the foundation stones",
    })
    bad = client.post(f"/api/research/evidence?{q}", headers=headers, json={
        "source_type": "book", "claim": "x", "document_id": doc["id"],
        "supporting_excerpt": "the British rebuilt the fort walls in 1820",
    })

    assert good.json()["validation_status"] == "quote_found"
    assert good.json()["publisher"] == "Maharashtra State Gazetteers Department"
    assert bad.status_code == 422


@pytest.mark.skipif(not (shutil.which("tesseract") and shutil.which("pdftoppm")), reason="OCR tools not installed")
def test_real_ocr_reads_a_scanned_page():
    """Render a PDF page to an image with Poppler, then read it back with Tesseract."""
    pdf = make_pdf("Sindhudurg Fort was built on Kurte island")
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-r", "200", "-png", "-singlefile", "-", f"{tmp}/page"], input=pdf, check=True)
        with open(f"{tmp}/page.png", "rb") as image:
            text = ocr.image_to_text(image.read(), "eng")
    # OCR may split or join words ("F ort"); the quote check tolerates that, so check the same way.
    from app.services.quote_check import find_excerpt

    assert find_excerpt(text, "Sindhudurg Fort was built on Kurte island") is not None
