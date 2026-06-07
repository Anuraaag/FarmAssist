# FarmAssist

FarmAssist is an AI-powered crop disease diagnosis tool built for Indian smallholder farmers. Upload a photo of a diseased crop leaf and receive an instant diagnosis with organic and chemical treatment recommendations, powered by Claude AI.

## Tech Stack

- **Frontend**: Angular 16 (standalone components), TailwindCSS, Angular PWA
- **Backend**: Node.js + Express, TypeScript
- **AI**: Anthropic Claude API (claude-opus-4-5) with vision capability

---

## Local Development Setup

### Prerequisites

- Node.js v18+ and npm v8+
- An Anthropic API key (see below)

### 1. Clone / navigate into the project

```bash
cd farmassist
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm install
npm run dev
```

Backend will be running at **http://localhost:3000**

### 3. Set up the frontend (in a new terminal)

```bash
cd frontend
npm install
npm start
```

Frontend will be running at **http://localhost:4200**

### Quick start commands summary

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm start
```

---

## Getting an Anthropic API Key

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys** in the sidebar
4. Click **Create Key**, copy it
5. Paste it into `backend/.env` as `ANTHROPIC_API_KEY=sk-ant-...`

---

## Deployment

### Backend → Railway

1. Push the `backend/` directory to a GitHub repo (or a monorepo)
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Set the **Root Directory** to `backend`
4. Add these environment variables in Railway's dashboard:
   - `ANTHROPIC_API_KEY` — your API key
   - `PORT` — Railway sets this automatically
   - `FRONTEND_URL` — your Vercel frontend URL (e.g. `https://farmassist.vercel.app`)
5. Railway will auto-detect Node.js and run `npm run build && npm start`

Add to `backend/package.json` scripts if not present:
```json
"build": "tsc",
"start": "node dist/index.js"
```

### Frontend → Vercel

1. Push the `frontend/` directory to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import the repo
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to **Angular**
5. Add environment variable: `VITE_API_URL` (or update `environment.prod.ts` with your Railway backend URL before building)
6. Update `src/environments/environment.prod.ts`:
   ```ts
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend.up.railway.app'
   };
   ```
7. Deploy — Vercel will run `ng build --configuration=production`

---

## Screenshot

```
┌─────────────────────────────────────────┐
│  🌿 FarmAssist                          │
│  AI-powered crop disease diagnosis      │
│─────────────────────────────────────────│
│                                         │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  |        📷                          |  │
│  |  Tap to photograph a crop leaf     |  │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                         │
│        [ Diagnose ]                     │
│                                         │
└─────────────────────────────────────────┘
```

---

## PWA Icons

Add app icons to `frontend/src/assets/icons/` in these sizes:
`72x72`, `96x96`, `128x128`, `144x144`, `152x152`, `192x192`, `384x384`, `512x512` (PNG format).

You can generate them from a single SVG using tools like [PWA Asset Generator](https://www.npmjs.com/package/pwa-asset-generator).
