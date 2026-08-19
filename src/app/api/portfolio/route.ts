import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('portfolio_images')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Admin changes (hide/delete/add a photo) must be visible immediately -
  // without this header the browser was caching this GET and never
  // re-requesting it even across full page loads.
  return NextResponse.json({ images: data }, { headers: { 'Cache-Control': 'no-store' } });
}
