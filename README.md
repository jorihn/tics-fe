# Telegram Mini App Frontend (Conversion-first)

Production-ready frontend for a Telegram Mini App focused on moving users from Home -> plan selection -> payment success.

## Tech stack

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS
- Zustand (lightweight state)

## Setup

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Open app

- Browser fallback: `http://localhost:3000`
- Telegram Mini App: open through your bot WebApp button/deep link.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Environment variables

No env vars required for mocked flow right now.

When moving to production payment/analytics, add env vars such as:

- `NEXT_PUBLIC_ANALYTICS_KEY`
- `PAYMENT_API_BASE_URL`
- `PAYMENT_API_KEY` (server-side only)

## Current routes

- `/` — Home page (value proposition + CTA to plans)
- `/agents` — Choose plan + checkout + payment state flow

## Telegram integration

`lib/telegram.ts` exposes `useTelegramWebApp()`:

- Detects `window.Telegram.WebApp`
- Calls `ready()` and `expand()`
- Reads theme params and maps to UI tokens
- Gracefully falls back in normal browser

## Mocked API layer

Located in `lib/api.ts`:

- `fetchPlans()`
- `createPaymentIntent()`
- `confirmPayment()`

This keeps interfaces typed while backend is not integrated.

## Tracking / instrumentation

Located in `lib/tracking.ts`.

Implemented events:

- `entered_start`
- `open_miniapp`
- `view_home`
- `click_view_plans`
- `view_agent_plans`
- `click_choose_plan`
- `click_pay`
- `payment_success`
- `payment_failed`

Current behavior: log to console via pluggable adapter interface.

## Where to plug real payment API later

1. Keep route/page UI unchanged.
2. Replace internals of `lib/api.ts` with real fetch calls:
   - `createPaymentIntent` -> call backend `POST /payments/intents`
   - `confirmPayment` -> call backend `GET /payments/:id/status` or webhook-driven polling endpoint
3. Keep return shapes aligned with `types/payment.ts`.
4. Add robust error mapping in API wrapper so UI can render user-safe messages.

## Notes

- Mobile-first layout with Telegram-friendly touch targets (`>=44px`).
- Includes loading, error, pending, success, and failed states.
- Lint status: `npm run lint` passes.
