'use client';

import { useEffect, useState } from 'react';
import type { PricingItem } from '@/lib/supabase';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

export default function PricingManagerPage() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetch('/api/admin/pricing')
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.pricing) throw new Error(data?.error ?? 'Could not load pricing - is Supabase connected yet?');
        setItems(data.pricing);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load pricing'))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function updateLocal(id: string, patch: Partial<PricingItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  async function save(item: PricingItem) {
    setSavingId(item.id);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: item.id, service: item.service, price: item.price, description: item.description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Could not save - try again');
      }
      setSavedId(item.id);
      setTimeout(() => setSavedId((cur) => (cur === item.id ? null : cur)), 1500);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save - try again');
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(item: PricingItem) {
    const previous = item.active;
    updateLocal(item.id, { active: !item.active });
    setActionError(null);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: item.id, active: !item.active }),
      });
      if (!res.ok) throw new Error('Could not update - try again');
    } catch (err) {
      updateLocal(item.id, { active: previous });
      setActionError(err instanceof Error ? err.message : 'Could not update - try again');
    }
  }

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const previous = items;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/pricing/reorder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ order: reordered.map((it) => it.id) }),
      });
      if (!res.ok) throw new Error('Could not reorder - try again');
    } catch (err) {
      setItems(previous);
      setActionError(err instanceof Error ? err.message : 'Could not reorder - try again');
    }
  }

  async function addItem() {
    setAdding(true);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ service: 'New Service', price: '$0' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.item) throw new Error(data?.error ?? 'Could not add item - try again');
      setItems((prev) => [...prev, data.item]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not add item - try again');
    } finally {
      setAdding(false);
    }
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    const previous = items;
    setConfirmDeleteId(null);
    setItems((prev) => prev.filter((it) => it.id !== id));
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/pricing?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete - try again');
    } catch (err) {
      setItems(previous);
      setActionError(err instanceof Error ? err.message : 'Could not delete - try again');
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-hand text-4xl text-diary-purple">Pricing Manager</h1>
      <p className="mt-1 text-sm text-diary-black/60">Every price is its own item - edits here update the public Price List immediately.</p>

      {actionError && (
        <p className="mt-4 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}{' '}
          <button onClick={() => setActionError(null)} className="ml-2 underline">
            dismiss
          </button>
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-diary-black/50">loading…</p>
      ) : error ? (
        <p className="mt-6 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.length === 0 && <p className="text-sm text-diary-black/40">No pricing items yet - add your first one below.</p>}
          {items.map((item, i) => (
            <div key={item.id} className={`rounded-xl border-2 bg-white p-4 shadow-sticker ${item.active ? 'border-diary-black/15' : 'border-red-200 opacity-60'}`}>
              <div className="flex items-center gap-2">
                <span className="font-display shrink-0 text-xs text-diary-black/40">#{i + 1}</span>
                <input
                  value={item.service}
                  onChange={(e) => updateLocal(item.id, { service: e.target.value })}
                  placeholder="Service (e.g. Full Set)"
                  className="flex-1 rounded-md border-2 border-diary-black/30 px-2 py-1.5 text-sm font-semibold"
                />
                <input
                  value={item.price}
                  onChange={(e) => updateLocal(item.id, { price: e.target.value })}
                  placeholder="$50"
                  className="w-24 rounded-md border-2 border-diary-black/30 px-2 py-1.5 text-sm"
                />
              </div>
              <input
                value={item.description}
                onChange={(e) => updateLocal(item.id, { description: e.target.value })}
                placeholder="Optional description"
                className="mt-2 w-full rounded-md border-2 border-diary-black/30 px-2 py-1.5 text-sm"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => save(item)}
                  disabled={savingId === item.id}
                  className="font-display rounded-full border-2 border-diary-black bg-diary-pink px-3 py-1 text-xs text-white disabled:opacity-60"
                >
                  {savingId === item.id ? 'Saving…' : savedId === item.id ? 'Saved ✓' : 'Save'}
                </button>
                <button onClick={() => move(i, -1)} className="rounded border border-diary-black/30 px-2 py-1 text-xs">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} className="rounded border border-diary-black/30 px-2 py-1 text-xs">
                  ↓
                </button>
                <button onClick={() => toggleActive(item)} className="rounded border border-diary-black/30 px-2 py-1 text-xs">
                  {item.active ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => setConfirmDeleteId(item.id)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={addItem}
        disabled={adding}
        className="font-display mt-4 rounded-full border-2 border-diary-black px-4 py-2 text-sm disabled:opacity-60"
      >
        + Add Pricing Item
      </button>

      <ConfirmDialog open={!!confirmDeleteId} onCancel={() => setConfirmDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
}
