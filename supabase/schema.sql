-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
--
-- ALREADY RAN THIS BEFORE 2026-08-19? The appointments table already exists,
-- so the `create table if not exists` below won't add the 3 new sms_* columns
-- to it. Run this migration block once instead (safe to run even if some/all
-- columns already exist):
--
--   alter table appointments add column if not exists sms_status text not null default 'not_sent';
--   alter table appointments add column if not exists sms_message_id text;
--   alter table appointments add column if not exists sms_sent_at timestamptz;

create extension if not exists "pgcrypto";

-- ---------- appointments ----------
-- Requests start as 'pending' and only become 'confirmed' once the admin
-- accepts them - see availability_slots.booked_appointment_id for the
-- double-booking guard that goes with this.
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  phone text not null,
  instagram_handle text,
  requested_date date not null,
  requested_time text not null, -- stored as the slot label, e.g. "2:00 PM", to match availability_slots.time
  description text not null default '',
  inspiration_image_url text,
  status text not null default 'pending', -- pending | confirmed | declined | completed | cancelled
  google_calendar_event_id text,
  -- Tracks the ONE outbound notification tied to this appointment's terminal
  -- status (confirmation SMS if status=confirmed, decline SMS if
  -- status=declined) - lets the admin see whether the client was actually
  -- notified, and lets a "Retry Text" action know whether it's safe to send
  -- again without double-texting the client.
  sms_status text not null default 'not_sent', -- not_sent | sent | failed
  sms_message_id text,
  sms_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_status on appointments(status, requested_date);
create index if not exists idx_appointments_slot on appointments(requested_date, requested_time);

-- ---------- availability ----------
-- One row per bookable slot the admin has explicitly opened. A slot with
-- booked_appointment_id set is locked to that appointment and can never be
-- double-booked, even if two clients submitted pending requests for it -
-- whichever gets accepted first claims the slot (see api/admin/appointments).
create table if not exists availability_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null, -- display label, e.g. "2:00 PM"
  available boolean not null default true,
  booked_appointment_id uuid references appointments(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (date, time)
);

create index if not exists idx_availability_date on availability_slots(date, available);

-- Whole days the admin has blocked off (vacation, day off, etc.) - checked
-- in addition to individual slots so one row covers an entire day at once.
create table if not exists blocked_days (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text,
  created_at timestamptz not null default now()
);

-- ---------- portfolio ----------
create table if not exists portfolio_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_portfolio_active on portfolio_images(active, sort_order);

-- ---------- notices / policies ----------
-- One real row per notice, same shape as portfolio_images, so each policy
-- has its own id/order/active flag and can be edited, hidden, deleted, or
-- added independently - never as one bulk text blob.
create table if not exists policies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_policies_active on policies(active, sort_order);

-- ---------- pricing ----------
create table if not exists pricing_items (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  price text not null,
  description text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_pricing_active on pricing_items(active, sort_order);

-- ---------- editable site content ----------
-- Free-form key/value store for simple one-off fields (Instagram link,
-- "Kennesaw Based" text, booking instructions) that are single values, not
-- lists of individually-manageable items like policies/pricing/portfolio.
create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seed content extracted from the reference images provided 2026-08-18.
-- Each policy/pricing line is its own row (own id) so Admin -> Policies /
-- Admin -> Pricing can edit, hide, delete, or add to them individually.
-- Pricing note: the "Price List" image framed full sets as a rotating
-- monthly deal (July $40 / August $50) while the "Notice" policy image
-- states a flat "$50 all full sets" with no monthly framing - these two
-- didn't agree, so this is seeded with the Notice's flat $50 plus the toe
-- pricing from the Price List, editable in Admin -> Pricing so Viv can
-- correct it to however her real current pricing works.
insert into policies (title, content, sort_order) values
  ('Payment Methods', 'Cash, CashApp, Apple Pay, Zelle, & Venmo', 1),
  ('House Calls', 'House calls are only for Kennesaw locations!', 2),
  ('Nail Prep', 'Empty nails are preferred for your appointment', 3),
  ('Fixes & Refunds', 'Fixes are free (I''m a beginner!) - no free full sets or refunds', 4),
  ('Booking Etiquette', 'Please don''t book if you''re going to rush me! All love, please book when you''re free', 5),
  ('Services Offered', 'I only provide Gel X, gel builder on natural nails, and Gel X fills', 6),
  ('Toes', 'Of course I do toes! Menu is on my highlights - acrylic on 2 big toes only', 7),
  ('Intricate Designs', 'I only charge extra for intricate designs (ones that take me 4+ hours)', 8),
  ('Deposits', 'No deposit needed to book with me! Things happen - you can always rebook through DM', 9)
on conflict do nothing;

insert into pricing_items (service, price, sort_order) values
  ('Full set (any length/design)', '$50', 1),
  ('Toes - gel polish change', '$25', 2),
  ('Toes - gel polish change, french', '$30', 3),
  ('Toes - gel polish change, french + design', '$38', 4),
  ('Acrylic on 2 big toes + any design', '$40', 5)
on conflict do nothing;

insert into site_content (key, value) values ('instagram_handle', '"@vivisnail.diary"'::jsonb) on conflict (key) do nothing;
insert into site_content (key, value) values ('instagram_url', '"https://www.instagram.com/vivisnail.diary/"'::jsonb) on conflict (key) do nothing;
insert into site_content (key, value) values ('kennesaw_text', '"Kennesaw Based"'::jsonb) on conflict (key) do nothing;
insert into site_content (key, value) values ('booking_instructions', '"Pick an open day + time, tell me about the set you want, and I''ll review + confirm through your phone number!"'::jsonb) on conflict (key) do nothing;

-- Seed a handful of portfolio placeholders (8 slots) so the public gallery
-- has content immediately. Replace these via Admin -> Portfolio once real
-- photos are uploaded to the portfolio-images storage bucket.
insert into portfolio_images (image_url, alt_text, sort_order) values
  ('/images/placeholder-1.svg', 'Bee and honey French tip set', 1),
  ('/images/placeholder-2.svg', 'Leopard cuff and hot pink chrome set', 2),
  ('/images/placeholder-3.svg', 'Rainbow stripe and star Y2K set', 3),
  ('/images/placeholder-4.svg', 'Cherry blossom French tips', 4),
  ('/images/placeholder-5.svg', 'Black white and silver stiletto set', 5),
  ('/images/placeholder-6.svg', 'Black and gold set with charm accents', 6),
  ('/images/placeholder-7.svg', 'Old Tumblr dashboard aesthetic snapshot', 7),
  ('/images/placeholder-8.svg', 'Old Instagram profile aesthetic snapshot', 8)
on conflict do nothing;
