import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'vnd_admin_session';

// Runs on the edge before /admin/dashboard or any protected /api/admin/*
// request - redirects (page) or 401s (api) unauthenticated visitors before
// they ever reach the route handler. /api/admin/login is deliberately
// excluded from the matcher: guarding the login endpoint with "you must
// already be logged in" would make it impossible to ever log in.
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  let valid = false;

  if (token && secret) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      valid = payload.role === 'admin';
    } catch {
      valid = false;
    }
  }

  if (valid) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/admin', req.url));
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/api/admin/((?!login).*)'],
};
