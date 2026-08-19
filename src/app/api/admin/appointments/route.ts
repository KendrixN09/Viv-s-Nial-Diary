import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createCalendarEvent } from '@/lib/googleCalendar';
import type { AppointmentStatus } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') as AppointmentStatus | null;
  const db = supabaseAdmin();
  let query = db.from('appointments').select('*').order('requested_date', { ascending: true }).order('requested_time', { ascending: true });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointments: data });
}

type DecisionBody = { id: string; action: 'accept' | 'decline' };

// The only place appointment status legally changes from pending. Both
// branches open with a single CONDITIONAL UPDATE (... WHERE status='pending')
// rather than a separate read-then-check - that's what makes it safe against
// two near-simultaneous requests (a double click, a network retry) both
// trying to decide the same appointment: only one can ever find a matching
// 'pending' row to flip.
//
// No automatic SMS here by design - Viv texts/DMs clients herself using the
// phone/Instagram shown in the admin UI (see sms_status, repurposed as a
// manual "I've contacted them" flag, toggled via /appointments/mark-contacted
// rather than anything Twilio-related).
export async function PATCH(req: NextRequest) {
  const { id, action } = (await req.json()) as DecisionBody;
  if (!id || (action !== 'accept' && action !== 'decline')) {
    return NextResponse.json({ error: 'Missing or invalid id/action' }, { status: 400 });
  }

  const db = supabaseAdmin();

  if (action === 'decline') {
    const { data: declined, error } = await db
      .from('appointments')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!declined) return NextResponse.json({ error: 'Already decided - refresh the page' }, { status: 409 });

    return NextResponse.json({ appointment: declined });
  }

  // action === 'accept' - flip status first (cheap, safe to fully revert),
  // then try to claim the slot; if the slot's already gone (a different
  // appointment for the same date/time got accepted first), revert back to
  // pending rather than leaving a "confirmed" appointment with no slot -
  // this is the one edge case not covered by a single atomic statement,
  // since appointments and availability_slots are separate tables.
  const { data: confirmed, error: confirmError } = await db
    .from('appointments')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .maybeSingle();
  if (confirmError) return NextResponse.json({ error: confirmError.message }, { status: 500 });
  if (!confirmed) return NextResponse.json({ error: 'Already decided - refresh the page' }, { status: 409 });

  const { data: claimedSlot, error: claimError } = await db
    .from('availability_slots')
    .update({ booked_appointment_id: id })
    .eq('date', confirmed.requested_date)
    .eq('time', confirmed.requested_time)
    .is('booked_appointment_id', null)
    .select('id')
    .maybeSingle();
  if (claimError) return NextResponse.json({ error: claimError.message }, { status: 500 });
  if (!claimedSlot) {
    await db.from('appointments').update({ status: 'pending', updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json(
      { error: 'That slot was just confirmed for someone else - decline this request or offer a different time' },
      { status: 409 }
    );
  }

  // Auto-decline any other pending requests for the same now-taken slot -
  // Viv still needs to know to tell them herself, which is exactly why their
  // phone/Instagram stay visible on a declined card too.
  const { data: competing } = await db
    .from('appointments')
    .select('id')
    .eq('requested_date', confirmed.requested_date)
    .eq('requested_time', confirmed.requested_time)
    .eq('status', 'pending')
    .neq('id', id);
  if (competing?.length) {
    await db
      .from('appointments')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .in('id', competing.map((c) => c.id))
      .eq('status', 'pending');
  }

  const calendarResult = await createCalendarEvent(confirmed).catch((err) => {
    console.error('google calendar sync failed', err);
    return { eventId: null, mock: false };
  });
  if (calendarResult.eventId) {
    await db.from('appointments').update({ google_calendar_event_id: calendarResult.eventId }).eq('id', id);
  }

  return NextResponse.json({
    appointment: { ...confirmed, google_calendar_event_id: calendarResult.eventId ?? confirmed.google_calendar_event_id },
    calendar: calendarResult,
  });
}
