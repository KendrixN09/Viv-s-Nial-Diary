'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartSticker, SparkleSticker } from '@/components/ui/Stickers';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-diary-black p-4">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm rounded-2xl border-4 border-diary-black bg-[#fdf8ef] p-8 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)]"
      >
        <HeartSticker className="absolute -left-4 -top-4 w-12" />
        <SparkleSticker className="animate-sparkle absolute -right-3 -top-3 w-8" />
        <h1 className="font-display text-center text-xl text-diary-black">Viv&apos;s Nail Diary</h1>
        <p className="font-hand mt-1 text-center text-2xl text-diary-purple">Admin sign in ✧</p>

        <label className="mt-6 block text-sm text-diary-black/70">
          Admin password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="mt-1 w-full rounded-md border-2 border-diary-black/30 bg-white px-3 py-2 text-base focus:border-diary-pink"
          />
        </label>

        {error && <p className="font-hand mt-3 text-lg text-diary-pink">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="font-display mt-6 w-full rounded-full border-4 border-diary-black bg-diary-pink py-3 text-white shadow-sticker transition hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </main>
  );
}
