import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Returns open, unbooked slots for today onward, grouped by date, minus any
// whole days the admin has blocked off. This is the only source of truth
// clients see when picking a day/time - a slot that isn't in this list
// can't be booked, enforced again server-side in POST /api/booking.
export async function GET() {
  const db = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: slots, error: slotsError }, { data: blocked, error: blockedError }] = await Promise.all([
    db
      .from('availability_slots')
      .select('id, date, time')
      .eq('available', true)
      .is('booked_appointment_id', null)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true }),
    db.from('blocked_days').select('date').gte('date', today),
  ]);

  if (slotsError) return NextResponse.json({ error: slotsError.message }, { status: 500 });
  if (blockedError) return NextResponse.json({ error: blockedError.message }, { status: 500 });

  const blockedDates = new Set((blocked ?? []).map((b) => b.date));
  const byDate: Record<string, { id: string; time: string }[]> = {};
  for (const slot of slots ?? []) {
    if (blockedDates.has(slot.date)) continue;
    if (!byDate[slot.date]) byDate[slot.date] = [];
    byDate[slot.date].push({ id: slot.id, time: slot.time });
  }

  return NextResponse.json({ availability: byDate }, { headers: { 'Cache-Control': 'no-store' } });
}
