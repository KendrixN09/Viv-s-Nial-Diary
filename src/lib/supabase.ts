import { createClient } from '@supabase/supabase-js';

// Service-role client: server-side only (API routes), full read/write access,
// bypasses row-level security. Never import this into a client component -
// the service key must never reach the browser.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, {
    auth: { persistSession: false },
    // Next.js on Vercel caches server-side fetch() calls by default, including
    // the ones this client makes internally - without this, reads can serve a
    // stale snapshot from before the most recent write even on a
    // force-dynamic route, since that setting doesn't reach into fetches made
    // by third-party clients like this one.
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';

export type Appointment = {
  id: string;
  client_name: string;
  phone: string;
  instagram_handle: string | null;
  requested_date: string;
  requested_time: string;
  description: string;
  inspiration_image_url: string | null;
  status: AppointmentStatus;
  google_calendar_event_id: string | null;
  sms_status: SmsStatus;
  sms_message_id: string | null;
  sms_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SmsStatus = 'not_sent' | 'sent' | 'failed';

export type AvailabilitySlot = {
  id: string;
  date: string;
  time: string;
  available: boolean;
  booked_appointment_id: string | null;
  created_at: string;
};

export type BlockedDay = {
  id: string;
  date: string;
  reason: string | null;
  created_at: string;
};

export type PortfolioImage = {
  id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type Policy = {
  id: string;
  title: string;
  content: string;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type PricingItem = {
  id: string;
  service: string;
  price: string;
  description: string;
  sort_order: number;
  active: boolean;
  created_at: string;
};
