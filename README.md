This is a [Next.js](https://nextjs.org) wedding site.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## External Payment Links

This version uses the simplest payment approach:

- no backend logic
- no webhooks
- no database
- a gift list where each item can open a hosted checkout link from Mercado Pago or Stripe

To enable those buttons, edit `content/siteContent.ts` and fill the links inside `weddingGifts`:

```ts
weddingGifts: [
  {
    id: "gift-jantar",
    title: "Jantar especial",
    priceLabel: "R$ 180",
    mercadoPagoLink: "https://...",
    stripeLink: "https://..."
  }
]
```

If the item links are empty, the site still renders the gift cards and keeps showing the manual Pix section as fallback.

## Deploy on Vercel

This version is static-friendly and works well on Vercel because it does not depend on server-side payment routes.
