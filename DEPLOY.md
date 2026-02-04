# Deploying Booking App — Frontend on Netlify, Backend on Render

## Quick summary ✅
- Frontend: Netlify (uses existing `netlify.toml`, build runs in `frontend`)
- Backend: Render as a Web Service (root `backend`, `npm start`)

---

## Before you start
1. Push your repo to GitHub (main branch):
   - git add .
   - git commit -m "prep for deploy"
   - git push origin main
2. Ensure required environment variables are ready:
   - `MONGO_URI` (MongoDB connection string)
   - `JWT_SECRET`
   - `EMAIL_USER`, `EMAIL_PASS` (if email is used)
   - On Netlify: `REACT_APP_API_URL` (your backend URL + `/api`, e.g. `https://your-backend.onrender.com/api`)

---

## Backend — Render (recommended)
1. Go to https://render.com and sign in.
2. Click "New" → "Web Service" → Connect to GitHub → pick your repo.
3. Set the following fields:
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health check path**: `/health` (we added this endpoint)
4. Under Environment, add the variables from "Before you start".
5. Create the service and deploy. Note the generated service URL (e.g., `https://booking-app-backend.onrender.com`).

---

## Frontend — Netlify
1. Go to https://app.netlify.com and sign in.
2. Click "New site from Git" → choose GitHub → select the repo.
3. Netlify will detect `netlify.toml` in repo and use:
   ```toml
   [build]
     base = "frontend"
     command = "npm run build"
     publish = "build"
   ```
4. In Netlify site settings → Build & deploy → Environment → add:
   - `REACT_APP_API_URL` = `https://<your-render-url>/api`
5. Deploy site. Once complete, visit the published URL to confirm UI loads.

---

## After both are deployed
- Test the UI and make sure API calls succeed (open browser console / network tab).
- Confirm you can reach backend at `https://<your-render-url>/` and `https://<your-render-url>/health`.
- If CORS errors appear, open Render service dashboard and verify environment variables and URLs.

---

## Troubleshooting tips
- Check logs in Render if backend fails to start.
- Netlify build failures show log details on the deploy page.
- Make sure `REACT_APP_API_URL` is set before netlify deploy so the built files include the right API URL.

---

If you want, I can:
- Create a `render.toml` or more advanced `render.yaml` config (I already added a basic `render.yaml`).
- Help configure environment variables on Render and Netlify step-by-step via the UI.
- Add a small health-check script or readiness probe if needed.
