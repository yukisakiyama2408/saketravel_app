create table if not exists feedback_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reporter_email text not null,
  type text not null check (type in ('feature', 'bug', 'improvement')),
  title text not null check (char_length(title) <= 120),
  description text not null,
  page_path text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'planned', 'in_progress', 'done', 'declined')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table feedback_items enable row level security;

drop policy if exists "users can create own feedback" on feedback_items;
create policy "users can create own feedback"
  on feedback_items for insert
  with check (auth.uid() = user_id);

create index if not exists feedback_items_created_at_idx on feedback_items (created_at desc);
create index if not exists feedback_items_status_idx on feedback_items (status);
