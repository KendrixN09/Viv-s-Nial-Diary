import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db.from('portfolio_images').select('*').order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ images: data });
}

export async function POST(req: NextRequest) {
  const { image_url, alt_text } = (await req.json()) as { image_url?: string; alt_text?: string };
  if (!image_url) return NextResponse.json({ error: 'image_url is required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: maxSort } = await db
    .from('portfolio_images')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSort = (maxSort?.sort_order ?? 0) + 1;

  const { data, error } = await db
    .from('portfolio_images')
    .insert({ image_url, alt_text: alt_text || '', sort_order: nextSort })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ image: data });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as { id: string; image_url?: string; alt_text?: string; active?: boolean };
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.image_url !== undefined) update.image_url = body.image_url;
  if (body.alt_text !== undefined) update.alt_text = body.alt_text;
  if (body.active !== undefined) update.active = body.active;

  const db = supabaseAdmin();
  const { error } = await db.from('portfolio_images').update(update).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const db = supabaseAdmin();
  const { error } = await db.from('portfolio_images').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
