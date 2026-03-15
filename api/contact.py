"""Vercel serverless function – contact form to email via Resend API."""

import json
import os
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
MAIL_FROM = os.environ.get("MAIL_FROM", "onboarding@resend.dev")
MAIL_TO = os.environ.get("MAIL_TO", "ozyurts@yahoo.com")


def _row(label, value):
    if not value:
        return ""
    return (
        f'<tr><td style="padding:8px 12px;font-weight:600;color:#555;'
        f'white-space:nowrap;vertical-align:top;border-bottom:1px solid #eee;">{label}</td>'
        f'<td style="padding:8px 12px;border-bottom:1px solid #eee;">{value}</td></tr>'
    )


def _badge(text, color="#e21f26"):
    return (
        f'<span style="display:inline-block;padding:4px 12px;border-radius:20px;'
        f'font-size:12px;font-weight:700;color:#fff;background:{color};">{text}</span>'
    )


def _wrap_html(title, badge_text, badge_color, rows_html, footer_note=""):
    return f"""\
<div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
  <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:28px 32px;">
    <h1 style="margin:0;color:#fff;font-size:20px;">&#9992; Pegasus Peer Support</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">{title}</p>
  </div>
  <div style="padding:24px 32px;">
    <div style="margin-bottom:20px;">{_badge(badge_text, badge_color)}</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;">
      {rows_html}
    </table>
    {f'<div style="margin-top:20px;padding:12px 16px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#666;">{footer_note}</div>' if footer_note else ''}
  </div>
  <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
    <p style="margin:0;font-size:12px;color:#999;">Bu e-posta pegasuspeersupport.com form gönderimi sonucu otomatik oluşturulmuştur.</p>
    <p style="margin:4px 0 0;font-size:12px;color:#999;">{datetime.now().strftime('%d.%m.%Y %H:%M')}</p>
  </div>
</div>"""


def format_contact(data):
    subject_label = data.get("subject_label", data.get("subject", ""))
    name = data.get("name", "Belirtilmedi")
    subject = f"PAPS İletişim: {subject_label} – {name}" if subject_label else f"PAPS İletişim: {name}"
    rows = (
        _row("Ad Soyad", data.get("name"))
        + _row("E-posta", data.get("email"))
        + _row("Konu", subject_label)
        + _row("Mesaj", data.get("message", "").replace("\n", "<br>"))
    )
    return subject, _wrap_html("Yeni İletişim Formu", "İletişim", "#2563eb", rows)


def send_email(subject, html_body):
    payload = json.dumps({
        "from": MAIL_FROM,
        "to": [MAIL_TO],
        "subject": subject,
        "html": html_body,
    }).encode("utf-8")

    req = Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "PAPS-Contact/1.0",
        },
        method="POST",
    )

    try:
        with urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            if "id" not in result:
                raise RuntimeError(f"Resend error: {result}")
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Resend HTTP {exc.code}: {body}") from exc


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
        except (json.JSONDecodeError, ValueError) as exc:
            self._respond(400, {"ok": False, "message": f"Invalid JSON: {exc}"})
            return

        if not RESEND_API_KEY:
            self._respond(500, {"ok": False, "message": "Email service not configured"})
            return

        try:
            subject, html = format_contact(data)
            send_email(subject, html)
            self._respond(200, {"ok": True, "message": "Email sent successfully"})
        except Exception as exc:
            self._respond(500, {"ok": False, "message": str(exc)})

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _respond(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
