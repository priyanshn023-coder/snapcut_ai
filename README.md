# snapcut_ai

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-t5gkhhpr)

## Local development

Copy your local environment file before starting the app:

```bash
cp .env .env.local
```

Or create a `.env.local` file with:

```env
VITE_RAZORPAY_KEY=rzp_test_TTbcOSn72HCvBG
VITE_CREATE_ORDER_ENDPOINT=/api/create-order
```

This keeps the app usable in local development without requiring a Vercel deployment. Production still needs its own environment variables configured in Vercel.
