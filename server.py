#!/usr/bin/env python3
"""Pegasus Peer Support – static file server with form-to-email handling."""

import http.server
import json
import os
import smtplib
import sys
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

# ── Configuration (override via environment variables) ──────────────────────
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.mail.yahoo.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "ozyurts@yahoo.com")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
MAIL_TO = os.environ.get("MAIL_TO", "ozyurts@yahoo.com")
PORT = int(os.environ.get("PORT", "3000"))


# ── Email formatting ────────────────────────────────────────────────────────

def _row(label, value):
    """Single row in the HTML table."""
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
    subject = f"PAPS İletişim: {subject_label} – {name}"

    rows = (
        _row("Ad Soyad", data.get("name"))
        + _row("E-posta", data.get("email"))
        + _row("Konu", subject_label)
        + _row("Mesaj", data.get("message", "").replace("\n", "<br>"))
    )
    html = _wrap_html("Yeni İletişim Formu", "İletişim", "#2563eb", rows)
    return subject, html


def format_apply(data):
    name = data.get("name", "İsimsiz")
    urgency = data.get("urgency_label", data.get("urgency", ""))
    topic = data.get("topic_label", data.get("topic", ""))
    peer = data.get("peer_label", data.get("peer", ""))

    subject = f"PAPS Başvuru: {name}"
    parts = []
    if urgency:
        parts.append(urgency)
    if topic:
        parts.append(topic)
    if parts:
        subject += " | " + " – ".join(parts)

    rows = (
        _row("Ad Soyad", data.get("name"))
        + _row("Ünvan", data.get("title_label", data.get("title", "")))
        + _row("Lokasyon", data.get("location"))
        + _row("E-posta", data.get("email"))
        + _row("Telefon", data.get("phone"))
        + _row("Aciliyet", urgency)
        + _row("Görüşme Konusu", topic)
        + _row("Peer Seçimi", peer if peer else "Farketmez")
        + _row("Detaylar", data.get("message", "").replace("\n", "<br>"))
    )
    badge_color = {"yuksek": "#dc2626", "high": "#dc2626",
                   "orta": "#f59e0b", "medium": "#f59e0b"}.get(
        data.get("urgency", "").lower(), "#22c55e"
    )
    html = _wrap_html("Yeni Peer Destek Başvurusu", f"Aciliyet: {urgency}", badge_color, rows,
                       "Başvuru sahibi PAPS koşullarını ve aydınlatma metnini kabul etmiştir.")
    return subject, html


def format_apply_other(data):
    person_name = data.get("person_name", "Belirtilmedi")
    urgency = data.get("person_urgency_label", data.get("person_urgency", ""))
    topic = data.get("person_topic_label", data.get("person_topic", ""))

    subject = f"PAPS Yönlendirme: {person_name}"
    parts = []
    if urgency:
        parts.append(urgency)
    if topic:
        parts.append(topic)
    if parts:
        subject += " | " + " – ".join(parts)

    referrer_rows = (
        _row("Pegasus Çalışanı mı?", data.get("is_employee_label", data.get("is_employee", "")))
        + _row("Görev / Departman", data.get("referrer_role_label", data.get("referrer_role", "")))
        + _row("Sicil No", data.get("referrer_sicil", data.get("referrer_id", "")))
        + _row("Yakınlık Durumu", data.get("referrer_relation"))
        + _row("Ad Soyad", data.get("referrer_name", "İsimsiz"))
        + _row("Telefon", data.get("referrer_phone"))
        + _row("E-posta", data.get("referrer_email"))
    )

    person_rows = (
        _row("Ad Soyad", person_name)
        + _row("E-posta", data.get("person_email"))
        + _row("Ünvan", data.get("person_title_label", data.get("person_title", "")))
        + _row("Lokasyon", data.get("person_location"))
        + _row("Aciliyet", urgency)
        + _row("Destek Konusu", topic)
        + _row("Detaylar", data.get("reason", "").replace("\n", "<br>"))
    )

    section_header = (
        '<tr><td colspan="2" style="padding:16px 12px 8px;font-weight:700;'
        'font-size:15px;color:#1a1a2e;border-bottom:2px solid #e21f26;">{}</td></tr>'
    )

    rows = (
        section_header.format("Yönlendiren Kişi")
        + referrer_rows
        + section_header.format("Yönlendirilen Kişi")
        + person_rows
    )

    badge_color = {"yuksek": "#dc2626", "high": "#dc2626",
                   "orta": "#f59e0b", "medium": "#f59e0b"}.get(
        data.get("person_urgency", "").lower(), "#22c55e"
    )
    html = _wrap_html("Yeni Yönlendirme Başvurusu", f"Aciliyet: {urgency}", badge_color, rows,
                       "Yönlendiren kişi PAPS koşullarını ve aydınlatma metnini kabul etmiştir.")
    return subject, html


FORMATTERS = {
    "contact": format_contact,
    "apply": format_apply,
    "apply-other": format_apply_other,
}


# ── SMTP send ───────────────────────────────────────────────────────────────

def send_email(subject, html_body):
    if not SMTP_PASS:
        safe_subject = subject.encode("ascii", "replace").decode("ascii")
        print(f"[MAIL-DRY] To: {MAIL_TO}")
        print(f"[MAIL-DRY] Subject: {safe_subject}")
        print(f"[MAIL-DRY] (SMTP_PASS not set - email logged but not sent)")
        return

    msg = MIMEMultipart("alternative")
    msg["From"] = SMTP_USER
    msg["To"] = MAIL_TO
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, [MAIL_TO], msg.as_string())


# ── HTTP handler ─────────────────────────────────────────────────────────────

class FormHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        # /api/contact | /api/apply | /api/apply-other
        form_type = self.path.replace("/api/", "", 1)
        formatter = FORMATTERS.get(form_type)
        if not formatter:
            self._json(404, {"ok": False, "message": "Unknown endpoint"})
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length).decode("utf-8")
            data = json.loads(raw)
        except (json.JSONDecodeError, ValueError) as exc:
            self._json(400, {"ok": False, "message": f"Invalid JSON: {exc}"})
            return

        try:
            subject, html = formatter(data)
            send_email(subject, html)
            self._json(200, {"ok": True, "message": "Email sent successfully"})
        except Exception as exc:
            err_msg = str(exc).encode("ascii", "replace").decode("ascii")
            print(f"[ERROR] {err_msg}", file=sys.stderr)
            self._json(500, {"ok": False, "message": str(exc)})

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, fmt, *args):
        msg = fmt % args
        if "GET" in msg and any(msg.endswith(ext) for ext in (".css", ".js", ".png", ".jpg", ".ico")):
            return  # suppress static asset logs
        safe = msg.encode("ascii", "replace").decode("ascii")
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {safe}")


# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if not SMTP_PASS:
        print("WARNING: SMTP_PASS not set. Email sending will fail.")
        print("Set it via: export SMTP_PASS='your-yahoo-app-password'")
        print()

    os.chdir(Path(__file__).parent)
    server = http.server.HTTPServer(("", PORT), FormHandler)
    print(f"Serving on http://localhost:{PORT}")
    print(f"Email target: {MAIL_TO}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
