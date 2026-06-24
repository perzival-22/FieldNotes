# FieldNotes — Security Check

## Row Level Security (RLS) Policies

### What RLS does
Every Supabase table has RLS enabled. The anon key is safe to ship in the client *because* RLS is on — without it, anyone with the anon key could read every row. With RLS, each query is silently filtered to the authenticated user's own rows.

### Tables and policies

#### `jobs`
| Operation | Policy |
|-----------|--------|
| SELECT | `auth.uid() = user_id` |
| INSERT | `auth.uid() = user_id` (checked on write) |
| UPDATE | `auth.uid() = user_id` |
| DELETE | `auth.uid() = user_id` |

#### `materials`
Materials don't have a direct `user_id` column. Ownership is verified through the parent job:

| Operation | Policy |
|-----------|--------|
| SELECT | `EXISTS (SELECT 1 FROM jobs WHERE jobs.id = materials.job_id AND jobs.user_id = auth.uid())` |
| INSERT | same check |
| UPDATE | same check |
| DELETE | same check |

#### `quotes`
| Operation | Policy |
|-----------|--------|
| SELECT | `auth.uid() = user_id` |
| INSERT | `auth.uid() = user_id` |
| UPDATE | `auth.uid() = user_id` |
| DELETE | `auth.uid() = user_id` |

### `user_id` stamping
`dataService.js` calls `supabase.auth.getUser()` before every `insert` to jobs and quotes, and explicitly passes `user_id: userId` in the insert payload. RLS also enforces this server-side — the insert would be rejected even without the explicit stamp.

---

## How to verify isolation between users

### Step 1 — Set up two test accounts
1. In your Supabase dashboard go to **Authentication → Users → Invite user** (or use magic link from the app).
2. Create user A: `test-a@example.com`
3. Create user B: `test-b@example.com`

### Step 2 — Create data as user A
1. Sign in as `test-a@example.com` in the app.
2. Create a job — e.g. client name "Alice Job".
3. Note the job's UUID from the URL (`/job/<uuid>`).

### Step 3 — Try to read user A's data as user B
Run this in the Supabase SQL Editor while logged in as user B's session (use the `Service Role` key for the test — the anon key enforces RLS automatically):

```sql
-- In Supabase SQL editor, check user A's job directly:
SELECT * FROM jobs WHERE client_name = 'Alice Job';
```

With RLS enabled this returns 0 rows for any user who is not user A.

To test with the anon key (simulating the real client):

```js
// In browser console — sign in as user B first, then:
const { data } = await supabase.from('jobs').select('*')
// data should only contain user B's jobs, never user A's
```

### Step 4 — Confirm via curl (anon key, no auth)
```bash
curl 'https://YOUR_PROJECT.supabase.co/rest/v1/jobs?select=*' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```
Expected result: `[]` (empty — no session means `auth.uid()` is null, which matches no rows).

---

## Secrets policy
- `.env` is in `.gitignore` — never committed.
- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used client-side.
- The anon key is designed for public exposure when RLS is enforced.
- The service role key (bypasses RLS) must never appear in client code.
- No storage buckets are currently used. If added, they must have per-user policies matching the same pattern.
