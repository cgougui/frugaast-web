# Usage
```bash
cd docker/
docker compose build
docker compose up -d --force-recreate
```

http://localhost:3006


## Production
```bash
docker compose -f docker-compose.prod.yml up -d --force-recreate 
```


# API
## docker
```
docker exec -ti frugaast-api bash 
(docker) gunicorn --bind 0.0.0.0:4242 app:app
(docker) python -m debugpy --listen 0.0.0.0:9230 -m gunicorn --bind 0.0.0.0:4242 app:app
```

## testing (local)
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


## API Deployment
Added WAF rules for Stripe API : block all adresses not in the webhook IP list -> https://docs.stripe.com/ips

Create webhook on `Stripe > Developers` with event `checkout.session.completed`

### Prod testing troubleshooting
- 404 -> make sure the webhook API endpoint is correct: https://api.frugaast.dev/stripe-webhook
- 502 -> API server not started properly
- 400 -> Probably a "Invalid Signature" problem. Verify the env var STRIPE_WEBHOOK_SECRET (should match `Signing secret` in Stripe)