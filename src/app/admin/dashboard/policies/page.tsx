'use client';

import { useEffect, useState } from 'react';
import type { Policy } from '@/lib/supabase';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

export default function PoliciesManagerPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    fetch('/api/admin/policies')
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.policies) throw new Error(data?.error ?? 'Could not load policies - is Supabase connected yet?');
        setPolicies(data.policies);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load policies'))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function updateLocal(id: string, patch: Partial<Policy>) {
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function save(policy: Policy) {
    setSavingId(policy.id);
    try {
      await fetch('/api/admin/policies', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: policy.id, title: policy.title, content: policy.content }),
      });
      setSavedId(policy.id);
      setTimeout(() => setSavedId((cur) => (cur === policy.id ? null : cur)), 1500);
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(policy: Policy) {
    updateLocal(policy.id, { active: !policy.active });
    await fetch('/api/admin/policies', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: policy.id, active: !policy.active }),
    });
  }

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= policies.length) return;
    const reordered = [...policies];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setPolicies(reordered);
    await fetch('/api/admin/policies/reorder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ order: reordered.map((p) => p.id) }),
    });
  }

  async function addPolicy() {
    setAdding(true);
    try {
      const res = await fetch('/api/admin/policies', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'New Notice', content: '' }),
      });
      const data = await res.json();
      if (res.ok && data.policy) setPolicies((prev) => [...prev, data.policy]);
    } finally {
      setAdding(false);
    }
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/admin/policies?id=${id}`, { method: 'DELETE' });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-hand text-4xl text-diary-purple">Policies Manager</h1>
      <p className="mt-1 text-sm text-diary-black/60">Every notice is its own item - edits here update the public Notices page immediately.</p>

      {loading ? (
        <p className="mt-6 text-sm text-diary-black/50">loading…</p>
      ) : error ? (
        <p className="mt-6 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {policies.length === 0 && <p className="text-sm text-diary-black/40">No policies yet - add your first one below.</p>}
          {policies.map((policy, i) => (
            <div key={policy.id} className={`rounded-xl border-2 bg-white p-4 shadow-sticker ${policy.active ? 'border-diary-black/15' : 'border-red-200 opacity-60'}`}>
              <div className="flex items-center gap-2">
                <span className="font-display shrink-0 text-xs text-diary-black/40">#{i + 1}</span>
                <input
                  value={policy.title}
                  onChange={(e) => updateLocal(policy.id, { title: e.target.value })}
                  placeholder="Notice title (e.g. Deposit Policy)"
                  className="flex-1 rounded-md border-2 border-diary-black/30 px-2 py-1.5 text-sm font-semibold"
                />
              </div>
              <textarea
                value={policy.content}
                onChange={(e) => updateLocal(policy.id, { content: e.target.value })}
                rows={2}
                placeholder="Notice content"
                className="mt-2 w-full rounded-md border-2 border-diary-black/30 px-2 py-1.5 text-sm"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => save(policy)}
                  disabled={savingId === policy.id}
                  className="font-display rounded-full border-2 border-diary-black bg-diary-pink px-3 py-1 text-xs text-white disabled:opacity-60"
                >
                  {savingId === policy.id ? 'Saving…' : savedId === policy.id ? 'Saved ✓' : 'Save'}
                </button>
                <button onClick={() => move(i, -1)} className="rounded border border-diary-black/30 px-2 py-1 text-xs">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} className="rounded border border-diary-black/30 px-2 py-1 text-xs">
                  ↓
                </button>
                <button onClick={() => toggleActive(policy)} className="rounded border border-diary-black/30 px-2 py-1 text-xs">
                  {policy.active ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => setConfirmDeleteId(policy.id)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={addPolicy}
        disabled={adding}
        className="font-display mt-4 rounded-full border-2 border-diary-black px-4 py-2 text-sm disabled:opacity-60"
      >
        + Add Policy
      </button>

      <ConfirmDialog open={!!confirmDeleteId} onCancel={() => setConfirmDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
}
