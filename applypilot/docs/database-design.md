# ApplyPilot — Database Design

PostgreSQL. Schema is created/updated automatically by Hibernate (`spring.jpa.hibernate.ddl-auto=update`).
All list-style fields on `match_reports` are stored as JSON strings in `text` columns and (de)serialised in
the service layer (`com.applypilot.support.JsonLists`).

## Entity Relationship Overview

```
users (1) ──< (∞) resumes
users (1) ──< (∞) job_descriptions
users (1) ──< (∞) match_reports >── (1) resumes
                              └──── (1) job_descriptions
users (1) ──< (∞) job_applications ── (0..1) resumes
                                   ── (0..1) job_descriptions
                                   ── (0..1) match_reports
users (1) ──< (∞) generated_documents ── (0..1) job_applications
```

Every owned row carries a `user_id`; ownership is enforced in every query (`findByIdAndUser`).

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | identity |
| full_name | varchar | not null |
| email | varchar | not null, **unique** |
| password_hash | varchar | not null, BCrypt |
| role | varchar | enum `USER`/`ADMIN` |
| created_at / updated_at | timestamp | auditing |

### resumes
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK → users | not null |
| title | varchar | not null |
| content | text | not null (full resume text) |
| primary_resume | boolean | only one true per user (enforced in service) |
| created_at / updated_at | timestamp | |

### job_descriptions
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK → users | not null |
| company_name | varchar | not null |
| job_title | varchar | not null |
| job_url | varchar | nullable |
| location | varchar | nullable |
| employment_type | varchar | nullable |
| salary_range | varchar | nullable |
| description_text | text | not null |
| created_at / updated_at | timestamp | |

### match_reports
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK → users | not null |
| resume_id | bigint FK → resumes | not null |
| job_description_id | bigint FK → job_descriptions | not null |
| match_score | int | 0–100 |
| matched_keywords | text | JSON array string |
| missing_keywords | text | JSON array string |
| important_skills | text | JSON array string |
| strengths | text | JSON array string |
| gaps | text | JSON array string |
| suggested_summary | text | |
| optimized_bullets | text | JSON array string |
| cover_letter | text | |
| recruiter_message | text | |
| follow_up_email | text | |
| interview_questions | text | JSON array string |
| raw_ai_response | text | raw provider output (null in fallback) |
| ai_generated | boolean | true if AI produced it |
| created_at / updated_at | timestamp | |

### job_applications
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK → users | not null |
| resume_id | bigint FK → resumes | nullable |
| job_description_id | bigint FK → job_descriptions | nullable |
| match_report_id | bigint FK → match_reports | nullable |
| company_name | varchar | not null |
| job_title | varchar | not null |
| job_url / location / salary_range | varchar | nullable |
| application_date | date | nullable |
| follow_up_date | date | nullable |
| status | varchar | enum (7 values) |
| notes | text | nullable |
| created_at / updated_at | timestamp | |

### generated_documents
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | bigint FK → users | not null |
| job_application_id | bigint FK → job_applications | nullable |
| document_type | varchar | enum (5 values) |
| title | varchar | not null |
| content | text | not null |
| created_at / updated_at | timestamp | |

## Enums

- **Role:** `USER`, `ADMIN`
- **ApplicationStatus:** `SAVED`, `APPLIED`, `RECRUITER_SCREEN`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`
- **DocumentType:** `COVER_LETTER`, `RECRUITER_MESSAGE`, `FOLLOW_UP_EMAIL`, `THANK_YOU_EMAIL`, `COLD_EMAIL`

## Notes & Trade-offs

- JSON-in-text keeps the schema to 6 tables and avoids join explosions for what are display-only lists. If
  querying inside these lists becomes important, migrate to `jsonb` columns or child tables.
- `ON DELETE` is not cascaded at the DB level for the optional FKs on applications/documents; deletes are
  handled per-aggregate in the service layer for the MVP.
