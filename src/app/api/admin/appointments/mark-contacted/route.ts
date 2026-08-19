import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Manual "I texted/DM'd them myself" toggle - a note-to-self for Viv, no SMS
// provider involved. Repurposes the sms_status/sms_sent_at columns from the
// earlier automatic-SMS design rather than needing a fresh migration.
export async function POST(req: NextRequest) {
  const { id, contacted } = (await req.json()) as { id?: string; contacted?: boolean };
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: updated, error } = await db
    .from('appointments')
    .update({
      sms_status: contacted ? 'sent' : 'not_sent',
      sms_sent_at: contacted ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointment: updated });
}
