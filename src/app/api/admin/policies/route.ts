import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db.from('policies').select('*').order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ policies: data });
}

export async function POST(req: NextRequest) {
  const { title, content } = (await req.json()) as { title?: string; content?: string };
  if (!title?.trim()) return NextResponse.json({ error: 'title is required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: maxSort } = await db
    .from('policies')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSort = (maxSort?.sort_order ?? 0) + 1;

  const { data, error } = await db
    .from('policies')
    .insert({ title: title.trim(), content: content?.trim() ?? '', sort_order: nextSort })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ policy: data });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as { id: string; title?: string; content?: string; active?: boolean };
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.content !== undefined) update.content = body.content;
  if (body.active !== undefined) update.active = body.active;

  const db = supabaseAdmin();
  const { error } = await db.from('policies').update(update).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const db = supabaseAdmin();
  const { error } = await db.from('policies').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
