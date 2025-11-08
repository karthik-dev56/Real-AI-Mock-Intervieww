# 🎙️ Voice-Driven Mock Interview AI (2025)

A full-stack, voice-driven AI interview platform that conducts real-time mock interviews for recruiters and candidates. Built with Next.js, Convex, n8n, Clerk, Arcjet, and shadcn/ui — leveraging Vapi speech recognition and OpenAI GPT-4o to simulate intelligent, adaptive interview sessions with automated scoring, analytics, and AI-generated feedback reports.


🌐 **Live Demo:** [https://real-ai-mock-intervieww.vercel.app/](https://real-ai-mock-intervieww.vercel.app/)

---

## 🚀 Features


### 🎤 Real-Time Voice Interviews
- **Vapi Integration:** Utilizes Vapi's Deepgram (Nova-2) transcription and PlayHT voice synthesis for natural conversations.
- **10-Minute Time Limit:** Each interview session has a 10-minute countdown timer with automatic session termination.
- **5-8 Dynamic Questions:** Randomly selects 5-8 questions from an AI-generated question pool tailored to job descriptions or resumes.
- **Microphone Permission Handling:** Automatic prompt for microphone access with graceful error handling.

### 🧠 AI-Powered Question Generation & Evaluation
- **Two Input Methods:**
  - Upload a PDF resume (ImageKit integration) for resume-based question generation.
  - Provide job title and description for role-specific interview questions.
- **n8n Workflow Automation:** Backend workflows handle question generation and response evaluation via n8n webhooks.
- **OpenAI GPT-4o Model:** Powers the AI interviewer with context-aware follow-ups, hints, and adaptive questioning.

### 📊 Comprehensive Scoring & Analytics
- **20-Point Scoring System:** Evaluates candidates on tone, clarity, confidence, technical accuracy, and content quality.
- **Detailed Results Dashboard:**
  - Final score with percentage breakdown
  - Strengths and weaknesses analysis
  - Reason for deductions
  - Question-wise justification
  - Overall performance conclusion
- **PDF Report Export:** Download professional interview reports with @react-pdf/renderer.

### 🔒 Authentication & Rate Limiting
- **Clerk Auth:** Secure sign-in/sign-up with email verification and user profile management.
- **Arcjet Token Bucket:** Rate limiting with 3 free interview credits per 24 hours (refill rate: 2 credits/day).
- **Protected Routes:** Middleware-enforced authentication for dashboard and interview pages.

### � Recruiter Dashboard
- **Interview History:** Grid view of all past interviews with scores, strengths, and weaknesses.
- **One-Click Results:** Navigate directly to detailed result pages from dashboard cards.
- **Empty State Onboarding:** Friendly UI prompts for first-time users to create their first interview.

### 🌗 Modern, Responsive UI
- **shadcn/ui Components:** Pre-built, accessible UI components (dialogs, tabs, buttons, file uploads).
- **Tailwind CSS:** Utility-first styling with dark mode gradient cards and smooth animations.
- **CSR + SSR Hybrid:** Next.js App Router for optimized page loads and dynamic client interactions.

---

## 🏗️ Tech Stack
| Category | Tools & Frameworks |
|---|---|
| **Frontend** | Next.js 15 (App Router, CSR + SSR), React 19, shadcn/ui, Tailwind CSS 4 |
| **Backend** | Convex (realtime database), n8n (workflow automation), Node.js |
| **AI & Voice** | Vapi (Deepgram Nova-2, PlayHT), OpenAI GPT-4o |
| **Auth & Security** | Clerk (authentication), Arcjet (rate limiting, token bucket) |
| **File Storage** | ImageKit (resume upload & CDN) |
| **PDF Generation** | @react-pdf/renderer |
| **Deployment** | Vercel |

---

## Project structure (top-level view)
```
.
├── app/
│   ├── (auth)/                # auth pages (sign-in, sign-up)
│   ├── (routes)/dashboard/    # app routes for dashboard & subcomponents
│   ├── interview/             # interview pages (start, result, layout)
│   ├── ConvexClientProvider.tsx
│   ├── globals.css
│   └── layout.tsx, page.tsx, Provider.tsx
├── api/                       # Next.js API route handlers (serverless)
│   ├── generate-ai-questions/
│   └── ...                    # arcjet, sendmail endpoints
├── components/                # shared components (demos, UI primitives)
│   └── ui/                    # small UI components (button, input, dialog...)
├── convex/                    # Convex functions and schema
│   ├── schema.ts
│   ├── users.ts
│   ├── interview.ts
│   └── _generated/            # generated Convex client/server types
├── context/                   # React contexts
├── lib/                       # utility helpers
├── public/                    # static assets
├── utils/                     # route helpers (server runtime)
├── .env.local                 # local environment variables (not committed)
├── next.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.mjs
├── README.md
└── components.json / middleware.ts / N8N_WEBHOOK_GUIDE.md
```

## Key files & what they do
- `app/`: Next.js App Router pages and layouts. Main UI and routing.
  - `app/(auth)/sign-in` & `sign-up`: authentication entry points.
  - `app/(routes)/dashboard/`: dashboard pages & components.
  - `app/interview/[interviewId]/start/page.tsx`: interview start flow.
  - `app/interview/[interviewId]/result/`: results and PDF generation.
- `api/`: server-only route handlers for AI question generation, mailing, etc.
- `convex/`: Convex database schema and server functions.
  - `convex/_generated/`: generated Convex client and server code (keep if required by deployment).
- `components/ui/`: reusable UI components (buttons, dialogs, inputs).
- `context/UserDetailContext.tsx`: stores user details across the app.
- `lib/utils.ts`: helper utilities used across server/client.
- `utils/route.ts`: custom server-side route helpers.

## Exact environment variables (scanned from source)
I scanned the repository source files and found the following environment-variable names used directly in the app code. Add these to `.env.local` (or your host's environment) as appropriate.

- NEXT_PUBLIC_VAPI_PUBLIC_KEY=
- CONVEX_DEPLOY_KEY=
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
- CLERK_SECRET_KEY=
- NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
- NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
- NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=//dashboard
- NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
- CONVEX_DEPLOYMENT=
- NEXT_PUBLIC_CONVEX_URL=
- IMAGEKIT_URL_ENDPOINT=
- IMAGEKIT_URL_PUBLIC_KEY=
- IMAGEKIT_URL_PRIVATE_KEY=
- ARCJET_KEY=

Notes:
- The list above is derived from the app source (non-built files). Some packages (Clerk, etc.) expose additional env vars used internally; see the package docs if you rely on Clerk (common vars include `NEXT_PUBLIC_CLERK_*` and `CLERK_*` secrets).
- If you want, I can run a more exhaustive scan for `process.env.` across the repo and add any other matches (including built files) to this list.

## Scripts (from `package.json`)
- `dev` — start Next.js dev server (npm run dev)
- `build` — build Next.js app (npm run build)
- `start` — start production server (npm start)
- `convex:dev` — start Convex local dev (npm run convex:dev)

## Quick start (local development)
1. Install dependencies
```bash
# using npm
npm install

# or pnpm
pnpm install
```

2. Create `.env.local` and add the environment variables listed above.

3. (Optional) Start Convex locally if you run it locally
```bash
npm run convex:dev
# or: convex dev
```

4. Start Next.js dev server
```bash
npm run dev
```

5. Open http://localhost:3000

## Deployment notes
- Ensure Convex is configured for production or use a managed Convex instance; set production CONVEX keys in your host platform.
- Provide Clerk environment variables to the hosting platform (Vercel, etc.).
- Confirm any generated Convex files (`convex/_generated`) are present if required by your deployment.

## Tests
This repository doesn't include a test runner in `package.json`. Consider adding a lightweight test setup (Vitest / Jest) for components and server functions.

## Tips & common tasks
- After changing Convex schema/functions, regenerate client types (see Convex docs).
- Keep `.env.local` out of version control.
- Use `next build` + `next start` for production runs, or deploy to Vercel for automatic builds.

## Contributing
- Open issues or PRs.
- Follow the code style used in the repo (TypeScript, Next.js App Router).
- For major changes, open a draft PR and request review.

## License
Add your license here (MIT, Apache-2.0, etc.).

---

