# ApplyPilot — User Flows

## 1. New user registration
1. Land on `/` → click **Start Free**.
2. `/register` — enter name, email, password (≥6 chars).
3. Backend hashes password (BCrypt), returns a JWT.
4. Token + user stored in `localStorage`; redirect to `/dashboard`.

## 2. Login
1. `/login` — enter email + password.
2. On success, token stored, redirect to `/dashboard`.
3. The JWT interceptor attaches `Authorization: Bearer …` to every API call.
4. A `401` from any protected call logs the user out and redirects to `/login`.

## 3. Add a resume
1. **Resumes** → **New Resume**.
2. Enter a title (e.g. "Java Full Stack Resume") and paste the resume text.
3. Optionally mark **primary** (the first resume auto-becomes primary).
4. Save → returns to the resume list. Edit / delete / set-primary available per card.

## 4. Add a job description
1. **Jobs** → **New Job**.
2. Enter company, title, and paste the JD text; optional URL/location/type/salary.
3. Save → appears in the jobs table.

## 5. Analyze a match
1. **Analyze** page → pick a resume (defaults to primary) and a job.
2. Click **Analyze Match** (loading spinner shows while the request runs).
3. Backend runs AI analysis if `AI_API_KEY` is set, otherwise the keyword analyzer.
4. Redirect to `/reports/{id}` — the **Match Report**.

## 6. Review the match report
The report shows:
- Match score ring (color-coded) + fit label
- Matched vs missing keywords (pills)
- Strengths and gaps
- Suggested summary + optimized bullet points
- Cover letter, recruiter message, follow-up email (each copyable)
- Interview preparation questions
- A badge indicating **AI** vs **Keyword** analysis

## 7. Save as application
1. On the report, click **Save as application**.
2. A `JobApplication` is created (status `SAVED`) linked to the resume, job, and match report.
3. Confirmation appears with a link to the tracker.

## 8. Update application status
1. **Tracker** page — **Board** (Kanban) or **Table** view.
2. In board view, change the status dropdown on a card → instant `PUT /applications/{id}/status`.
3. Edit an application to set dates, salary, notes.

## 9. Generate a cover letter / recruiter message
1. **Documents** page → choose a document type, optionally a resume + job.
2. Click **Generate** → backend produces the text (AI or template) and stores it.
3. The new document appears at the top of the list; copy or delete it.

## 10. Dashboard review
- Cards: total applications, avg match score, follow-ups due, interviews, offers, rejections.
- Top missing skills across all reports (where to focus upskilling).
- Recent match reports (clickable) and recent applications.

---

### End-to-end happy path (verified by `FullFlowIntegrationTest`)
`register → login → add resume → add job → analyze → view report → save application →
update status → generate document → dashboard`
