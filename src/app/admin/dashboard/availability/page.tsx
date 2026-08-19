'use client';

import { useEffect, useState } from 'react';
import type { AvailabilitySlot, BlockedDay } from '@/lib/supabase';

const QUICK_TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch('/api/admin/availability')
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setBlockedDays(data.blockedDays ?? []);
      })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function addSlots() {
    if (!newDate || selectedTimes.length === 0) {
      setError('Pick a date and at least one time');
      return;
    }
    setError(null);
    for (const time of selectedTimes) {
      await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ date: newDate, time }),
      });
    }
    setSelectedTimes([]);
    load();
  }

  async function removeSlot(id: string) {
    const res = await fetch(`/api/admin/availability?id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Could not remove slot');
      return;
    }
    load();
  }

  async function blockDay() {
    if (!newDate) return;
    const res = await fetch('/api/admin/availability/blocked-days', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ date: newDate }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Could not block day');
      return;
    }
    load();
  }

  async function unblockDay(id: string) {
    await fetch(`/api/admin/availability/blocked-days?id=${id}`, { method: 'DELETE' });
    load();
  }

  const slotsByDate: Record<string, AvailabilitySlot[]> = {};
  for (const s of slots) {
    if (!slotsByDate[s.date]) slotsByDate[s.date] = [];
    slotsByDate[s.date].push(s);
  }

  return (
    <div>
      <h1 className="font-hand text-4xl text-diary-purple">Availability</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-5 rounded-xl border-2 border-diary-black/15 bg-white p-4">
        <h2 className="font-display text-sm text-diary-black">Add open times</h2>
        <label className="mt-3 block text-sm text-diary-black/70">
          Date
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="mt-1 block rounded-md border-2 border-diary-black/30 px-3 py-1.5 text-sm"
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_TIMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
              className={`rounded-full border-2 border-diary-black px-3 py-1 text-xs ${
                selectedTimes.includes(t) ? 'bg-diary-pink text-white' : 'bg-white text-diary-black'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="custom time, e.g. 7:30 PM"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="flex-1 rounded-md border-2 border-diary-black/30 px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              if (customTime.trim()) {
                setSelectedTimes((prev) => [...prev, customTime.trim()]);
                setCustomTime('');
              }
            }}
            className="rounded-full border-2 border-diary-black px-3 py-1 text-xs"
          >
            + add
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={addSlots} className="font-display rounded-full border-2 border-diary-black bg-diary-pink px-4 py-2 text-sm text-white">
            Open these times
          </button>
          <button onClick={blockDay} className="font-display rounded-full border-2 border-diary-black bg-white px-4 py-2 text-sm text-diary-black">
            Block this whole day
          </button>
        </div>
      </div>

      {blockedDays.length > 0 && (
        <div className="mt-5">
          <h2 className="font-display text-sm text-diary-black">Blocked days</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {blockedDays.map((b) => (
              <span key={b.id} className="flex items-center gap-2 rounded-full bg-diary-black/10 px-3 py-1 text-xs">
                {b.date}
                <button onClick={() => unblockDay(b.id)} className="text-diary-pink">
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="font-display text-sm text-diary-black">Open slots</h2>
        {loading ? (
          <p className="mt-2 text-sm text-diary-black/50">loading…</p>
        ) : Object.keys(slotsByDate).length === 0 ? (
          <p className="mt-2 text-sm text-diary-black/50">No open slots yet.</p>
        ) : (
          <div className="mt-2 space-y-3">
            {Object.entries(slotsByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, daySlots]) => (
                <div key={date} className="rounded-lg border border-diary-black/15 bg-white p-3">
                  <div className="text-sm font-semibold text-diary-black">{date}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {daySlots.map((s) => (
                      <span
                        key={s.id}
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                          s.booked_appointment_id ? 'border-diary-purple bg-diary-purple/10 text-diary-purple' : 'border-diary-black/25'
                        }`}
                      >
                        {s.time}
                        {s.booked_appointment_id ? (
                          <span title="Booked">🔒</span>
                        ) : (
                          <button onClick={() => removeSlot(s.id)} className="text-diary-pink">
                            ✕
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
