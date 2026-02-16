You are a senior frontend engineer. Build a production-ready Telegram Mini App focused on conversion.

## Business context
This is a Telegram Mini App used to convert users to paid plans.
After successful payment, users will chat directly with the bot.
Do NOT use jargon like “OKR” in primary copy. Use user-facing, pain-based language:
- “know what to do first”
- “stop missing important tasks”
- “clear weekly plan in 60 seconds”

## Funnel levels
- L1: user sends /start in bot
- L3: user opens Mini App Home
- L6: user opens Choose Agent page
- L7: user clicks Pay
- L8: payment success

We optimize:
- L3/L1
- L6/L3
- L8/L6

## Tech requirements
- Framework: Next.js (App Router) + TypeScript + Tailwind CSS
- UI: mobile-first, Telegram WebApp friendly
- State: simple React state + lightweight store (zustand or context)
- API layer: typed fetch wrappers
- Must run locally with `npm run dev`
- Keep structure clean and scalable

## Pages to implement now
1) / (Home)
2) /agents (Choose Agent + checkout step UI)
No backend integration required yet (use mocked API + clear interfaces).

## UX requirements

### Home page (L3 -> L6)
Goal: user understands value in 5-10s and clicks “View Plans”.
Sections:
1. Hero
- Headline: value outcome-focused (not technical)
- Subheadline: pain-relief message
- Primary CTA: “View Assistant Plans”
- Secondary CTA: “See 30s demo” (can be placeholder)
2. Benefit bullets (3 max)
3. Trust strip (privacy, quick setup, cancel anytime)
4. Sticky bottom CTA on mobile: “View Assistant Plans”

### Agent page (L6 -> L7 -> L8)
Goal: choose plan quickly and pay with low friction.
Sections:
1. Plan cards (Starter / Team / Pro)
- Who it’s for
- Main outcome
- Price
- CTA: “Choose this plan”
2. Checkout panel (same page modal/section)
- Selected plan summary
- Payment method tabs: VND (VietQR/Sepay), USDT
- Primary CTA: “Pay now”
3. Payment status states
- pending: “Waiting for payment confirmation…”
- success: “Payment successful. Your assistant is ready in bot.”
- failed: retry + switch method

## Copywriting constraints
- Avoid words: “OKR”, “KR”, “objective hierarchy” on first touch.
- Use plain language for outcomes.
- Short, confidence-building microcopy.
- One clear primary CTA per section.

## Telegram Mini App integration
- Detect Telegram WebApp environment (`window.Telegram.WebApp`).
- Apply Telegram theme params to UI tokens where possible.
- Provide graceful fallback in normal browser.
- Expose helper hook: `useTelegramWebApp()`.

## Tracking/instrumentation (mock now, pluggable later)
Implement event tracking utility with these events:
- entered_start
- open_miniapp
- view_home
- click_view_plans
- view_agent_plans
- click_choose_plan
- click_pay
- payment_success
- payment_failed

For now log to console + keep interface ready for analytics provider.

## Project structure (suggested)
/app
/page.tsx # Home
/agents/page.tsx # Plans + Checkout
/components
Hero.tsx
BenefitList.tsx
TrustStrip.tsx
PlanCard.tsx
CheckoutPanel.tsx
PaymentStatus.tsx
/lib
telegram.ts # Telegram helpers
tracking.ts # event tracking
api.ts # mocked API adapters
/types
plan.ts
payment.ts

## Design system basics
- Clean, modern, high-contrast CTA
- Touch targets >= 44px
- Max width for mobile readability
- Clear visual hierarchy
- Subtle motion for CTA feedback
- Loading/skeleton and error states included

## Acceptance criteria
1. Home page clearly communicates value and routes to /agents.
2. Agent page allows selecting a plan and simulating payment flow:
idle -> pending -> success/failed.
3. Telegram WebApp helper works (or safely no-op in browser).
4. Tracking events fire at the right interaction points.
5. Code is typed, reusable, and clean.
6. README includes:
- setup
- env vars (if any)
- how to run
- where to plug real payment API later

## Deliverables
- Complete code
- README
- Brief “conversion rationale” note explaining key UX decisions mapped to L3/L1, L6/L3, L8/L6.