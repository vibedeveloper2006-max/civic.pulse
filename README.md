# CivicPulse – Intelligent Election Assistant

> **Hackathon Submission** · Civic Assistant Vertical · Built with Next.js + Gemini AI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Gemini-1.5--Flash-4285F4)](https://ai.google.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://docker.com)

---

## Overview

**CivicPulse** is a production-ready, AI-powered election assistant that guides citizens through the entire voting process — from eligibility verification to finding their polling place on Election Day.

It is a **single-service fullstack application** built on **Next.js** (frontend + API routes), deployed as a single Docker container on **Google Cloud Run**.

---

## Chosen Vertical: Civic Assistant

The application focuses entirely on **voter empowerment**, providing:

- 🗳️ **Eligibility Check** – 4-question step-by-step questionnaire
- 🤖 **AI Assistant** – Gemini-powered conversational assistant for voting questions
- 📍 **Polling Finder** – Locate nearest polling places with wait times
- 📅 **Election Timeline** – Live countdown timers for key deadlines
- 📋 **Smart Guide** – Locked/unlocked stepper tracking voter journey progress
- 👤 **Profile & State Machine** – Persistent voter state across sessions

---

## Architecture

```
civic-pulse/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home dashboard
│   ├── eligibility/        # Eligibility questionnaire
│   ├── assistant/          # AI chat interface
│   ├── polling/            # Polling place finder
│   ├── timeline/           # Election timeline
│   ├── guide/              # Voter guide + stepper
│   ├── profile/            # User state & progress
│   └── api/                # Next.js API routes (backend)
│       ├── assistant/      # POST /api/assistant  → Gemini AI
│       ├── eligibility/    # POST /api/eligibility → rules engine
│       ├── polling/        # GET  /api/polling    → place finder
│       ├── timeline/       # GET  /api/timeline   → events + countdowns
│       └── user/           # GET/POST /api/user   → session state
├── components/             # Reusable React components
│   ├── ui/                 # Button, Badge, Card
│   ├── VoterStatusCard.tsx # Dynamic status display
│   └── SmartStepper.tsx    # Locked/unlocked step guide
├── layouts/                # AppShell (nav + bottom tabs)
├── store/                  # Zustand state machine
├── lib/                    # Types, constants, utils
├── Dockerfile              # Multi-stage production build
└── .env.example            # Required environment variables
```

---

## State Machine

The voter journey is modelled as a finite state machine with 5 states:

```
NOT_STARTED
    │  (complete eligibility questionnaire)
    ▼
ELIGIBILITY_VERIFIED
    │  (register to vote)
    ▼
REGISTERED
    │  (verify registration)
    ▼
READY_TO_VOTE
    │  (cast ballot)
    ▼
VOTED
```

**Implementation:** `store/useUserStore.ts` (Zustand with `persist` middleware)

- State is persisted to `localStorage` across sessions
- The `transitionTo()` function enforces valid transitions only
- `VALID_TRANSITIONS` map prevents illegal state jumps
- Each step in the Smart Stepper is locked until prerequisites are met

---

## Assistant Logic

The AI assistant (`/api/assistant`) uses **Gemini 1.5 Flash** with:

1. **Intent Detection** – classifies user query into: `CHECK_ELIGIBILITY`, `VERIFY_REGISTRATION`, `FIND_POLLING_PLACE`, `DEADLINE_QUERY`, or `GENERAL`
2. **Context Injection** – injects current `voterState` into system prompt
3. **Multi-turn History** – passes last 10 messages for conversation continuity
4. **Follow-up Suggestions** – model returns JSON array of 2–3 next questions
5. **Graceful Fallback** – returns curated responses when no API key is set

**System Prompt Design:**
- Non-partisan, official tone
- Structured response format: `REPLY:`, `INTENT:`, `SUGGESTIONS:`
- Instructs user to verify info with official sources

---

## Google Services Used

| Service | Purpose |
|---|---|
| **Gemini 1.5 Flash** | Conversational AI assistant |
| **Google Maps API** | Polling booth map (configure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) |
| **Google OAuth** | Authentication via NextAuth (optional) |
| **Google Cloud Run** | Single-container deployment |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19 |
| Styling | Tailwind CSS v4 + Civic Design System |
| State | Zustand (persisted to localStorage) |
| AI | Google Gemini 1.5 Flash |
| Backend | Next.js API Routes |
| Auth | NextAuth v5 + Google OAuth |
| Container | Docker (multi-stage, node:18-alpine) |
| Deploy | Google Cloud Run |

---

## Local Development

### Prerequisites
- Node.js 18+
- A Google Gemini API key → [ai.google.dev](https://ai.google.dev)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-org/civic-pulse.git
cd civic-pulse

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

The app works **without a Gemini API key** – the assistant falls back to curated responses.

---

## Docker Build & Run

```bash
# Build image
docker build -t civic-pulse .

# Run locally
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e NEXTAUTH_SECRET=your_secret \
  -e NEXTAUTH_URL=http://localhost:3000 \
  civic-pulse

# Open http://localhost:3000
```

---

## Google Cloud Run Deployment

### Prerequisites
- Google Cloud CLI (`gcloud`) installed and authenticated
- A GCP project with Cloud Run API enabled

### Steps

```bash
# 1. Set variables
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1
export IMAGE=gcr.io/$PROJECT_ID/civic-pulse

# 2. Build and push to Google Artifact Registry
gcloud builds submit --tag $IMAGE

# 3. Deploy to Cloud Run
gcloud run deploy civic-pulse \
  --image $IMAGE \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars GEMINI_API_KEY=your_key,NEXTAUTH_SECRET=your_secret,NEXTAUTH_URL=https://YOUR_SERVICE_URL
```

Cloud Run automatically handles:
- HTTPS termination
- Auto-scaling (including scale-to-zero)
- PORT injection via `process.env.PORT`

### Single URL Access
After deployment, everything is available at one URL:
```
https://civic-pulse-xxxx-uc.a.run.app/        # Frontend
https://civic-pulse-xxxx-uc.a.run.app/api/*   # Backend APIs
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/assistant` | Gemini-powered chat with intent detection |
| `POST` | `/api/eligibility` | Evaluate eligibility from 4 answers |
| `GET` | `/api/polling` | Get nearby polling places |
| `GET` | `/api/timeline` | Get election events with countdowns |
| `GET/POST` | `/api/user` | Read/write session progress |

---

## Edge Cases Handled

| Scenario | Behavior |
|---|---|
| Already registered | Eligibility page shows "Verified" skip screen |
| Location change | Polling API re-fetches booths for new address |
| Resume mid-flow | Zustand persist restores exact state on reload |
| No Gemini API key | Graceful fallback with curated responses |
| Not eligible | Shows alternate education flow with external ECI links |
| All steps complete | State advances to `VOTED`, confetti on Profile page |

---

## Assumptions

1. **Mock data** is used for polling booths
2. Voter registration status verification is simulated; production would use ECI Voter Portal APIs
3. Election dates are illustrative (2026 Lok Sabha or Vidhan Sabha cycle)
4. Authentication is present but optional – all features work without login
5. State persistence is `localStorage`-based (stateless architecture for Cloud Run compatibility)

---

## License

MIT – See [LICENSE](LICENSE)

---

*Built for PromptWars Hackathon 2025 · CivicPulse Team*
