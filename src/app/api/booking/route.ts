import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeToE164 } from '@/lib/phone';

type BookingBody = {
  client_name?: string;
  phone?: string;
  instagram_handle?: string;
  requested_date?: string;
  requested_time?: string;
  description?: string;
  inspiration_image_url?: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as BookingBody;
  const client_name = body.client_name?.trim();
  const rawPhone = body.phone?.trim();
  const requested_date = body.requested_date;
  const requested_time = body.requested_time;

  if (!client_name || !rawPhone || !requested_date || !requested_time) {
    return NextResponse.json({ error: 'Name, phone, date, and time are required' }, { status: 400 });
  }
  // Normalized to E.164 here (not just loosely validated) so every stored
  // number is guaranteed sendable later - a malformed number is rejected at
  // booking time rather than silently failing to text when accepted.
  const phone = normalizeToE164(rawPhone);
  if (!phone) {
    return NextResponse.json({ error: 'That phone number doesn’t look right - try a 10-digit US number' }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Confirm the slot is actually one of the admin's open, unbooked slots -
  // never trust a date/time typed or tampered with on the client.
  const { data: slot, error: slotError } = await db
    .from('availability_slots')
    .select('id, available, booked_appointment_id')
    .eq('date', requested_date)
    .eq('time', requested_time)
    .maybeSingle();
  if (slotError) return NextResponse.json({ error: slotError.message }, { status: 500 });
  if (!slot || !slot.available || slot.booked_appointment_id) {
    return NextResponse.json({ error: 'That time is no longer available - please pick another' }, { status: 409 });
  }

  // Prevent an accidental double-submit (e.g. double-clicking Submit) from
  // creating duplicate pending requests for the same client/slot.
  const { data: existing } = await db
    .from('appointments')
    .select('id')
    .eq('phone', phone)
    .eq('requested_date', requested_date)
    .eq('requested_time', requested_time)
    .in('status', ['pending', 'confirmed'])
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'You already have a request in for that time' }, { status: 409 });
  }

  const { data: appointment, error } = await db
    .from('appointments')
    .insert({
      client_name,
      phone,
      instagram_handle: body.instagram_handle?.trim() || null,
      requested_date,
      requested_time,
      description: body.description?.trim() || '',
      inspiration_image_url: body.inspiration_image_url || null,
      status: 'pending',
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ appointment });
}
