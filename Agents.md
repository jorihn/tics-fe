## Core UX requirements
1) Plan selection must be a **horizontal swipe carousel** (mobile-first).
2) Default selected plan = **Standard Plan**.
3) Keep copy trust-first and simple (safe version, no exaggerated value claims).
4) Support payment state transitions: idle -> pending -> success/failed. ## Page structure (single page: /agents)

### A) Header
- Title: "Choose your plan and start using your AI assistant today"
- Subtext: "One payment, instant activation in Telegram. No complex setup." 
### B) Plan Carousel (REQUIRED)
Implement a horizontally swipeable carousel for plans.
- Show one main card in viewport with peek of adjacent card.
- Snap behavior on swipe.
- Also support tap on pagination dots.
- Keyboard support for desktop fallback (left/right).
- Default active slide: **Standard Plan**.

Plans (safe copy only):

#### Plan 1: Savings Plan
- Badge: "RECOMMENDED"
- Price: "$20"
- Price note: "Tool fee is waived. You only pay for API credits."
- Best for: "Small teams that want the lowest-cost way to plan, assign, and follow up weekly work."
- Includes:
- "Full access to core assistant features"
- "API credits included in this bundle"
- "Enough to set up goals, assign tasks, and track progress for a small team (typical monthly usage)"
- Trade-offs:
- "May be slower during peak traffic"
- "No priority 1:1 support"
- CTA on card: "Choose Savings"

#### Plan 2: Standard Plan (DEFAULT SELECTED)
- Badge: "FASTEST EXPERIENCE"
- Price: "$30"
- Price note: "Includes tool subscription + API credits bundle."
- Best for: "Teams that want faster response time and priority help."
- Includes:
- "Priority processing (no queue)"
- "1:1 support"
- "API credits included in this bundle"
- "Stable day-to-day execution for active teams"
- CTA on card: "Choose Standard"

### C) Optional Trial entry (small section under carousel)
- Title: "Just exploring?"
- Text: "Start with a $10 trial to brainstorm and set up detailed goals with your assistant."
- CTA: "Start Trial"

### D) Micro FAQ (near checkout)
Title: "Quick answers before you pay"

Q1: What happens if I run out of tokens?
A1: You can top up anytime. Your workflow continues smoothly.

Q2: Will I lose memory/context after top-up?
A2: No. Memory and context are preserved.

Q3: Do I need to set up everything again after top-up?
A3: No. No re-setup is needed.

Q4: When does my assistant become active?
A4: Immediately after payment confirmation.