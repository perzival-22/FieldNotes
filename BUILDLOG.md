# FieldNotes — Build Log

## What was built

### Phase 0 — Scaffold
- Vite + React 18 + React Router v7 + Tailwind CSS 4 project initialized
- Folder structure: `src/lib/`, `src/hooks/`, `src/pages/`, `src/components/`
- `.env.example` added; `.env` gitignored
- `public/manifest.json`, `public/favicon.svg`, `public/icons.svg` created
- `index.html` with full PWA meta tags (viewport-fit, apple-mobile-web-app-capable, theme-color, manifest link)

### Phase 1 — Data layer
- `src/lib/supabase.js` — creates Supabase client when env vars present; safe no-op mock when absent
- `src/lib/localStorage.js` — synchronous CRUD for jobs, materials, quotes, settings; `getCurrencySymbol` helper
- `src/lib/dataService.js` — async unified layer: localStorage-first (optimistic), Supabase sync; `user_id` stamped on every insert; `deleteQuote` exported
- `src/hooks/useAuth.js` — session state, loading flag, signOut

### Phase 2 — Core screens
- `src/pages/Onboarding.jsx` — first-launch screen with feature callouts, Get Started CTA
- `src/pages/Auth.jsx` — magic link sign-in; offline fallback button; Supabase-not-connected notice
- `src/pages/JobList.jsx` — status filter tabs, job cards, FAB, new-job modal with job type selector
- `src/pages/JobDetail.jsx` — inline editing with 800ms debounce; status pipeline; materials CRUD; quotes section; danger zone (archive/delete)
- `src/pages/QuotesListPage.jsx` — flat list of all quotes across jobs
- `src/components/BottomNav.jsx` — 3-tab nav, hidden on /onboarding and /auth
- `src/components/Icons.jsx` — inline SVG icons (Briefcase, Document, Gear, Plus, Close, ArrowLeft, ArrowRight, Check, Trash, Pencil, ChevronDown, FileText)
- `src/App.jsx` — routing + auth gate (onboarding → auth → app)

### Phase 3 — Quotes & PDF
- `src/pages/QuoteBuilder.jsx` — labour line items, materials from job, configurable tax toggle, totals auto-calc, status picker
- `src/lib/pdfGenerator.js` — jsPDF A4 quote: company header, client block, line items, tax, total; US date format (MM/DD/YYYY); dynamic currency symbol
- PDF share via `navigator.share` (mobile) with `doc.save()` desktop fallback

### Phase 4 — Settings & PWA
- `src/pages/Settings.jsx` — trader profile, hourly rate, currency (USD default), tax label + rate (replaces hardcoded VAT)
- `public/manifest.json` — name, icons, theme_color #f59e0b, display standalone
- `index.html` — Apple PWA meta tags, manifest link, service worker registration
- `public/sw.js` — stale-while-revalidate service worker; skips Supabase API calls

### Phase 5 — Security
- RLS migrations in `supabase/migrations/001_initial.sql` and `002_auth_rls.sql`
- `user_id` explicitly stamped on all Supabase inserts (jobs, quotes)
- `SECURITY_CHECK.md` — policy documentation and manual verification procedure

### US market changes (overrides UK defaults)
- Default currency: **USD ($)** (was GBP)
- Configurable tax: `taxLabel` (default "Sales Tax") + `taxRate` (default 0%) in Settings; per-quote toggle in QuoteBuilder (replaces hardcoded 0/5/20% VAT buttons)
- Date format: `en-US` (MM/DD/YYYY) in PDF and quote list (was en-GB)
- All currency symbols are dynamic (`getCurrencySymbol(settings.currency)`)
- No HMRC / Making Tax Digital references

---

## Dependencies
- `react` ^19, `react-dom` ^19
- `react-router-dom` ^7
- `@supabase/supabase-js` ^2
- `jspdf` ^4
- `tailwindcss` ^4, `@tailwindcss/vite` ^4

---

## Ship checklist (next steps to go live — all free)

1. **Create Supabase project** (free tier at supabase.com)
   - Run `supabase/migrations/001_initial.sql` in SQL Editor
   - Run `supabase/migrations/002_auth_rls.sql` in SQL Editor
   - Copy Project URL + Anon Key

2. **Deploy to Vercel** (free)
   - Push repo to GitHub
   - Import to Vercel → it auto-detects Vite
   - Set env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project settings
   - You get a free `fieldnotes-xxx.vercel.app` URL

3. **Set Supabase Auth URLs**
   - In Supabase → Authentication → URL Configuration
   - Site URL: `https://fieldnotes-xxx.vercel.app`
   - Redirect URLs: `https://fieldnotes-xxx.vercel.app/**`

4. **Generate app icons**
   - Create `public/icon-192.png` (192×192) and `public/icon-512.png` (512×512)
   - Referenced in `manifest.json` and Apple touch icon

5. **First users**
   - Post in r/electricians, r/Plumbing, r/HVAC, r/handyman
   - Ask 3 people to actually use it on the job and report what's missing
