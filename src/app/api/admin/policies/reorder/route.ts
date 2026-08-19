import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Body: { order: string[] } - policy ids in their new display order.
export async function POST(req: NextRequest) {
  const { order } = (await req.json()) as { order?: string[] };
  if (!order?.length) return NextResponse.json({ error: 'order is required' }, { status: 400 });

  const db = supabaseAdmin();
  const updates = order.map((id, i) => db.from('policies').update({ sort_order: i }).eq('id', id));
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
