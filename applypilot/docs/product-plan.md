# ApplyPilot — Product Plan

## Problem

Job seekers — especially in IT/software — apply to dozens of roles with a generic resume, no idea how well
they match a given job, and no system to track applications or follow up. The result: low response rates,
wasted effort, and missed opportunities. Tailoring each application manually is slow and tedious.

## Target Users

- **Primary:** Software engineers / IT professionals actively job hunting (junior → senior).
- **Secondary:** Bootcamp grads and career switchers who need help framing their experience.
- **Tertiary:** Career coaches managing multiple clients (future multi-tenant angle).

## Value Proposition

> Match your resume to any job, generate better application materials, and track every application — in one place.

ApplyPilot turns a scattered, manual process into a guided workflow:

`Resume → Job Description → Match Score → Improvements → Documents → Tracker → Follow-up`

## MVP Scope (this build)

- Email/password auth with JWT
- Resume manager (multiple versions, primary flag)
- Job description manager
- Resume↔JD match analysis (AI **or** keyword fallback): score, matched/missing keywords, strengths, gaps,
  summary, bullets, cover letter, recruiter message, follow-up email, interview questions
- Application tracker (7 statuses, Kanban + table, follow-up dates)
- Document generator (cover letter, recruiter message, follow-up / thank-you / cold email)
- Dashboard analytics

## Out of MVP (intentionally deferred)

- Resume file upload/parsing (PDF/DOCX)
- Payments / subscriptions (Stripe)
- Browser extension + job-board scraping
- Email sending / scheduling
- Mobile app
- Team / coach multi-client mode
- Refresh tokens, SSO, password reset emails

## Success Metrics (north stars)

- **Activation:** % of new users who complete ≥1 match analysis in first session.
- **Engagement:** avg applications tracked per active user / week.
- **Outcome:** self-reported interviews & offers logged in the tracker.

## Monetization (summary)

Freemium: free tier for casual users, **Pro** subscription for unlimited AI analyses & documents, and a
one-time **Job Sprint** pack for short, intense searches. Details in
[`monetization-plan.md`](monetization-plan.md).

## Launch Strategy

1. **Private beta** — share with developer communities (Reddit r/cscareerquestions, Discord, LinkedIn).
2. **Content** — "resume vs JD" teardowns and ATS keyword guides to drive SEO.
3. **Product-led growth** — generous free tier, shareable match reports.
4. **Partnerships** — bootcamps and university career centers.
5. **Iterate** — add file upload + Stripe once activation/retention validate the core loop.
