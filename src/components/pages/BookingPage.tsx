'use client';

import { useEffect, useState } from 'react';
import { StarSticker } from '../ui/Stickers';
import { CalendarPicker } from '../ui/CalendarPicker';

type SlotsByDate = Record<string, { id: string; time: string }[]>;

function formatDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function BookingPage({ onSubmitted }: { onSubmitted: () => void }) {
  const [availability, setAvailability] = useState<SlotsByDate>({});
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/availability', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setAvailability(data.availability ?? {}))
      .catch(() => setError('Couldn’t load open times - refresh to try again'))
      .finally(() => setLoadingSlots(false));
  }, []);

  const dates = Object.keys(availability).sort();

  function handleFile(f: File | null) {
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedDate || !selectedTime) {
      setError('Pick an open day and time first ✧');
      return;
    }
    if (!clientName.trim() || !phone.trim()) {
      setError('Name and phone are required');
      return;
    }

    setSubmitting(true);
    try {
      let inspiration_image_url: string | undefined;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const uploadRes = await fetch('/api/booking/upload', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? 'Image upload failed');
        inspiration_image_url = uploadData.url;
      }

      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName,
          phone,
          instagram_handle: instagram || undefined,
          requested_date: selectedDate,
          requested_time: selectedTime,
          description,
          inspiration_image_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not submit your request');
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="scrollbar-thin relative h-full overflow-y-auto p-4 sm:p-7">
      <StarSticker className="pointer-events-none absolute right-2 top-2 w-8 opacity-70" />
      <h2 className="font-hand text-center text-3xl text-diary-black sm:text-4xl">Book a set ✧</h2>

      <form onSubmit={handleSubmit} className="mx-auto mt-4 max-w-md space-y-5">
        {/* ---- date/time ---- */}
        <div>
          <label className="font-hand block text-xl text-diary-purple">Choose Your Date</label>
          {loadingSlots ? (
            <p className="mt-2 text-sm text-diary-black/60">loading open days…</p>
          ) : dates.length === 0 ? (
            <p className="mt-2 text-sm text-diary-black/60">No open times right now - check back soon!</p>
          ) : (
            <div className="mt-2">
              <CalendarPicker
                availableDates={dates}
                selectedDate={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d);
                  setSelectedTime(null);
                }}
              />
            </div>
          )}
        </div>

        {selectedDate && (
          <div>
            <label className="font-hand block text-xl text-diary-purple">Choose Your Time</label>
            <p className="text-xs text-diary-black/50">{formatDateLabel(selectedDate)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {availability[selectedDate]?.map((slot) => (
                <button
                  type="button"
                  key={slot.id}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`rounded-full border-2 border-diary-black px-3 py-1.5 text-xs font-semibold sm:text-sm ${
                    selectedTime === slot.time ? 'bg-diary-pink text-white' : 'bg-white text-diary-black hover:bg-diary-hotpink/15'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---- client info ---- */}
        <div className="grid gap-3">
          <label className="text-sm text-diary-black/80">
            Name <span className="text-diary-pink">*</span>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="mt-1 w-full rounded-md border-2 border-diary-black/30 bg-white px-3 py-2 text-base focus:border-diary-pink"
            />
          </label>
          <label className="text-sm text-diary-black/80">
            Phone number <span className="text-diary-pink">*</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="(555) 555-5555"
              className="mt-1 w-full rounded-md border-2 border-diary-black/30 bg-white px-3 py-2 text-base focus:border-diary-pink"
            />
          </label>
          <label className="text-sm text-diary-black/80">
            Instagram handle <span className="text-diary-black/40">(optional)</span>
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@yourhandle"
              className="mt-1 w-full rounded-md border-2 border-diary-black/30 bg-white px-3 py-2 text-base focus:border-diary-pink"
            />
          </label>
        </div>

        {/* ---- inspo + description ---- */}
        <div>
          <label className="text-sm text-diary-black/80">
            Inspo picture <span className="text-diary-black/40">(optional)</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
          </label>
          {previewUrl && (
            <img src={previewUrl} alt="Inspiration preview" className="mt-2 h-32 w-32 rounded-md border-2 border-diary-black object-cover" />
          )}
        </div>
        <label className="block text-sm text-diary-black/80">
          Describe the set you want ✧
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="colors, length, shape, charms, gems, anything special..."
            className="mt-1 w-full rounded-md border-2 border-diary-black/30 bg-white px-3 py-2 text-base focus:border-diary-pink"
          />
        </label>

        {error && <p className="font-hand text-lg text-diary-pink">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="font-display w-full rounded-full border-4 border-diary-black bg-diary-pink py-3 text-white shadow-sticker transition hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
