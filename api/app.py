import os
import smtplib
from email.message import EmailMessage
import secrets
import string
import stripe
from datetime import date, timedelta

import jwt

from flask import Flask, request, jsonify, render_template

# ==========================================
# Configuration & Credentials
# ==========================================
# TODO: Replace with your actual Stripe keys
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "YOUR_STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "dummy")
PRIVATE_KEY_PATH = "/keys/private.pem"

app = Flask(__name__)

# ==========================================
# Helper Functions
# ==========================================
def generate_license_jwt(
    email: str,
    name: str,
    transaction_id: str,
    is_business: bool = False,
) -> str:
    """
    Generate an RS256-signed license JWT.

    The license is valid for updates for one year from today.
    """

    # Today + 1 year, handling Feb 29 safely
    today = date.today()

    try:
        updates_valid_until = today.replace(year=today.year + 1)
    except ValueError:
        # Feb 29 -> Feb 28 in a non-leap year
        updates_valid_until = today.replace(
            year=today.year + 1,
            day=28,
        )

    with open(PRIVATE_KEY_PATH, "rb") as f:
        private_key = f.read()

    payload = {
        "email": email,
        "name": name,
        "updates_valid_until": updates_valid_until.isoformat(),
        "transaction_id": transaction_id,
        "license_version": 1.0,
        "is_business": is_business,
    }

    return jwt.encode(
        payload,
        private_key,
        algorithm="RS256",
    )

def send_license_email(email_address: str, name: str, license_key: str) -> None:
    """
    Sends the license key email using an SMTP relay.
    Uses Flask's render_template to load the email from a file.
    """
    print("--------------------------------------------------")
    print(f"✉️ [MOCK EMAIL] Sending license key to: {email_address}")
    print(f"🔑 License Key: {license_key}")
    print("--------------------------------------------------")
    
    # 1. Load SMTP credentials from environment variables (Never hardcode!)
    smtp_server = os.environ.get("VITE_SMTP_HOST", "smtp.sendgrid.net")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("VITE_SMTP_USER")
    smtp_pass = os.environ.get("VITE_SMTP_PASSWORD")
    sender_email = "hello@frugaast.dev"

    # Safety check
    if not smtp_user or not smtp_pass:
        print("⚠️ SMTP credentials missing. Skipping email send.")
        return

    # 2. Read and populate the template file using Flask
    # (Since this runs inside the webhook route, the Flask request context is active)
    email_body = render_template(
        "license_email.txt", 
        name=name, 
        license_key=license_key
    )

    # 3. Construct the email
    msg = EmailMessage()
    msg['Subject'] = 'Your License Key'
    msg['From'] = sender_email
    msg['To'] = email_address
    msg.set_content(email_body)

    # 4. Send the email securely
    try:
        # Best Practice: Use a context manager to ensure the connection closes automatically
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls() # Secure the connection with TLS
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        print(f"✅ Successfully sent license email to {email_address}")
    except Exception as e:
        # We catch the error so the webhook doesn't return a 500 status to Stripe
        # If we return 500, Stripe will continually retry generating redundant licenses
        print(f"❌ Failed to send email to {email_address}: {e}")
        

# ==========================================
# Webhook Endpoint
# ==========================================
@app.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    """
    Stripe webhook endpoint to handle successful Payment Link checkouts.
    """
    # 1. Get the raw payload (crucial for signature verification)
    payload = request.data
    
    # 2. Get the signature header sent by Stripe
    sig_header = request.headers.get('Stripe-Signature')
    
    if not sig_header:
        return jsonify({'error': 'Missing Stripe-Signature header'}), 400

    # 3. Verify the signature and construct the event
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        print("❌ Invalid payload")
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print("❌ Invalid signature")
        return jsonify({'error': 'Invalid signature'}), 400
    except Exception as e:
        print(f"❌ Webhook error: {str(e)}")
        return jsonify({'error': 'Webhook error'}), 400

    # 4. Handle the specific event type
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object'].to_dict()
        
        customer_details = session.get('customer_details', {})
        customer_email = customer_details.get('email')
        customer_name = customer_details.get('name', 'Customer') # Get the name
        
        if customer_email:
            license_key = generate_license_jwt(
                email=customer_email,
                name=customer_name,
                transaction_id=session.get('id'),
                is_business=customer_details.get('is_business', False)
            )
            
            # Pass the name into the email sender here:
            send_license_email(customer_email, customer_name, license_key)
            print(f"✅ Successfully fulfilled order for {customer_email}")
        else:
            print("⚠️ No customer email found in checkout session details.")

    return jsonify({'status': 'success'}), 200

# ==========================================
# Application Entry Point
# ==========================================
if __name__ == '__main__':
    # Run the server on port 4242
    print("🚀 Starting local webhook server on port 4242...")
    app.run(port=4242, debug=True)