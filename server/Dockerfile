# TattvaCo API. Includes Tesseract OCR (English + Indian languages) and Poppler so scanned
# uploads can be read (app/services/ocr.py).
FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin tesseract-ocr-mar tesseract-ocr-san \
        tesseract-ocr-ben tesseract-ocr-guj tesseract-ocr-pan tesseract-ocr-tam tesseract-ocr-tel \
        tesseract-ocr-kan tesseract-ocr-mal tesseract-ocr-ori tesseract-ocr-urd \
        poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

ENV PORT=8000
# Migrations run before the server starts; with the database already at head this is a no-op.
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
