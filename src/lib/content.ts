import { supabaseAdmin } from './supabase';

// Simple one-off text fields only - policies, pricing, and portfolio each
// live in their own dedicated table now (see /api/policies, /api/pricing,
// /api/portfolio) so every item there can be individually edited, hidden,
// deleted, or added rather than living in one bulk value here.
export type SiteContent = {
  instagram_handle: string;
  instagram_url: string;
  kennesaw_text: string;
  booking_instructions: string;
};

const DEFAULTS: SiteContent = {
  instagram_handle: '@vivisnail.diary',
  instagram_url: 'https://www.instagram.com/vivisnail.diary/',
  kennesaw_text: 'Kennesaw Based',
  booking_instructions: 'Pick an open day + time and tell me about the set you want!',
};

export async function getSiteContent(): Promise<SiteContent> {
  const db = supabaseAdmin();
  const { data, error } = await db.from('site_content').select('key, value');
  if (error) throw error;

  const out = { ...DEFAULTS };
  for (const row of data ?? []) {
    (out as Record<string, unknown>)[row.key] = row.value;
  }
  return out;
}
