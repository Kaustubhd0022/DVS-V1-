"""Terms & Conditions acceptance and the signed-copy email (SMTP)."""

import email
import smtplib
import socket
from email import policy

import pytest
from aiosmtpd.controller import Controller

from app.api import terms as terms_api
from app.config import settings
from app.models import TermsAcceptance
from app.services import mailer
from app.terms import CURRENT_TERMS
from tests.conftest import auth_headers

ACCEPT = {"terms_version": CURRENT_TERMS.version, "signed_name": "Asha Verma", "agree": True}


class _SessionProxy:
    """Lets the background task use the test's transactional session without closing it."""

    def __init__(self, session):
        self._session = session

    def __getattr__(self, name):
        return getattr(self._session, name)

    def close(self):
        pass


@pytest.fixture(autouse=True)
def smtp_and_session(monkeypatch, test_db):
    monkeypatch.setattr(terms_api, "SessionLocal", lambda: _SessionProxy(test_db))
    monkeypatch.setattr(terms_api, "RETRY_DELAYS_SECONDS", (0, 0, 0))
    monkeypatch.setattr(settings, "SMTP_HOST", "smtp.test.invalid")
    monkeypatch.setattr(settings, "SMTP_PORT", 587)
    monkeypatch.setattr(settings, "SMTP_USERNAME", "sender@example.com")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "super-secret-password")
    monkeypatch.setattr(settings, "SMTP_FROM", "Terms <sender@example.com>")
    monkeypatch.setattr(settings, "SMTP_SECURITY", "starttls")
    monkeypatch.setattr(settings, "TERMS_RECIPIENT_EMAIL", "renee@manuvanzara.com")
    terms_api.resend_limiter.reset()


@pytest.fixture
def sent(monkeypatch):
    """Capture outgoing messages instead of opening a network connection."""
    messages = []
    monkeypatch.setattr(mailer, "_send", lambda message: messages.append(message))
    return messages


def record(test_db):
    return test_db.query(TermsAcceptance).one()


def test_terms_text_is_public_and_clean(client):
    response = client.get("/api/terms")
    assert response.status_code == 200
    body = response.json()
    assert body["version"] == CURRENT_TERMS.version
    assert len(body["sha256"]) == 64
    assert body["text"].startswith("# Notice")
    assert "<!--" not in body["text"]  # maintainer comment is not shown to users


def test_status_requires_sign_in_and_starts_unaccepted(client, user_a):
    assert client.get("/api/terms/status").status_code == 401
    assert client.post("/api/terms/accept", json=ACCEPT).status_code == 401

    headers, _ = user_a
    status = client.get("/api/terms/status", headers=headers).json()
    assert status["accepted"] is False
    assert status["current_version"] == CURRENT_TERMS.version


def test_accept_records_signature_and_emails_the_signed_pdf(client, user_a, test_db, sent):
    headers, user = user_a
    response = client.post(
        "/api/terms/accept", headers={**headers, "User-Agent": "TestBrowser/1.0"}, json=ACCEPT
    )

    assert response.status_code == 200, response.text
    assert response.json()["signed_name"] == "Asha Verma"

    row = record(test_db)
    assert str(row.user_id) == user["id"]
    assert row.terms_version == CURRENT_TERMS.version
    assert row.terms_sha256 == CURRENT_TERMS.sha256
    assert row.user_agent == "TestBrowser/1.0"
    assert row.ip_address
    assert row.email_status == "sent"
    assert row.email_sent_at is not None
    assert row.email_error is None

    assert len(sent) == 1
    message = sent[0]
    assert message["To"] == "renee@manuvanzara.com"
    assert message["From"] == "Terms <sender@example.com>"
    assert "Asha Verma" in message["Subject"]
    pdfs = [part for part in message.iter_attachments() if part.get_content_type() == "application/pdf"]
    assert len(pdfs) == 1
    assert pdfs[0].get_content().startswith(b"%PDF")

    status = client.get("/api/terms/status", headers=headers).json()
    assert status["accepted"] is True
    assert status["acceptance"]["email_status"] == "sent"


def test_accepting_twice_keeps_one_record_and_one_email(client, user_a, test_db, sent):
    headers, _ = user_a
    first = client.post("/api/terms/accept", headers=headers, json=ACCEPT).json()
    second = client.post(
        "/api/terms/accept", headers=headers, json={**ACCEPT, "signed_name": "Someone Else"}
    ).json()

    assert second["signed_name"] == first["signed_name"] == "Asha Verma"
    assert test_db.query(TermsAcceptance).count() == 1
    assert len(sent) == 1


def test_accept_validation(client, user_a, test_db, sent):
    headers, _ = user_a

    not_agreed = client.post("/api/terms/accept", headers=headers, json={**ACCEPT, "agree": False})
    assert not_agreed.status_code == 422

    short_name = client.post("/api/terms/accept", headers=headers, json={**ACCEPT, "signed_name": "A"})
    assert short_name.status_code == 422

    blank_name = client.post("/api/terms/accept", headers=headers, json={**ACCEPT, "signed_name": "  \n  "})
    assert blank_name.status_code == 422

    stale = client.post("/api/terms/accept", headers=headers, json={**ACCEPT, "terms_version": "old"})
    assert stale.status_code == 409
    assert stale.json()["detail"]["current_version"] == CURRENT_TERMS.version

    assert test_db.query(TermsAcceptance).count() == 0
    assert sent == []


def test_signed_name_cannot_inject_email_headers(client, user_a, test_db, sent):
    headers, _ = user_a
    evil = "Mallory\r\nBcc: attacker@example.com"
    response = client.post("/api/terms/accept", headers=headers, json={**ACCEPT, "signed_name": evil})

    assert response.status_code == 200, response.text
    message = sent[0]
    assert message["Bcc"] is None
    assert "\n" not in message["Subject"] and "\r" not in message["Subject"]
    assert "attacker@example.com" not in "".join(f"{k}:{v}" for k, v in message.items() if k != "Subject")


def test_acceptance_is_per_user(client, user_a, user_b, sent):
    headers_a, _ = user_a
    headers_b, _ = user_b
    client.post("/api/terms/accept", headers=headers_a, json=ACCEPT)

    assert client.get("/api/terms/status", headers=headers_a).json()["accepted"] is True
    assert client.get("/api/terms/status", headers=headers_b).json()["accepted"] is False


def test_smtp_failure_keeps_acceptance_records_error_and_can_be_resent(
    client, user_a, test_db, monkeypatch
):
    headers, _ = user_a
    attempts = []

    def failing_send(message):
        attempts.append(1)
        raise smtplib.SMTPAuthenticationError(535, b"bad credentials")

    monkeypatch.setattr(mailer, "_send", failing_send)
    response = client.post("/api/terms/accept", headers=headers, json=ACCEPT)

    assert response.status_code == 200  # the user is never blocked by an email problem
    row = record(test_db)
    assert row.email_status == "failed"
    assert row.email_attempts == 3 and len(attempts) == 3
    assert "SMTP login was rejected" in row.email_error
    assert "super-secret-password" not in row.email_error
    assert client.get("/api/terms/status", headers=headers).json()["accepted"] is True

    # SMTP gets fixed, then the signed copy is re-sent.
    delivered = []
    monkeypatch.setattr(mailer, "_send", lambda message: delivered.append(message))
    resend = client.post("/api/terms/resend", headers=headers)
    assert resend.status_code == 200
    test_db.refresh(row)
    assert row.email_status == "sent"
    assert len(delivered) == 1


def test_resend_does_not_send_twice_once_delivered(client, user_a, sent):
    headers, _ = user_a
    client.post("/api/terms/accept", headers=headers, json=ACCEPT)
    assert client.post("/api/terms/resend", headers=headers).status_code == 200
    assert len(sent) == 1


def test_resend_before_accepting_is_404(client, user_a):
    headers, _ = user_a
    assert client.post("/api/terms/resend", headers=headers).status_code == 404


def test_smtp_not_configured_is_recorded_without_retrying(client, user_a, test_db, monkeypatch):
    headers, _ = user_a
    monkeypatch.setattr(settings, "SMTP_HOST", "")

    response = client.post("/api/terms/accept", headers=headers, json=ACCEPT)

    assert response.status_code == 200
    row = record(test_db)
    assert row.email_status == "failed"
    assert row.email_attempts == 1
    assert "SMTP is not configured" in row.email_error
    assert client.get("/api/terms/status", headers=headers).json()["accepted"] is True


def test_signed_pdf_is_a_valid_pdf_with_the_signature_block():
    from datetime import datetime

    signed = mailer.SignedTerms(
        signed_name="Asha Verma", account_name="Asha", account_email="asha@example.com", user_id="u-1",
        terms_title="Notice", terms_version="v1", terms_sha256="a" * 64,
        terms_text=CURRENT_TERMS.text, accepted_at=datetime(2026, 10, 28, 12, 30, 0),
        ip_address="203.0.113.7", user_agent="Mozilla/5.0 <test> & co", acceptance_id="r-1",
    )
    pdf = mailer.build_signed_pdf(signed)
    assert pdf.startswith(b"%PDF") and pdf.rstrip().endswith(b"%%EOF")
    assert len(pdf) > 3000


# ---- real SMTP over a local server (no mocks on the sending code) -----------------------------

class _Inbox:
    def __init__(self):
        self.envelopes = []

    async def handle_DATA(self, server, session, envelope):
        self.envelopes.append(envelope)
        return "250 Message accepted"


@pytest.fixture
def local_smtp(monkeypatch):
    inbox = _Inbox()
    with socket.socket() as probe:  # find a free port
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    controller = Controller(inbox, hostname="127.0.0.1", port=port)
    controller.start()
    monkeypatch.setattr(settings, "SMTP_HOST", "127.0.0.1")
    monkeypatch.setattr(settings, "SMTP_PORT", port)
    monkeypatch.setattr(settings, "SMTP_SECURITY", "none")
    monkeypatch.setattr(settings, "SMTP_USERNAME", "")  # the local test server has no auth
    monkeypatch.setattr(settings, "SMTP_FROM", "terms@example.com")
    yield inbox
    controller.stop()


def test_signed_form_is_delivered_over_real_smtp(client, user_a, test_db, local_smtp):
    headers, user = user_a
    response = client.post("/api/terms/accept", headers=headers, json=ACCEPT)

    assert response.status_code == 200, response.text
    assert record(test_db).email_status == "sent"

    assert len(local_smtp.envelopes) == 1
    envelope = local_smtp.envelopes[0]
    assert envelope.rcpt_tos == ["renee@manuvanzara.com"]
    assert envelope.mail_from == "terms@example.com"

    parsed = email.message_from_bytes(envelope.content, policy=policy.default)
    assert "Asha Verma" in parsed["Subject"]
    body = parsed.get_body(preferencelist=("plain",)).get_content()
    assert user["email"] in body and CURRENT_TERMS.sha256 in body
    attachment = next(parsed.iter_attachments())
    assert attachment.get_content_type() == "application/pdf"
    assert attachment.get_filename().endswith(".pdf")
    assert attachment.get_content().startswith(b"%PDF")


def test_unreachable_smtp_server_is_reported_cleanly(client, user_a, test_db, monkeypatch):
    headers, _ = user_a
    monkeypatch.setattr(settings, "SMTP_HOST", "127.0.0.1")
    monkeypatch.setattr(settings, "SMTP_PORT", 1)  # nothing listens here
    monkeypatch.setattr(settings, "SMTP_SECURITY", "none")
    monkeypatch.setattr(settings, "SMTP_USERNAME", "")

    response = client.post("/api/terms/accept", headers=headers, json=ACCEPT)

    assert response.status_code == 200
    row = record(test_db)
    assert row.email_status == "failed"
    assert row.email_error.startswith("Could not send email (")
