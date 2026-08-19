import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

// Used by the Portfolio Manager to upload new nail photos to the
// portfolio-images bucket. Gated by admin middleware.
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WEBP images are allowed' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `portfolio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const db = supabaseAdmin();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await db.storage.from('portfolio-images').upload(path, bytes, { contentType: file.type });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = db.storage.from('portfolio-images').getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}
