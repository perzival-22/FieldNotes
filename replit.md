# FieldNotes

A mobile-first PWA for self-employed tradespeople (electricians, plumbers, builders) to log jobs, track materials, build quotes, and export professional PDFs. Works fully offline via localStorage.

## Tech Stack

- **React 18** + **Vite 8** (port 5000)
- **React Router v6** for client-side routing
- **Tailwind CSS v4** with dark theme via CSS variables
- **Supabase** (optional) — graceful fallback to localStorage if not configured
- **jsPDF** for client-side PDF generation
- **PWA** — manifest.json + Apple PWA meta tags

## Project Structure

```
src/
  lib/
    supabase.js        — Supabase client (no-op stub if not configured)
    localStorage.js    — Synchronous CRUD for fn_jobs, fn_materials, fn_quotes, fn_settings
    dataService.js     — Async unified layer (Supabase-first, localStorage fallback)
    pdfGenerator.js    — jsPDF quote PDF generation
  hooks/
    useAuth.js         — Supabase auth session hook
  pages/
    Onboarding.jsx     — First-launch screen (checks fn_onboarded)
    Auth.jsx           — Magic link login / offline skip
    JobList.jsx        — Main job list with status filter tabs + FAB new job modal
    JobDetail.jsx      — Full job editor with auto-save (800ms debounce)
    QuoteBuilder.jsx   — Labour items, materials, VAT, totals, PDF export
    QuotesListPage.jsx — Flat list of all quotes
    Settings.jsx       — Profile, defaults, account, danger zone
  components/
    BottomNav.jsx      — Fixed 3-tab nav (hidden on /onboarding and /auth)
    Icons.jsx          — Inline SVG icon components
  App.jsx              — Routing + auth gate logic
  main.jsx
  index.css            — CSS variables + Tailwind v4 import
public/
  manifest.json        — PWA manifest
supabase/
  migrations/
    001_initial.sql    — jobs, materials, quotes tables
    002_auth_rls.sql   — Row level security policies
```

## Colour Palette (CSS Variables)

```css
--color-primary: #111827   /* near-black background */
--color-surface: #1f2937   /* card / modal background */
--color-border:  #374151   /* subtle borders */
--color-text:    #f9fafb   /* primary text */
--color-text-muted: #9ca3af
--color-accent:  #f59e0b   /* amber — action colour */
--color-success: #10b981   /* green */
--color-danger:  #ef4444   /* red */
```

## Environment Variables (Optional)

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

Without these, the app runs entirely offline using localStorage.

## Data Models

**localStorage keys:** `fn_jobs`, `fn_materials`, `fn_quotes`, `fn_settings`, `fn_onboarded`

**Job statuses:** quote → active → done → invoiced → paid  
**Job types:** residential, commercial, emergency  
**Quote statuses:** draft, sent, accepted, declined  
**Quote VAT rates:** 0%, 5%, 20%

## Running

```bash
npm run dev   # starts on port 5000
```
