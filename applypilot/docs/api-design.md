# ApplyPilot — API Design

Base URL: `http://localhost:8080/api`
Auth: all endpoints except `POST /auth/register` and `POST /auth/login` require header
`Authorization: Bearer <JWT>`. Content type is `application/json`.

Errors use a consistent shape:
```json
{ "timestamp": "2026-06-08T12:00:00Z", "status": 400, "error": "Bad Request", "message": "..." }
```
Validation errors add a `fieldErrors` map.

---

## Auth

### POST /auth/register
```json
// request
{ "fullName": "Jane Dev", "email": "jane@example.com", "password": "password123" }
// 200 response
{
  "token": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "expiresInMs": 86400000,
  "user": { "id": 1, "fullName": "Jane Dev", "email": "jane@example.com", "role": "USER", "createdAt": "..." }
}
```

### POST /auth/login
```json
// request
{ "email": "jane@example.com", "password": "password123" }
// 200 response  -> same AuthResponse shape as register
```

### GET /auth/me
```json
// 200 response
{ "id": 1, "fullName": "Jane Dev", "email": "jane@example.com", "role": "USER", "createdAt": "..." }
```

---

## Resumes

### POST /resumes  → 201
```json
{ "title": "Java Full Stack Resume", "content": "…full text…", "primaryResume": true }
```
### GET /resumes  → 200 `[ResumeResponse]`
### GET /resumes/{id} → 200
```json
{ "id": 1, "title": "Java Full Stack Resume", "content": "…", "primaryResume": true,
  "createdAt": "…", "updatedAt": "…" }
```
### PUT /resumes/{id} → 200 (same body as POST)
### PUT /resumes/{id}/primary → 200 (marks this resume primary, clears others)
### DELETE /resumes/{id} → 204

---

## Job Descriptions

### POST /job-descriptions → 201
```json
{
  "companyName": "Acme Corp", "jobTitle": "Senior Java Engineer",
  "jobUrl": "https://acme.com/jobs/123", "location": "Remote",
  "employmentType": "Full-time", "salaryRange": "$130k–$160k",
  "descriptionText": "We need Java, Spring Boot, Kubernetes, AWS…"
}
```
### GET /job-descriptions → 200 `[JobDescriptionResponse]`
### GET /job-descriptions/{id} → 200
### PUT /job-descriptions/{id} → 200
### DELETE /job-descriptions/{id} → 204

---

## Match Reports

### POST /match/analyze → 200
```json
// request
{ "resumeId": 1, "jobDescriptionId": 1 }
// response (abridged)
{
  "id": 10, "resumeId": 1, "resumeTitle": "Java Full Stack Resume",
  "jobDescriptionId": 1, "companyName": "Acme Corp", "jobTitle": "Senior Java Engineer",
  "matchScore": 72,
  "matchedKeywords": ["Java", "Spring Boot", "Angular"],
  "missingKeywords": ["Kubernetes", "AWS", "Kafka"],
  "importantSkills": ["Java", "Spring Boot", "Kubernetes", "AWS"],
  "strengths": ["Resume covers 4 of 7 key skills…"],
  "gaps": ["Missing keywords: Kubernetes, AWS, Kafka…"],
  "suggestedSummary": "Results-driven software engineer…",
  "optimizedBullets": ["Designed and built features using Java…"],
  "coverLetter": "Dear Hiring Manager, …",
  "recruiterMessage": "Hi [Recruiter Name], …",
  "followUpEmail": "Subject: Following up… ",
  "interviewQuestions": ["Walk me through a project…"],
  "aiGenerated": false,
  "createdAt": "…"
}
```
> `aiGenerated` is `true` when an AI provider produced the analysis, `false` for keyword fallback.

### GET /match/reports → 200 `[MatchReportResponse]`
### GET /match/reports/{id} → 200
### DELETE /match/reports/{id} → 204

---

## Applications

### POST /applications → 201
```json
{
  "companyName": "Acme Corp", "jobTitle": "Senior Java Engineer",
  "jobUrl": "https://…", "location": "Remote", "salaryRange": "$130k–$160k",
  "applicationDate": "2026-06-08", "followUpDate": "2026-06-15",
  "status": "APPLIED", "notes": "Referred by …",
  "resumeId": 1, "jobDescriptionId": 1, "matchReportId": 10
}
```
### GET /applications?status=INTERVIEW → 200 `[ApplicationResponse]` (status filter optional)
### GET /applications/{id} → 200
### PUT /applications/{id} → 200 (same body as POST)
### PUT /applications/{id}/status → 200
```json
{ "status": "INTERVIEW" }
```
### DELETE /applications/{id} → 204

Statuses: `SAVED, APPLIED, RECRUITER_SCREEN, INTERVIEW, OFFER, REJECTED, WITHDRAWN`.

---

## Generated Documents

### POST /documents/generate → 201
```json
// Provide ids (preferred) or raw text. documentType is required.
{
  "documentType": "COVER_LETTER",
  "resumeId": 1, "jobDescriptionId": 1, "jobApplicationId": 5,
  "title": "Cover Letter - Acme"
}
// response
{ "id": 3, "documentType": "COVER_LETTER", "title": "Cover Letter - Acme",
  "content": "Dear Hiring Manager, …", "jobApplicationId": 5,
  "aiGenerated": false, "createdAt": "…", "updatedAt": "…" }
```
Document types: `COVER_LETTER, RECRUITER_MESSAGE, FOLLOW_UP_EMAIL, THANK_YOU_EMAIL, COLD_EMAIL`.

### GET /documents → 200 `[DocumentResponse]`
### GET /documents/{id} → 200
### DELETE /documents/{id} → 204

---

## Dashboard

### GET /dashboard/summary → 200
```json
{
  "totalApplications": 12, "applicationsThisWeek": 3,
  "interviews": 2, "offers": 1, "rejections": 4, "followUpsDue": 2,
  "averageMatchScore": 68.5, "highestMatchScore": 91,
  "statusBreakdown": [ { "status": "APPLIED", "count": 5 }, … ],
  "recentMatchReports": [ { "id": 10, "companyName": "Acme", "jobTitle": "…", "matchScore": 72, "createdAt": "…" } ],
  "recentApplications": [ { "id": 5, "companyName": "Acme", "jobTitle": "…", "status": "APPLIED", "createdAt": "…" } ],
  "topMissingSkills": [ { "skill": "Kubernetes", "count": 6 }, { "skill": "AWS", "count": 4 } ]
}
```
