import smtplib
import os
from email.message import EmailMessage

smtp_server = os.environ.get("VITE_SMTP_HOST", "smtp.purelymail.com")
smtp_port = int(os.environ.get("SMTP_PORT", 465))
smtp_user = os.environ.get("VITE_SMTP_USER")
smtp_pass = os.environ.get("VITE_SMTP_PASSWORD")

print(f"Connecting to {smtp_server}:{smtp_port} as {smtp_user}...")

msg = EmailMessage()
msg['Subject'] = 'Your License Key'
msg['From'] = "hello@frugaast.dev"
msg['To'] = "cgouguen2@gmail.com"
msg.set_content("Hello, this is a test email for your license key.")
    
try:
    # We enable debug level to see the exact server conversation
    with smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=15) as server:
        server.set_debuglevel(1) 
        server.login(smtp_user, smtp_pass)
        print("✅ Connection and login successful!")
        server.send_message(msg)
        print(f"✅ Successfully sent license email to cgouguen2@gmail.com")
except Exception as e:
    print(f"❌ Connection Failed: {e}")