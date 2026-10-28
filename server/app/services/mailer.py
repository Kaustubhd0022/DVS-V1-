"""
Signed Notice (terms) form: build the PDF and email it over SMTP.

SMTP settings come from the environment (SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD,
SMTP_FROM, SMTP_SECURITY). The password is never logged.
"""

import io
import logging
import re
import smtplib
import ssl
from dataclasses import dataclass
from datetime import datetime
from email.message import EmailMessage
from typing import Optional
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.config import settings

logger = logging.getLogger(__name__)

_CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f]")


class MailError(Exception):
    """SMTP problem with a message that is safe to store and show (never contains credentials)."""


@dataclass
class SignedTerms:
    """Everything that goes on the signed form."""
    signed_name: str
    account_name: str
    account_email: str
    user_id: str
    terms_title: str
    terms_version: str
    terms_sha256: str
    terms_text: str
    accepted_at: datetime  # UTC
    ip_address: Optional[str]
    user_agent: Optional[str]
    acceptance_id: str


def clean_line(value: Optional[str], limit: int = 200) -> str:
    """Single line, no control characters (safe for email headers and PDF cells)."""
    return _CONTROL_CHARS.sub(" ", value or "").strip()[:limit]


def smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and (settings.SMTP_FROM or settings.SMTP_USERNAME))


def build_signed_pdf(signed: SignedTerms) -> bytes:
    """A readable PDF: signature block first, then the exact terms text that was agreed to."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=18 * mm,
        title=f"Signed {signed.terms_title}", author="Terms acceptance record",
    )
    styles = getSampleStyleSheet()
    title = ParagraphStyle("T", parent=styles["Title"], fontSize=18, spaceAfter=4)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=12, spaceBefore=10, spaceAfter=3)
    body = ParagraphStyle("B", parent=styles["BodyText"], fontSize=9.5, leading=13)
    cell = ParagraphStyle("C", parent=body, fontSize=9, leading=12)
    cell_bold = ParagraphStyle("CB", parent=cell, fontName="Helvetica-Bold")

    def row(label: str, value: str):
        return [Paragraph(escape(label), cell_bold), Paragraph(escape(value) or "-", cell)]

    accepted = signed.accepted_at.strftime("%d %b %Y, %H:%M:%S UTC")
    rows = [
        row("Signed by (typed name)", clean_line(signed.signed_name)),
        row("Account name", clean_line(signed.account_name)),
        row("Account email", clean_line(signed.account_email)),
        row("Account ID", clean_line(signed.user_id)),
        row("Accepted at", accepted),
        row("IP address", clean_line(signed.ip_address) or "not available"),
        row("Browser", clean_line(signed.user_agent, 300) or "not available"),
        row("Terms version", clean_line(signed.terms_version)),
        row("Terms SHA-256", clean_line(signed.terms_sha256, 64)),
        row("Record ID", clean_line(signed.acceptance_id)),
    ]
    table = Table(rows, colWidths=[45 * mm, 125 * mm])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.whitesmoke, colors.white]),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.grey),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))

    story = [
        Paragraph(f"Signed {escape(signed.terms_title)}", title),
        Paragraph("Electronic acceptance record", body),
        HRFlowable(width="100%", thickness=0.8, color=colors.grey, spaceBefore=6, spaceAfter=8),
        table,
        Spacer(1, 6),
        Paragraph(
            f"The person named above confirmed that they had read and agreed to the {escape(signed.terms_title)} "
            f"(version {escape(signed.terms_version)}) reproduced below, and signed by typing their name.",
            body,
        ),
        HRFlowable(width="100%", thickness=0.8, color=colors.grey, spaceBefore=10, spaceAfter=4),
    ]

    for line in signed.terms_text.split("\n"):
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("# "):
            story.append(Paragraph(escape(stripped[2:]), title))
        elif stripped.startswith("## "):
            story.append(Paragraph(escape(stripped[3:]), h2))
        else:
            story.append(Paragraph(escape(stripped), body))
            story.append(Spacer(1, 3))

    doc.build(story)
    return buffer.getvalue()


def build_message(signed: SignedTerms, pdf: bytes) -> EmailMessage:
    sender = settings.SMTP_FROM or settings.SMTP_USERNAME
    name = clean_line(signed.signed_name, 80)
    accepted = signed.accepted_at.strftime("%d %b %Y, %H:%M UTC")

    message = EmailMessage()
    message["From"] = sender
    message["To"] = settings.TERMS_RECIPIENT_EMAIL
    message["Subject"] = f"Signed {clean_line(signed.terms_title, 60)} - {name} ({clean_line(signed.account_email, 120)})"
    message["Reply-To"] = clean_line(signed.account_email, 200)
    message.set_content(
        f"A user has accepted the {clean_line(signed.terms_title, 60)}. The signed form is attached as a PDF.\n\n"
        f"Signed by:      {name}\n"
        f"Account email:  {clean_line(signed.account_email)}\n"
        f"Accepted at:    {accepted}\n"
        f"IP address:     {clean_line(signed.ip_address) or 'not available'}\n"
        f"Terms version:  {clean_line(signed.terms_version)}\n"
        f"Terms SHA-256:  {clean_line(signed.terms_sha256, 64)}\n"
        f"Record ID:      {clean_line(signed.acceptance_id)}\n"
    )
    filename = f"signed-terms-{re.sub(r'[^A-Za-z0-9._-]+', '-', clean_line(signed.account_email, 80))}.pdf"
    message.add_attachment(pdf, maintype="application", subtype="pdf", filename=filename)
    return message


def _send(message: EmailMessage) -> None:
    host, port = settings.SMTP_HOST, settings.SMTP_PORT
    security = (settings.SMTP_SECURITY or "starttls").lower()
    timeout = settings.SMTP_TIMEOUT_SECONDS
    context = ssl.create_default_context()

    if security == "ssl":
        client = smtplib.SMTP_SSL(host, port, timeout=timeout, context=context)
    else:
        client = smtplib.SMTP(host, port, timeout=timeout)
    with client:
        if security == "starttls":
            client.starttls(context=context)
        if settings.SMTP_USERNAME:
            client.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        client.send_message(message)


def send_signed_terms(signed: SignedTerms) -> None:
    """Send the signed form to TERMS_RECIPIENT_EMAIL. Raises MailError (safe message) on failure."""
    if not smtp_configured():
        raise MailError("SMTP is not configured (set SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM).")

    try:
        message = build_message(signed, build_signed_pdf(signed))
        _send(message)
    except smtplib.SMTPAuthenticationError:
        raise MailError("SMTP login was rejected. Check SMTP_USERNAME and SMTP_PASSWORD.")
    except smtplib.SMTPRecipientsRefused:
        raise MailError("The recipient address was refused by the mail server.")
    except smtplib.SMTPSenderRefused:
        raise MailError("The sender address (SMTP_FROM) was refused by the mail server.")
    except (smtplib.SMTPException, OSError) as error:
        # Includes DNS failures, refused connections and timeouts. Class name only: no credentials.
        raise MailError(f"Could not send email ({type(error).__name__}).")
    except Exception as error:
        logger.exception("Unexpected error while building or sending the signed terms email")
        raise MailError(f"Could not prepare the email ({type(error).__name__}).")
