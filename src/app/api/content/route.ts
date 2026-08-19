import { NextResponse } from 'next/server';
import { getSiteContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('content fetch error', err);
    return NextResponse.json({ error: 'Could not load content' }, { status: 500 });
  }
}
