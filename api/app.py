import os
import secrets
import string
import stripe
from datetime import date, timedelta

import jwt

from flask import Flask, request, jsonify

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

def send_license_email(email: str, license_key: str) -> None:
    """
    Dummy function to simulate sending an email to the customer.
    In production, integrate with SendGrid, Postmark, AWS SES, etc.
    """
    print("--------------------------------------------------")
    print(f"✉️ [MOCK EMAIL] Sending license key to: {email}")
    print(f"🔑 License Key: {license_key}")
    print("--------------------------------------------------")
    
    # TODO: Add your actual email sending logic here
    pass

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
        
        # 5. Extract customer email securely using .get() to prevent KeyErrors
        customer_details = session.get('customer_details', {})
        customer_email = customer_details.get('email')
        
        if customer_email:
            # 6. Generate the license key and send the email
            license_key = generate_license_jwt(
                email=customer_email,
                name=customer_details.get('name', 'Customer'),
                transaction_id=session.get('id'),
                is_business=customer_details.get('is_business', False)
            )
            send_license_email(customer_email, license_key)
            print(f"✅ Successfully fulfilled order for {customer_email}")
        else:
            print("⚠️ No customer email found in checkout session details.")

    # Return a 200 OK to acknowledge receipt of the event
    return jsonify({'status': 'success'}), 200

# ==========================================
# Application Entry Point
# ==========================================
if __name__ == '__main__':
    # Run the server on port 4242
    print("🚀 Starting local webhook server on port 4242...")
    app.run(port=4242, debug=True)