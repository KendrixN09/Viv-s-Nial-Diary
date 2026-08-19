import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db.from('pricing_items').select('*').order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pricing: data });
}

export async function POST(req: NextRequest) {
  const { service, price, description } = (await req.json()) as { service?: string; price?: string; description?: string };
  if (!service?.trim()) return NextResponse.json({ error: 'service is required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: maxSort } = await db
    .from('pricing_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSort = (maxSort?.sort_order ?? 0) + 1;

  const { data, error } = await db
    .from('pricing_items')
    .insert({ service: service.trim(), price: price?.trim() ?? '', description: description?.trim() ?? '', sort_order: nextSort })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as { id: string; service?: string; price?: string; description?: string; active?: boolean };
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.service !== undefined) update.service = body.service;
  if (body.price !== undefined) update.price = body.price;
  if (body.description !== undefined) update.description = body.description;
  if (body.active !== undefined) update.active = body.active;

  const db = supabaseAdmin();
  const { error } = await db.from('pricing_items').update(update).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const db = supabaseAdmin();
  const { error } = await db.from('pricing_items').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
