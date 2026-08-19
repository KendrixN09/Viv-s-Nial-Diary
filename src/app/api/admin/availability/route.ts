import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Returns slots + blocked days from today through +60 days, enough for the
// admin availability calendar to render several months of context without
// pulling the entire table.
export async function GET() {
  const db = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 60);
  const horizonStr = horizon.toISOString().slice(0, 10);

  const [{ data: slots, error: slotsError }, { data: blocked, error: blockedError }] = await Promise.all([
    db.from('availability_slots').select('*').gte('date', today).lte('date', horizonStr).order('date').order('time'),
    db.from('blocked_days').select('*').gte('date', today).lte('date', horizonStr).order('date'),
  ]);
  if (slotsError) return NextResponse.json({ error: slotsError.message }, { status: 500 });
  if (blockedError) return NextResponse.json({ error: blockedError.message }, { status: 500 });

  return NextResponse.json({ slots, blockedDays: blocked });
}

type NewSlot = { date: string; time: string };

export async function POST(req: NextRequest) {
  const body = (await req.json()) as NewSlot;
  if (!body.date || !body.time) {
    return NextResponse.json({ error: 'date and time are required' }, { status: 400 });
  }
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('availability_slots')
    .insert({ date: body.date, time: body.time })
    .select()
    .single();
  if (error) {
    // unique(date, time) violation - that slot already exists, not a real error
    if (error.code === '23505') return NextResponse.json({ error: 'That slot already exists' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ slot: data });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: slot } = await db.from('availability_slots').select('booked_appointment_id').eq('id', id).maybeSingle();
  if (slot?.booked_appointment_id) {
    return NextResponse.json({ error: 'Can’t remove a slot with a confirmed appointment' }, { status: 409 });
  }
  const { error } = await db.from('availability_slots').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
