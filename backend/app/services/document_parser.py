"""
Extracts raw text from an uploaded complaint document.
Production-grade OCR isn't required per the assignment - this handles
plain-text PDFs (and falls back gracefully for DOCX/EML/TXT).
"""
from pypdf import PdfReader
import io


def extract_text_from_upload(filename: str, content: bytes) -> str:
    lower = filename.lower()

    if lower.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    if lower.endswith((".txt", ".eml")):
        return content.decode("utf-8", errors="ignore")

    if lower.endswith(".docx"):
        import docx  # python-docx
        doc = docx.Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)

    # Fallback: best-effort decode
    return content.decode("utf-8", errors="ignore")
