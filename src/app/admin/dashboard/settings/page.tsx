'use client';

import { useEffect, useState } from 'react';

type ContentRow = { key: string; value: unknown };

async function saveKey(key: string, value: unknown) {
  await fetch('/api/admin/content', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
}

export default function SiteSettingsPage() {
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [kennesawText, setKennesawText] = useState('');
  const [bookingInstructions, setBookingInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => res.json())
      .then((data) => {
        const rows: ContentRow[] = data.content ?? [];
        const get = (k: string) => rows.find((r) => r.key === k)?.value;
        setInstagramHandle((get('instagram_handle') as string) ?? '');
        setInstagramUrl((get('instagram_url') as string) ?? '');
        setKennesawText((get('kennesaw_text') as string) ?? '');
        setBookingInstructions((get('booking_instructions') as string) ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  function flashSaved() {
    setSavedMsg('Saved ✓');
    setTimeout(() => setSavedMsg(null), 1500);
  }

  if (loading) return <p className="text-sm text-diary-black/50">loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-hand text-4xl text-diary-purple">Site Settings</h1>
      <p className="mt-1 text-sm text-diary-black/60">Small standalone bits of text shown on the public notebook.</p>
      {savedMsg && <p className="mt-2 text-sm font-semibold text-green-600">{savedMsg}</p>}

      <section className="mt-6 rounded-xl border-2 border-diary-black/15 bg-white p-4">
        <div className="grid gap-3">
          <label className="text-sm text-diary-black/70">
            Instagram handle (shown on cover/portfolio)
            <input
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              className="mt-1 block w-full rounded-md border-2 border-diary-black/30 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-sm text-diary-black/70">
            Instagram URL
            <input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-2 border-diary-black/30 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-sm text-diary-black/70">
            &quot;Kennesaw Based&quot; text
            <input
              value={kennesawText}
              onChange={(e) => setKennesawText(e.target.value)}
              className="mt-1 block w-full rounded-md border-2 border-diary-black/30 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-sm text-diary-black/70">
            Booking instructions
            <textarea
              value={bookingInstructions}
              onChange={(e) => setBookingInstructions(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-2 border-diary-black/30 px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <button
          onClick={async () => {
            await Promise.all([
              saveKey('instagram_handle', instagramHandle),
              saveKey('instagram_url', instagramUrl),
              saveKey('kennesaw_text', kennesawText),
              saveKey('booking_instructions', bookingInstructions),
            ]);
            flashSaved();
          }}
          className="font-display mt-3 rounded-full border-2 border-diary-black bg-diary-pink px-4 py-1.5 text-xs text-white"
        >
          Save site text
        </button>
      </section>
    </div>
  );
}
