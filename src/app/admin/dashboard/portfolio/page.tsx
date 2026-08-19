'use client';

import { useEffect, useState } from 'react';
import type { PortfolioImage } from '@/lib/supabase';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

export default function PortfolioManagerPage() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetch('/api/admin/portfolio')
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.images) {
          throw new Error(data?.error ?? 'Could not load the portfolio - is Supabase connected yet?');
        }
        setImages(data.images);
      })
      .catch((err) => {
        console.error('portfolio fetch failed', err);
        setError(err instanceof Error ? err.message : 'Could not load the portfolio');
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function updateLocal(id: string, patch: Partial<PortfolioImage>) {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error ?? 'Upload failed');

      const createRes = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image_url: uploadData.url, alt_text: altText }),
      });
      if (!createRes.ok) {
        const createData = await createRes.json();
        throw new Error(createData.error ?? 'Could not add photo');
      }
      setAltText('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUploading(false);
    }
  }

  async function replaceImage(id: string, file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error ?? 'Upload failed');

      const replaceRes = await fetch('/api/admin/portfolio', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, image_url: uploadData.url }),
      });
      if (!replaceRes.ok) throw new Error('Uploaded the photo but could not save it to this slot - try again');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUploading(false);
    }
  }

  async function saveAltText(img: PortfolioImage) {
    setSavingId(img.id);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: img.id, alt_text: img.alt_text }),
      });
      if (!res.ok) throw new Error('Could not save - try again');
      setSavedId(img.id);
      setTimeout(() => setSavedId((cur) => (cur === img.id ? null : cur)), 1500);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save - try again');
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const img = images.find((i) => i.id === id);
    const previous = img?.active ?? !active;
    updateLocal(id, { active });
    setActionError(null);
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, active }),
      });
      if (!res.ok) throw new Error('Could not update - try again');
    } catch (err) {
      updateLocal(id, { active: previous });
      setActionError(err instanceof Error ? err.message : 'Could not update - try again');
    }
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    const previous = images;
    setConfirmDeleteId(null);
    setImages((prev) => prev.filter((img) => img.id !== id));
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/portfolio?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete - try again');
    } catch (err) {
      setImages(previous);
      setActionError(err instanceof Error ? err.message : 'Could not delete - try again');
    }
  }

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const previous = images;
    const reordered = [...images];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setImages(reordered);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/portfolio/reorder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ order: reordered.map((img) => img.id) }),
      });
      if (!res.ok) throw new Error('Could not reorder - try again');
    } catch (err) {
      setImages(previous);
      setActionError(err instanceof Error ? err.message : 'Could not reorder - try again');
    }
  }

  return (
    <div>
      <h1 className="font-hand text-4xl text-diary-purple">Portfolio Manager</h1>
      <p className="mt-1 text-sm text-diary-black/60">
        Each picture is its own slot with its own controls - changes here update the public floating gallery immediately. The animation, rotation, and
        scrapbook styling on the public page are unaffected by anything here.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {actionError && (
        <p className="mt-2 rounded-lg border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}{' '}
          <button onClick={() => setActionError(null)} className="ml-2 underline">
            dismiss
          </button>
        </p>
      )}

      <div className="mt-5 rounded-xl border-2 border-diary-black/15 bg-white p-4">
        <h2 className="font-display text-sm text-diary-black">Add a new photo</h2>
        <label className="mt-2 block text-sm text-diary-black/70">
          Description (alt text)
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="e.g. Pink chrome French tips"
            className="mt-1 block w-full rounded-md border-2 border-diary-black/30 px-3 py-1.5 text-sm"
          />
        </label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = '';
          }}
          className="mt-2 block text-sm"
        />
        {uploading && <p className="mt-1 text-xs text-diary-black/50">uploading…</p>}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-diary-black/50">loading…</p>
      ) : images.length === 0 ? (
        <p className="mt-6 text-sm text-diary-black/50">No photos yet - add your first one above ✧</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <div key={img.id} className={`rounded-xl border-2 bg-white p-3 shadow-sticker ${img.active ? 'border-diary-black/15' : 'border-red-200 opacity-60'}`}>
              <div className="font-display mb-2 text-xs text-diary-purple">Portfolio Slot {i + 1}</div>
              <img src={img.image_url} alt={img.alt_text} className="aspect-square w-full rounded-md object-cover" />
              <input
                value={img.alt_text}
                onChange={(e) => updateLocal(img.id, { alt_text: e.target.value })}
                placeholder="Description"
                className="mt-2 w-full rounded-md border-2 border-diary-black/30 px-2 py-1 text-xs"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  onClick={() => saveAltText(img)}
                  disabled={savingId === img.id}
                  className="font-display rounded border-2 border-diary-black bg-diary-pink px-2 py-1 text-xs text-white disabled:opacity-60"
                >
                  {savingId === img.id ? 'Saving…' : savedId === img.id ? 'Saved ✓' : 'Save'}
                </button>
                <button onClick={() => move(i, -1)} className="rounded border border-diary-black/30 px-2 py-1 text-xs">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} className="rounded border border-diary-black/30 px-2 py-1 text-xs">
                  ↓
                </button>
                <label className="cursor-pointer rounded border border-diary-black/30 px-2 py-1 text-xs">
                  Replace
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) replaceImage(img.id, f);
                      e.target.value = '';
                    }}
                  />
                </label>
                <button onClick={() => toggleActive(img.id, !img.active)} className="rounded border border-diary-black/30 px-2 py-1 text-xs">
                  {img.active ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => setConfirmDeleteId(img.id)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!confirmDeleteId} onCancel={() => setConfirmDeleteId(null)} onConfirm={confirmDelete} />
    </div>
  );
}
