# AuditIQ — AI Diagnostic SaaS

## What this is
A freemium web app where small business owners take a self-guided AI readiness diagnostic. They answer 8 closed-ended questions and receive an instant AI readiness score, radar chart, industry benchmarks, top 3 AI opportunities, and a #1 quick win — all before any email capture.

## Business model
- Free tier: 8-question diagnostic + instant results with score, radar chart, recommendations
- Paid tier (Phase 3): "30-Day AI Quickstart Plan" — personalized roadmap, tool recommendations, ROI estimates, implementation checklist. Testing $49/$99/$199 one-time.
- Email capture is optional, shown AFTER results, never gated

## Tech stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Phase 2 — database and auth)
- Anthropic API / Claude (Phase 3 — AI-powered report generation)
- Deployed on Vercel

## How to run
npm install
npm run dev
Open http://localhost:3000

## Project structure
- app/page.tsx — Landing page
- app/audit/page.tsx — Questionnaire flow + results page
- app/layout.tsx — Root layout with metadata
- app/globals.css — Global styles, dark theme

## Current status
Phase 1 complete: Landing page, 8-step questionnaire, results dashboard with scoring, radar chart, industry benchmarks, top 3 opportunities, quick win, email capture, smart gate screen for skips/not-sure.

## Key design decisions
- One question per screen (research-backed for completion rates)
- No email gate before results (research shows this kills conversion)
- "Not sure" counts as skip for minimum-answer threshold (need 4+ real answers)
- Gate screen shows clickable checklist of unanswered questions
- All questions closed-ended (no open text except optional "Other" field)
- Dark theme, mobile-first, professional feel

## Conventions
- Keep code simple and well-commented
- Components in /components when we extract them
- API routes in /app/api when needed
- When making UI changes, maintain the dark theme and purple accent color scheme
