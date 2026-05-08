# Habit Tracking App

Personal habit tracker — authenticated users create habits, check them off daily, and track streaks.

@AGENTS.md

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Supabase (Auth + Postgres)
- Tailwind CSS v4
- Vercel (deployment)

## MVP Features

- Email/password auth (signup + login)
- Create and delete habits
- Daily check-in toggle per habit (one per day, no duplicates)
- Dashboard: habit list, today's check-in status (tick/circle), streak counter per habit
- Streak = consecutive days checked off ending today or yesterday

## File Structure

```
habit-tracking-app/
├── app/
│   ├── layout.tsx                 — root layout, font, metadata
│   ├── page.tsx                   — landing redirect (→ /dashboard or /login)
│   ├── globals.css                — Tailwind imports
│   ├── actions.ts                 — all server actions (createHabit, deleteHabit, toggleCheckIn)
│   ├── login/
│   │   └── page.tsx               — login form (client component)
│   ├── signup/
│   │   └── page.tsx               — signup form (client component)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts           — Supabase auth callback (exchange code for session)
│   └── dashboard/
│       └── page.tsx               — main dashboard (client component)
├── components/
│   ├── habit-card.tsx             — single habit: name, toggle, streak, delete button
│   └── add-habit-form.tsx         — input + submit to create habit
├── lib/
│   ├── supabase-client.ts         — createBrowserClient (for client components)
│   └── supabase-server.ts         — createServerClient (for server actions, cookies)
├── middleware.ts                   — refresh Supabase session on every request
├── .env.local                     — NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Supabase Schema

### Tables

```sql
-- habits table
create table public.habits (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  created_at timestamptz default now() not null
);

-- check_ins table
create table public.check_ins (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  habit_id   uuid references public.habits(id) on delete cascade not null,
  date       date not null,
  created_at timestamptz default now() not null,
  unique(habit_id, date)
);
```

### Indexes

```sql
create index idx_habits_user_id on public.habits(user_id);
create index idx_check_ins_user_id on public.check_ins(user_id);
create index idx_check_ins_habit_date on public.check_ins(habit_id, date);
```

### RLS Policies

```sql
-- Enable RLS
alter table public.habits enable row level security;
alter table public.check_ins enable row level security;

-- habits: users can only SELECT their own rows
create policy "Users can view own habits"
  on public.habits for select
  using (auth.uid() = user_id);

-- habits: users can only INSERT their own rows
create policy "Users can create own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

-- habits: users can only DELETE their own rows
create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- check_ins: users can only SELECT their own rows
create policy "Users can view own check_ins"
  on public.check_ins for select
  using (auth.uid() = user_id);

-- check_ins: users can only INSERT their own rows
create policy "Users can create own check_ins"
  on public.check_ins for insert
  with check (auth.uid() = user_id);

-- check_ins: users can only DELETE their own rows (for toggling off)
create policy "Users can delete own check_ins"
  on public.check_ins for delete
  using (auth.uid() = user_id);
```

### Notes

- No UPDATE policies — habits are immutable (create/delete only), check-ins are toggled via insert/delete
- No realtime, storage, or edge functions
- `on delete cascade` on all FKs — deleting a user removes their habits; deleting a habit removes its check-ins

## Dependencies

- `@supabase/supabase-js` — Supabase client SDK
- `@supabase/ssr` — server-side auth with cookies for Next.js App Router

## Dev Rules

- Keep code simple and flat — no abstractions, no wrappers
- Prefer client components unless server rendering is required
- Server Actions only — no API routes (except auth callback)
- No extra features beyond MVP
- No overengineering, no premature optimization
- Tailwind for all styling — no CSS modules, no styled-components

## Deployment

- Vercel
- Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
