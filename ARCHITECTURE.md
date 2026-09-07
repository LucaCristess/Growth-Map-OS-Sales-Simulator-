# System Architecture — Growth Map Sales Scale Simulator

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER'S BROWSER                                 │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Landing    │→ │    Scan      │→ │   Results    │→ │    Report    │   │
│  │    Page      │  │   Wizard     │  │   (Free)     │  │   (Locked)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                           │                  │                │              │
│                           ▼                  ▼                ▼              │
│                  ┌─────────────────────────────────────────────────┐        │
│                  │              SIMULATOR ENGINE                   │        │
│                  │    (Client-side calculation + state)           │        │
│                  │                                                 │        │
│                  │  • Revenue Calculation                         │        │
│                  │  • Constraint Ranking                          │        │
│                  │  • Scenario Generation                         │        │
│                  │  • Target Backwards Engineering                │        │
│                  └─────────────────────────────────────────────────┘        │
│                                          │                                 │
│                                          ▼                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      SUPABASE CLIENT (Browser)                        │ │
│  │                                                                       │ │
│  │  • Save anonymous session      • Load answers                         │ │
│  │  • Persist each answer         • Lead submission                      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────┬──────────────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE (Cloud)                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                           POSTGRESQL                                   ││
│  │                                                                         ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ││
│  │  │  sessions   │  │   answers   │  │    leads    │  │   reports   │  ││
│  │  │─────────────│  │─────────────│  │─────────────│  │─────────────│  ││
│  │  │ id          │←─│ session_id  │  │ session_id  │←─│ session_id  │  ││
│  │  │ anonymous_id│  │ question_key│  │ name        │  │ result_json │  ││
│  │  │ created_at  │  │ value       │  │ email       │  │ created_at  │  ││
│  │  │ scan_type   │  │ updated_at  │  │ phone       │  └─────────────┘  ││
│  │  │ completed   │  └─────────────┘  │ qual_score  │                   ││
│  │  │ utm_params  │                    │ qual_tier   │                   ││
│  │  └─────────────┘                    └─────────────┘                   ││
│  │                                                                         ││
│  │  Row Level Security: Users can only read/write their own session       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         EDGE FUNCTIONS                                 ││
│  │                                                                         ││
│  │  • /api/sessions  — Create/load anonymous session                      ││
│  │  • /api/leads     — Validate + insert lead (rate limited)              ││
│  │  • /api/reports   — Generate report (with service role)                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           VERCEL (Hosting)                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         NEXT.JS APP                                     ││
│  │                                                                         ││
│  │  Server Components:                  Client Components:                 ││
│  │  • API routes                       • Wizard flow                      ││
│  │  • Server-side validation           • Simulator sliders                ││
│  │  • Rate limiting                    • Real-time calculations           ││
│  │  • Session management               • Charts                           ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      ENVIRONMENT VARIABLES                              ││
│  │                                                                         ││
│  │  • SUPABASE_URL              • SUPABASE_SERVICE_KEY (secret)           ││
│  │  • SUPABASE_ANON_KEY         • POSTHOG_KEY (optional)                  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           ANALYTICS (Optional)                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                          POSTHOG                                        ││
│  │                                                                         ││
│  │  Events Tracked:                                                        ││
│  │  • simulation_started        • question_answered                       ││
│  │  • scan_type_selected        • lead_submitted                          ││
│  │  • question_viewed           • full_report_viewed                      ││
│  │  • simulation_adjusted       • scenario_selected                       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow — User Journey

```
USER ACTION                    SYSTEM RESPONSE                     DATA STORED
─────────────────────────────────────────────────────────────────────────────────

1. Visit landing page          Render static page                 None

2. Click "Run Simulation"      Create anonymous session           sessions.id
                               Generate anonymous_session_id      sessions.completed = false

3. Select Quick/Deep Scan      Update session                     sessions.scan_type

4. Answer questions (Q1-N)     Persist each answer                answers[session_id, key, value]
                               Real-time validation               (immediate on each answer)

5. View free results           Calculate from answers             None (client-side)
                               Show: current state + 1 insight    PostHog: initial_diagnostic_viewed

6. Lead gate appears           Show form (name/email/phone)       None yet

7. Submit lead                 Validate inputs                    leads.session_id
                               Insert lead record                 leads.qualification_score
                               Calculate qualification            leads.qualification_tier
                               Unlock full report                 sessions.completed = true
                               PostHog: lead_submitted

8. View full report            Generate from answers + lead       reports.session_id
                               Show: full simulation              reports.result_json
                               Show: scenarios
                               Show: recommendations

9. Interact with simulator     Recalculate client-side            (no new storage)
                               Update projected revenue           PostHog: simulation_adjusted
                               Show gap analysis

10. Click scenario presets     Apply scenario values              PostHog: scenario_selected
                               Recalculate instantly

11. Click "Book Audit"         External Calendly link             PostHog: audit_cta_clicked
```

---

## Calculation Engine Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INPUT PROCESSING                                      │
│                                                                              │
│  User Input                System Calculation              Normalized Value  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Revenue: $50K             —                               $50,000          │
│  AOV: $4,000               —                               $4,000           │
│  Booked: 50 calls          —                               50               │
│  Shows: 35                 35/50 = 70%                     70%              │
│  Closes: 8                 8/35 = 22.9%                    22.9%            │
│  Target: $100K             —                               $100,000         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REVENUE CALCULATION                                   │
│                                                                              │
│  FORMULA:  qualified_leads × booking_rate × show_rate × close_rate × aov   │
│                                                                              │
│  CURRENT:  50 × 1.0 × 0.70 × 0.229 × $4,000 = $32,060                    │
│                                                                              │
│  (Note: "qualified_leads" = booked calls in this simplified model)          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONSTRAINT ANALYSIS                                   │
│                                                                              │
│  Metric        Current    Benchmark    Score    Rank                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Show Rate     70%        80%          -10pts   1 (PRIMARY)                 │
│  Close Rate    22.9%      30%          -7pts    2 (SECONDARY)               │
│  AOV           $4,000     $4,500       -5pts    3                           │
│  Volume        50         112          -5pts    4                           │
│  Booking       100%       68%          +32pts   5 (STRONG)                  │
│                                                                              │
│  PRIMARY CONSTRAINT: Show Rate                                               │
│  SECONDARY CONSTRAINT: Close Rate                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SCENARIO ENGINE                                       │
│                                                                              │
│  SCENARIO        BOOKING   SHOW    CLOSE    AOV      REVENUE    CHANGE     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Current         50        70%     22.9%    $4,000   $32,060    —          │
│  Conservative    50        75%     25%      $4,200   $39,375    +$7,315    │
│  Expected        55        78%     28%      $4,500   $54,012    +$21,952   │
│  Aggressive      60        82%     30%      $5,000   $73,800    +$41,740   │
│                                                                              │
│  BALANCED SCALE (Recommended):                                              │
│  60 leads × 78% show × 28% close × $4,500 = $58,968                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TARGET ENGINE                                         │
│                                                                              │
│  TARGET: $100,000/month                                                     │
│                                                                              │
│  PATH 1 (Volume Only):      100 / (0.70 × 0.229 × 4000) = 156 leads      │
│  PATH 2 (Conversion First):  50 / (0.85 × 0.35 × 4000) = 42 leads        │
│  PATH 3 (Balanced):          72 / (0.78 × 0.30 × 4500) = 68 leads        │
│                                                                              │
│  RECOMMENDED: Balanced Path                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                    │
│                                                                              │
│  LAYER 1: CLIENT                                                            │
│  ├─ Input validation (zod schemas)                                          │
│  ├─ No secrets in frontend code                                             │
│  └─ Rate limiting via Supabase RLS                                          │
│                                                                              │
│  LAYER 2: EDGE (Vercel Functions)                                           │
│  ├─ Server-side validation                                                  │
│  ├─ Rate limiting (per IP)                                                  │
│  └─ Session validation                                                      │
│                                                                              │
│  LAYER 3: DATABASE (Supabase)                                               │
│  ├─ Row Level Security (RLS)                                                │
│  ├─ Users read/write own session only                                       │
│  ├─ Leads: insert only (no update/delete from client)                       │
│  └─ Service role for admin operations only                                  │
│                                                                              │
│  LAYER 4: ENVIRONMENT                                                       │
│  ├─ Service role key: server-only (never exposed)                           │
│  ├─ Anon key: browser (safe, limited by RLS)                                │
│  └─ PostHog key: analytics (read-only)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Pipeline

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  LOCAL DEV  │ ──→  │   GITHUB    │ ──→  │   VERCEL    │ ──→  │  PRODUCTION │
│             │      │             │      │             │      │             │
│ npm run dev │ git  │   Push      │ auto │   Build     │ live │  growthmap  │
│ localhost   │ ──→  │   branch    │ ──→  │   Deploy    │ ──→  │  .com/sim  │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
                                              │
                                              ▼
                                        ┌─────────────┐
                                        │  SUPABASE   │
                                        │             │
                                        │  Schema     │
                                        │  migrations │
                                        │  run via    │
                                        │  dashboard  │
                                        └─────────────┘
```
