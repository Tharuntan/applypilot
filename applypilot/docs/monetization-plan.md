# ApplyPilot — Monetization Plan

Freemium model with a clear upgrade trigger (AI usage + volume), plus a one-time pack for short, intense
searches. Payments are **not** in the MVP — this is the forward plan.

## Free Plan — $0
For casual / passive job seekers.
- Up to **3 resumes** and **10 saved jobs**
- **5 match analyses / month** using the **keyword fallback** (no AI)
- Application tracker (unlimited applications)
- Dashboard analytics
- 3 generated documents / month (templates)

**Goal:** prove the core loop and drive activation. Match reports are shareable to create organic reach.

## Pro Plan — ~$12 / month (or ~$99 / year)
For active job seekers.
- **Unlimited** resumes & jobs
- **Unlimited AI match analyses** (real LLM): richer summaries, tailored bullets, smarter gap analysis
- **Unlimited AI documents** (cover letters, recruiter messages, follow-ups, thank-you, cold emails)
- Priority/longer context model
- Export to PDF / DOCX (planned)
- Follow-up reminders via email (planned)

**Upgrade trigger:** hitting the monthly AI analysis cap, or wanting AI-quality (not template) output.

## One-time "Job Sprint" Pack — ~$29
For someone job hunting hard for 2–4 weeks who doesn't want a subscription.
- 30 days of **Pro** features
- No recurring billing
- Positioned as "land your next role" sprint

## Future / Add-ons
- **Coach / Team** tier (multi-client dashboards) — ~$39/mo.
- **À la carte AI credits** for free users who want occasional AI runs.
- **Resume review marketplace** (human experts) — take a platform fee.

## Stripe Integration (future plan)
1. Add `subscription`/`plan` fields to `users` (or a `subscriptions` table) + `plan` enum.
2. Backend: Stripe Checkout Session endpoint (`POST /billing/checkout`) and a webhook
   (`POST /billing/webhook`) to sync subscription status (`checkout.session.completed`,
   `customer.subscription.updated/deleted`).
3. Enforce plan limits in services (e.g. a `UsageService` counts monthly AI analyses; gate AI vs fallback by
   plan).
4. Frontend: a billing page using Stripe Checkout redirect; show plan + usage in **Settings**.
5. Use Stripe **test mode** keys via env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price ids).
6. Handle dunning/cancellation gracefully — downgrade to Free, keep data.

## Unit Economics (rough)
- Main variable cost is LLM tokens. Use a small, cheap model (e.g. `gpt-4o-mini`-class) for analysis; cap
  context; cache identical resume↔JD pairs.
- Target gross margin >80% on Pro at expected usage; the keyword fallback makes the **Free** tier ~zero
  marginal cost.
