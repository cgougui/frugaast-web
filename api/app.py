import os
import secrets
import string
import stripe
from flask import Flask, request, jsonify

# ==========================================
# Configuration & Credentials
# ==========================================
# TODO: Replace with your actual Stripe keys
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "YOUR_STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "dummy")

app = Flask(__name__)

# ==========================================
# Helper Functions
# ==========================================
def generate_license_key() -> str:
    """
    Generates a secure, random software license key.
    Format: XXXX-XXXX-XXXX-XXXX
    """
    alphabet = string.ascii_uppercase + string.digits
    parts = []
    
    # Generate 4 segments of 4 characters each
    for _ in range(4):
        segment = ''.join(secrets.choice(alphabet) for _ in range(4))
        parts.append(segment)
        
    return '-'.join(parts)

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
        session = event['data']['object']
        
        # 5. Extract customer email securely using .get() to prevent KeyErrors
        customer_details = session.get('customer_details', {})
        customer_email = customer_details.get('email')
        
        if customer_email:
            # 6. Generate the license key and send the email
            license_key = generate_license_key()
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