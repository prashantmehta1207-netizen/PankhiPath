# Connect PankhiPath's hosted AI API

## Why the Vercel version currently cannot identify a photo

The local Vite development server proxies `/api/*` to FastAPI on `127.0.0.1:8000`. A deployed static Vercel site does not run that laptop-local FastAPI process. The public frontend needs a public HTTPS API URL.

## Before hosting the backend

1. Push these updated files to GitHub.
2. Deploy the backend as a separate service (Dockerfile: `Dockerfile.api`).
3. Set `FRONTEND_ORIGINS` on the backend to your exact Vercel origin, e.g. `https://pankhipath.vercel.app` (use the actual domain Vercel assigned). Include `http://localhost:5173` only if local development is also needed.
4. After deploy, open `https://YOUR-BACKEND-DOMAIN/api/health`. It should return JSON with `"ok": true`. The first model download may only occur on first prediction.
5. In Vercel Project → Settings → Environment Variables, add `VITE_API_BASE_URL` with value `https://YOUR-BACKEND-DOMAIN` (no trailing slash), for Production (and Preview if desired).
6. Redeploy the Vercel project so Vite rebuilds with that variable.
7. Test photo ID and sound ID again.

## Important hosting / privacy notes

- Do not put `localhost:8000` in Vercel's `VITE_API_BASE_URL`. In a visitor's browser, localhost means that visitor's own device.
- The API service must accept public HTTPS requests and its CORS allowlist must include the exact Vercel origin.
- The Dockerfile installs FFmpeg, BirdNET and optional CLIP dependencies. CLIP downloads about 605 MB of weights at first use. Choose a backend host with enough RAM; Render's free service has 512 MB RAM, so it is likely too small for PyTorch/CLIP and can restart or crash. Check current provider plan details before choosing a paid instance.
- Hosted inference receives uploaded sound/photo files. The frontend now displays an explicit notice when `VITE_API_BASE_URL` is configured. Do not describe hosted inference as staying on the visitor's computer.
- If you do not want to pay for an online AI backend, keep the public Vercel site as a frontend demo and run actual AI locally with `./start-mac.sh` at `http://localhost:5173`.

## Local development

Leave `VITE_API_BASE_URL` unset/blank. Vite's dev proxy will continue sending `/api/*` requests to `http://127.0.0.1:8000`.
