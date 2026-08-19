import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db.from('site_content').select('key, value');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content: data });
}

type UpdateBody = { key: string; value: unknown };

export async function PATCH(req: NextRequest) {
  const { key, value } = (await req.json()) as UpdateBody;
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  const db = supabaseAdmin();
  const { error } = await db
    .from('site_content')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
