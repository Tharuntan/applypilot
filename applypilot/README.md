# ApplyPilot 🚀

**Apply smarter, not harder.**

ApplyPilot is an end-to-end AI job application platform for IT/software job seekers. Match your resume to any
job description, get an ATS-style score with keyword gaps, generate application documents (cover letter,
recruiter message, follow-up email), and track every application from *Saved* to *Offer* — all in one place.

> MVP built with **Spring Boot 3 (Java 21)** + **Angular 18** + **PostgreSQL**. Works **with or without** an
> AI API key (a built-in keyword analyzer + templates keep it useful offline).

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Environment Variables](#environment-variables)
6. [API Overview](#api-overview)
7. [Test User Flow](#test-user-flow)
8. [Project Structure](#project-structure)
9. [Troubleshooting](#troubleshooting)
10. [Known Limitations](#known-limitations)
11. [Next Steps](#next-steps)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 21, Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security, JWT (jjwt), Lombok, Bean Validation |
| Database | PostgreSQL 16 (via Docker Compose); H2 in-memory for tests |
| Frontend | Angular 18 (standalone components, signals), TypeScript, Reactive Forms, Bootstrap 5 (CDN) |
| AI | Any OpenAI-compatible `/chat/completions` endpoint; graceful keyword fallback |
| Build | Maven (backend), Angular CLI / esbuild (frontend) |

## Features

- 🔐 **Auth** — register, login, JWT-protected APIs, BCrypt password hashing, current-user profile
- 📄 **Resume Manager** — multiple versions, mark one primary, full CRUD
- 💼 **Job Description Manager** — company, title, URL, location, type, salary, full text
- 🎯 **Resume + JD Matcher** — match score (0–100), matched/missing keywords, important skills, strengths,
  gaps, suggested summary, optimized bullets, cover letter, recruiter message, follow-up email, interview questions
- 🗂️ **Application Tracker** — 7 statuses, Kanban **and** table views, follow-up dates, notes
- 📊 **Dashboard** — totals, avg/highest match score, follow-ups due, interviews, offers, rejections, top missing skills
- ✍️ **Document Generator** — cover letter, recruiter message, follow-up / thank-you / cold email, all saved

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Java | **21** | Spring Boot 3.3 sweet spot. (If `mvn` picks Java 24/other, set `JAVA_HOME` — see below.) |
| Maven | 3.9+ | |
| Node.js | **18.13+ / 20 / 22** | Angular 18 minimum is 18.13. **Node 8 will NOT work.** |
| npm | 9+ | Ships with modern Node |
| Docker + Compose | recent | For local PostgreSQL |

> **This machine note:** the default shell Node here is an ancient `v8.10.0` (via nvm). A working `v22.9.0`
> is installed — activate it before any frontend command:
> ```bash
> nvm use 22            # or: export PATH="$HOME/.nvm/versions/node/v22.9.0/bin:$PATH"
> ```
> Java 21 lives at `/usr/local/opt/openjdk@21`; pin it for Maven:
> ```bash
> export JAVA_HOME="/usr/local/opt/openjdk@21"
> ```

## Quick Start

### 1. Start PostgreSQL (Docker)
```bash
cd applypilot
docker compose up -d
# Postgres now on localhost:5432  (db=applypilot user=applypilot pass=applypilot)
```

### 2. Run the backend
```bash
cd backend
export JAVA_HOME="/usr/local/opt/openjdk@21"   # ensure Java 21
mvn spring-boot:run
# API on http://localhost:8080
```

### 3. Run the frontend
```bash
cd frontend/applypilot-ui
nvm use 22            # or export the PATH shown above
npm install
npm start
# App on http://localhost:4200
```

Open **http://localhost:4200** and register a new account.

> **No AI key?** No problem. Leave `AI_API_KEY` empty and the app uses the built-in keyword analyzer and
> document templates. To enable AI, set the AI env vars (below) before starting the backend.

## Environment Variables

All backend config has sensible defaults (see [`backend/src/main/resources/application.yml`](backend/src/main/resources/application.yml)).
Override via environment variables — see [`.env.example`](.env.example).

| Variable | Default | Purpose |
|----------|---------|---------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/applypilot` | JDBC URL |
| `DB_USERNAME` / `DB_PASSWORD` | `applypilot` / `applypilot` | DB creds |
| `JWT_SECRET` | dev secret (**change in prod**) | HMAC signing key (≥32 bytes) |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | Token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200` | Allowed frontend origins (comma-sep) |
| `AI_API_KEY` | _(empty)_ | OpenAI-compatible key. Empty ⇒ fallback mode |
| `AI_BASE_URL` | `https://api.openai.com/v1` | Provider base URL |
| `AI_MODEL` | `gpt-4o-mini` | Model id |
| `SERVER_PORT` | `8080` | Backend port |

## API Overview

Base URL: `http://localhost:8080/api`. All endpoints except register/login require `Authorization: Bearer <token>`.

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Resumes | `GET/POST /resumes`, `GET/PUT/DELETE /resumes/{id}`, `PUT /resumes/{id}/primary` |
| Jobs | `GET/POST /job-descriptions`, `GET/PUT/DELETE /job-descriptions/{id}` |
| Match | `POST /match/analyze`, `GET /match/reports`, `GET/DELETE /match/reports/{id}` |
| Applications | `GET/POST /applications`, `GET/PUT/DELETE /applications/{id}`, `PUT /applications/{id}/status` |
| Documents | `POST /documents/generate`, `GET /documents`, `GET/DELETE /documents/{id}` |
| Dashboard | `GET /dashboard/summary` |

Full request/response examples in [`docs/api-design.md`](docs/api-design.md).

### Quick smoke test (curl)
```bash
# Register and capture the token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Jane Dev","email":"jane@example.com","password":"password123"}' | jq -r .token)

# Create a resume
curl -s -X POST http://localhost:8080/api/resumes -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Java Resume","content":"Java, Spring Boot, Angular, PostgreSQL","primaryResume":true}'
```

## Test User Flow

1. Register a new user → 2. Login → 3. Add a resume → 4. Add a job description →
5. Run **Analyze Match** → 6. View the match report → 7. **Save as application** →
8. Update its status (e.g. Interview) → 9. Generate a cover letter → 10. Review the Dashboard.

This exact flow is covered by the backend integration test `FullFlowIntegrationTest`.

## Project Structure

```
applypilot/
├── backend/                     # Spring Boot API
│   ├── src/main/java/com/applypilot/
│   │   ├── ai/                   # AiService, OpenAiCompatibleAiService, FallbackKeywordAnalyzer, dictionary
│   │   ├── config/               # ApplyPilotProperties
│   │   ├── controller/           # REST controllers
│   │   ├── domain/               # JPA entities + enums
│   │   ├── dto/                  # request/response records
│   │   ├── exception/            # global error handling
│   │   ├── repository/           # Spring Data repositories
│   │   ├── security/             # JWT filter, security config, user details
│   │   └── service/              # business logic
│   ├── src/test/java/...         # unit + integration tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/applypilot-ui/       # Angular 18 app
│   └── src/app/
│       ├── core/                 # services, models, interceptor, guards
│       └── pages/                # 14 standalone page components
├── docs/                         # product, api, db, flows, monetization
├── docker-compose.yml            # PostgreSQL
├── .env.example
└── README.md
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ng`/`npm` errors like `Cannot find module 'node:path'` | You're on Node 8. Run `nvm use 22`. |
| Maven uses wrong Java / Lombok errors | `export JAVA_HOME="/usr/local/opt/openjdk@21"` before `mvn`. |
| Backend can't connect to DB | Is `docker compose up -d` running? Check `docker ps`. |
| `401 Unauthorized` in UI | Token expired or missing — log out and back in. |
| CORS error in browser | Ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:4200`. |
| AI responses look generic | No `AI_API_KEY` set ⇒ fallback mode. Set the AI env vars and restart the backend. |
| Port already in use | Change `SERVER_PORT` (backend) or `--port` (frontend). |

## Known Limitations

- No resume **file** parsing yet (PDF/DOCX) — paste text for now.
- No refresh tokens; single 24h access token.
- AI is single-shot; no streaming or retry-with-backoff beyond one fallback.
- No pagination on list endpoints (fine for MVP volumes).
- No email sending — documents are generated and stored, not sent.
- No payments (see [`docs/monetization-plan.md`](docs/monetization-plan.md)).

## Next Steps

- Resume file upload + parsing (Apache Tika).
- Stripe billing (Free / Pro / one-time pack).
- Browser extension to capture JDs from job boards.
- Email integration for follow-ups.
- Richer analytics + charts on the dashboard.

---

_Built as a complete MVP — backend, frontend, database, AI integration, tests, and docs._
