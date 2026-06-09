# ApplyPilot — Go Live Guide 🚀

This deploys the **backend + database on Render** and the **frontend on Netlify** — all
free-tier-friendly. Total time: ~20 minutes. You'll need (all free) accounts: GitHub (have it),
[Render](https://render.com), [Netlify](https://netlify.com), and optionally
[Groq](https://console.groq.com/keys) for AI.

Config files are already in the repo: [`render.yaml`](../../render.yaml), [`netlify.toml`](../../netlify.toml).

---

## Step 1 — Backend + Database on Render (~10 min)

1. Go to **render.com** → sign up with GitHub.
2. **New + → Blueprint** → select the **`Tharuntan/applypilot`** repo → Render reads `render.yaml`
   and proposes a **Postgres database** + a **web service**. Click **Apply**.
3. Wait for the database to finish creating. Open it → copy the **Internal Database URL**
   (looks like `postgresql://applypilot:PASS@HOST:5432/applypilot`).
4. Convert it to a JDBC URL by adding `jdbc:` and dropping the user/pass:
   ```
   jdbc:postgresql://HOST:5432/applypilot
   ```
5. Open the **applypilot-backend** service → **Environment** → set:
   - `DB_URL` = the JDBC URL from step 4
   - `CORS_ALLOWED_ORIGINS` = your Netlify URL (you'll get it in Step 2; for now put a placeholder and update after)
   - `AI_API_KEY` = your Groq key (optional; leave blank to use the keyword fallback)
   - (`DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` are wired/generated automatically)
6. **Manual Deploy → Deploy latest commit.** When it's live, note the URL, e.g.
   `https://applypilot-backend.onrender.com`.
7. Verify: open `https://applypilot-backend.onrender.com/actuator/health` → should show `{"status":"UP"}`.

## Step 2 — Frontend on Netlify (~5 min)

1. Go to **netlify.com** → sign up with GitHub.
2. **Add new site → Import an existing project** → pick **`Tharuntan/applypilot`**.
   Netlify reads `netlify.toml` automatically (base dir, build command, publish dir).
3. Before the first build, go to **Site settings → Environment variables** and add:
   - `API_BASE_URL` = `https://applypilot-backend.onrender.com/api`  (your Render URL + `/api`)
4. **Deploy site.** You'll get a URL like `https://applypilot.netlify.app`.
5. Go back to Render → backend → set `CORS_ALLOWED_ORIGINS` = your Netlify URL → redeploy.

## Step 3 — Test it live

Open your Netlify URL → register → add a resume → add a job → analyze → save → dashboard.
Done — your app is live on the internet. 🎉

---

## Optional: enable real AI (free)
1. Get a key at [console.groq.com/keys](https://console.groq.com/keys).
2. Render → backend → Environment → set `AI_API_KEY` → redeploy.
3. In the app, **Settings** will show **AI ON · Groq**.

## Optional: custom domain
- Netlify → Domain settings → add your domain (e.g. `applypilot.com`).
- Update `CORS_ALLOWED_ORIGINS` on Render to include it.

## Costs
- Render Postgres: free tier available (expires after 90 days; upgrade ~$7/mo to persist).
- Render web service: `starter` ~$7/mo (always-on). `free` works but sleeps after inactivity (~30s cold start).
- Netlify: free for this.
- Groq: free tier.

## Troubleshooting
| Symptom | Fix |
|---------|-----|
| Frontend loads but API calls fail (CORS) | `CORS_ALLOWED_ORIGINS` on Render must exactly match your Netlify URL (no trailing slash). |
| 502 / long first load | Free Render service was asleep — first request wakes it (~30s). Upgrade to `starter` to avoid. |
| DB connection errors | Re-check `DB_URL` is the JDBC form (`jdbc:postgresql://…`). |
| Login works locally, not in prod | Make sure the frontend was built with `API_BASE_URL` pointing at the Render `/api` URL. |
