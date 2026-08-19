import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = supabaseAdmin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const { data: monthAppointments, error } = await db
    .from('appointments')
    .select('id, status, requested_date, client_name, phone')
    .gte('requested_date', monthStart)
    .lt('requested_date', monthEnd);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { count: upcomingCount, error: upcomingError } = await db
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'confirmed')
    .gte('requested_date', today);
  if (upcomingError) return NextResponse.json({ error: upcomingError.message }, { status: 500 });

  const { count: todayCount, error: todayError } = await db
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'confirmed')
    .eq('requested_date', today);
  if (todayError) return NextResponse.json({ error: todayError.message }, { status: 500 });

  const rows = monthAppointments ?? [];
  const uniqueClientsThisMonth = new Set(rows.map((r) => r.phone)).size;

  return NextResponse.json({
    stats: {
      thisMonth: rows.length,
      confirmed: rows.filter((r) => r.status === 'confirmed').length,
      pending: rows.filter((r) => r.status === 'pending').length,
      declined: rows.filter((r) => r.status === 'declined').length,
      upcoming: upcomingCount ?? 0,
      today: todayCount ?? 0,
      uniqueClientsThisMonth,
    },
  });
}
