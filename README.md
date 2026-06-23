This is a [Next.js](https://nextjs.org) wedding site with:

- gift list
- cart flow
- InfinitePay checkout
- Neon Postgres persistence
- webhook-based payment confirmation

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create your local env file with values like:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
ENABLE_RUNTIME_DB_SETUP="true"
INFINITEPAY_HANDLE="sua_infinite_tag"
INFINITEPAY_API_BASE_URL="https://api.checkout.infinitepay.io"
INFINITEPAY_WEBHOOK_SECRET="token-opcional-para-proteger-o-webhook"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ADMIN_PASSWORD="uma-senha-forte"
ADMIN_SESSION_SECRET="um-segredo-longo-para-cookie"
CERIMONIAL_PASSWORD="uma-senha-forte-para-cerimonial"
CERIMONIAL_SESSION_SECRET="um-segredo-longo-para-cookie-da-cerimonial"
```

Notes:

- `DATABASE_URL`: Neon Postgres connection string
- `ENABLE_RUNTIME_DB_SETUP`: optional; when `true`, runs automatic `CREATE/ALTER TABLE` safety setup during requests. Leave unset or `false` in production on Vercel for better performance after the tables already exist.
- `INFINITEPAY_HANDLE`: your InfinitePay handle/tag
- `INFINITEPAY_API_BASE_URL`: keep `https://api.checkout.infinitepay.io`
- `INFINITEPAY_WEBHOOK_SECRET`: optional protection token checked by the webhook route
- `NEXT_PUBLIC_SITE_URL`: base URL used to build redirect and webhook URLs
- `ADMIN_PASSWORD`: password used in the couple admin area
- `ADMIN_SESSION_SECRET`: secret used to sign the admin session cookie
- `CERIMONIAL_PASSWORD`: password used in the cerimonial area
- `CERIMONIAL_SESSION_SECRET`: secret used to sign the cerimonial session cookie

## Testing Webhooks Locally With ngrok

For local Pix/card tests that depend on webhook delivery, `localhost` alone is not enough. InfinitePay needs a public URL, so use `ngrok`.

### 1. Start the app

```bash
npm run dev
```

### 2. Start ngrok

If `ngrok` is in the current folder:

```bash
./ngrok.exe http 3000
```

If needed, authenticate first:

```bash
./ngrok.exe config add-authtoken SEU_TOKEN
```

### 3. Copy the public URL

ngrok will show something like:

```text
https://abc123.ngrok-free.app
```

### 4. Update `NEXT_PUBLIC_SITE_URL`

In local testing, change:

```env
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

to:

```env
NEXT_PUBLIC_SITE_URL="https://abc123.ngrok-free.app"
```

### 5. Restart the app

After changing `.env.local`, restart:

```bash
npm run dev
```

### 6. Test the payment flow

Now InfinitePay can reach:

```text
https://abc123.ngrok-free.app/api/payments/infinitepay/webhook
```

Important:

- keep the `ngrok` terminal open during the test
- free ngrok URLs usually change every time you restart the tunnel
- if the URL changes, update `NEXT_PUBLIC_SITE_URL` and restart `npm run dev`

## Production on Vercel

In Vercel, configure these environment variables:

- `DATABASE_URL`
- `INFINITEPAY_HANDLE`
- `INFINITEPAY_API_BASE_URL`
- `INFINITEPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `CERIMONIAL_PASSWORD`
- `CERIMONIAL_SESSION_SECRET`

For production, `NEXT_PUBLIC_SITE_URL` should be your real public domain, for example:

```env
NEXT_PUBLIC_SITE_URL="https://www.casamento-yasmim-vitor.com.br"
```

Do not use `ngrok` in production.

After updating variables in Vercel:

1. Open the project dashboard
2. Go to `Settings > Environment Variables`
3. Save the values
4. Go to `Deployments`
5. Click `Redeploy`

## Admin Areas

- Couple area:
  - login: `/admin`
  - dashboard: `/admin/dashboard`
  - sees RSVPs, guest list management, paid gifts, and total received

- Cerimonial area:
  - login: `/cerimonial`
  - dashboard: `/cerimonial/dashboard`
  - sees only guest presence tracking

How presence tracking works:

- RSVPs continue to be saved in `rsvp_confirmations`
- the couple maintains a base guest list inside the admin area
- the cerimonial dashboard compares that guest list with the latest RSVP by WhatsApp
- derived statuses:
  - `confirmed`
  - `declined`
  - `pending`

## Payment Notes

- Pix was validated successfully in the real checkout flow
- card payments can be subject to InfinitePay anti-fraud checks
- payment confirmation should rely on webhook/status flow, not only the redirect back to the site
