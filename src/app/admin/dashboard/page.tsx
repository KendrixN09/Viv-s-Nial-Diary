'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/admin/StatCard';

type Stats = {
  thisMonth: number;
  confirmed: number;
  pending: number;
  declined: number;
  upcoming: number;
  today: number;
  uniqueClientsThisMonth: number;
};

export default function AdminHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.stats) {
          throw new Error(data?.error ?? 'Could not load stats');
        }
        setStats(data.stats);
      })
      .catch((err) => {
        console.error('admin stats fetch failed', err);
        setError(
          err instanceof Error && err.message !== 'Could not load stats'
            ? err.message
            : 'Could not load stats - is Supabase connected yet? Check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-hand text-4xl text-diary-purple">Welcome back, Viv ✧</h1>
      <p className="mt-1 text-sm text-diary-black/60">Here&apos;s what&apos;s going on in the diary.</p>

      {loading ? (
        <p className="mt-6 text-sm text-diary-black/50">loading stats…</p>
      ) : error ? (
        <p className="mt-6 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : stats ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label="This month's appts" value={stats.thisMonth} accent="purple" />
          <StatCard label="Confirmed" value={stats.confirmed} accent="pink" />
          <StatCard label="Pending requests" value={stats.pending} accent="gold" />
          <StatCard label="Declined" value={stats.declined} />
          <StatCard label="Upcoming (confirmed)" value={stats.upcoming} accent="purple" />
          <StatCard label="Today" value={stats.today} accent="pink" />
          <StatCard label="Clients this month" value={stats.uniqueClientsThisMonth} accent="gold" />
        </div>
      ) : null}

      {stats && stats.pending > 0 && (
        <a
          href="/admin/dashboard/pending"
          className="font-display mt-6 inline-block rounded-full border-2 border-diary-black bg-diary-pink px-5 py-2.5 text-sm text-white shadow-sticker"
        >
          Review {stats.pending} pending request{stats.pending === 1 ? '' : 's'} →
        </a>
      )}
    </div>
  );
}
