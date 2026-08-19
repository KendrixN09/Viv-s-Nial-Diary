import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { date, reason } = (await req.json()) as { date?: string; reason?: string };
  if (!date) return NextResponse.json({ error: 'date is required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('blocked_days')
    .insert({ date, reason: reason || null })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That day is already blocked' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ blockedDay: data });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const db = supabaseAdmin();
  const { error } = await db.from('blocked_days').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
