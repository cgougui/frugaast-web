# Usage
```bash
cd docker/
docker compose build
docker compose up -d --force-recreate
```

http://localhost:3006


# API
## docker
```
gunicorn --bind 0.0.0.0:4242 app:app
python -m debugpy --listen 0.0.0.0:9230 -m gunicorn --bind 0.0.0.0:4242 app:app
```

## testing
```bash
curl -X POST http://localhost:4242/stripe-webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=1700000000,v1=fake_signature_to_test_connection" \
  -d '{
    "id": "evt_test_123",
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "customer_details": {
          "email": "customer@example.com"
        }
      }
    }
  }'
```

```bash
# start the local server and put the secret in .env.local
stripe listen --forward-to localhost:4242/stripe-webhook

# generate a fake transaction
stripe trigger checkout.session.completed
```