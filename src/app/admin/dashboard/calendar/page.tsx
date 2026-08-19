'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Appointment } from '@/lib/supabase';
import { ContactStatus } from '@/components/admin/ContactStatus';
import { ContactActions } from '@/components/admin/ContactActions';

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function CalendarPage() {
  const [tab, setTab] = useState<'confirmed' | 'declined'>('confirmed');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [declined, setDeclined] = useState<Appointment[]>([]);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState<Appointment | null>(null);

  function updateSelected(updated: Appointment) {
    setSelected(updated);
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setDeclined((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  useEffect(() => {
    fetch('/api/admin/appointments?status=confirmed')
      .then((res) => res.json())
      .then((data) => setAppointments(data.appointments ?? []));
    fetch('/api/admin/appointments?status=declined')
      .then((res) => res.json())
      .then((data) => setDeclined(data.appointments ?? []));
  }, []);

  const byDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const appt of appointments) {
      if (!map[appt.requested_date]) map[appt.requested_date] = [];
      map[appt.requested_date].push(appt);
    }
    return map;
  }, [appointments]);

  const { year, month } = cursor;
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = firstOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [...Array(startWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div>
      <h1 className="font-hand text-4xl text-diary-purple">Appointments</h1>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setTab('confirmed')}
          className={`rounded-full border-2 border-diary-black px-3 py-1 text-xs font-semibold ${tab === 'confirmed' ? 'bg-diary-pink text-white' : 'bg-white'}`}
        >
          Confirmed ({appointments.length})
        </button>
        <button
          onClick={() => setTab('declined')}
          className={`rounded-full border-2 border-diary-black px-3 py-1 text-xs font-semibold ${tab === 'declined' ? 'bg-diary-pink text-white' : 'bg-white'}`}
        >
          Declined ({declined.length})
        </button>
      </div>

      {tab === 'confirmed' ? (
        <>
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => shiftMonth(-1)} className="rounded-full border-2 border-diary-black px-3 py-1 text-sm">
              ← prev
            </button>
            <span className="font-display text-diary-black">{monthLabel}</span>
            <button onClick={() => shiftMonth(1)} className="rounded-full border-2 border-diary-black px-3 py-1 text-sm">
              next →
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-diary-black/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} className="aspect-square" />;
              const key = toDateKey(year, month, day);
              const dayAppts = byDate[key] ?? [];
              return (
                <div key={i} className="aspect-square rounded-md border border-diary-black/15 bg-white p-1 text-left">
                  <div className="text-[0.65rem] text-diary-black/50">{day}</div>
                  <div className="mt-0.5 space-y-0.5">
                    {dayAppts.slice(0, 2).map((appt) => (
                      <button
                        key={appt.id}
                        onClick={() => setSelected(appt)}
                        className="block w-full truncate rounded bg-diary-pink/15 px-1 py-0.5 text-left text-[0.62rem] text-diary-pink hover:bg-diary-pink/25"
                      >
                        {appt.requested_time} {appt.client_name}
                      </button>
                    ))}
                    {dayAppts.length > 2 && <div className="text-[0.6rem] text-diary-black/40">+{dayAppts.length - 2} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {declined.length === 0 && <p className="text-sm text-diary-black/40">No declined requests.</p>}
          {declined.map((appt) => (
            <button
              key={appt.id}
              onClick={() => setSelected(appt)}
              className="rounded-xl border-2 border-diary-black/15 bg-white p-3 text-left shadow-sticker"
            >
              <div className="font-display text-sm text-diary-black">{appt.client_name}</div>
              <div className="text-xs text-diary-black/60">
                {formatDate(appt.requested_date)} at {appt.requested_time}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm rounded-xl border-2 border-diary-black bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-lg text-diary-black">{selected.client_name}</div>
            <div className="mt-1 text-sm text-diary-black/70">{selected.phone}</div>
            {selected.instagram_handle && <div className="text-sm text-diary-purple">{selected.instagram_handle}</div>}
            <div className="mt-2">
              <ContactActions phone={selected.phone} instagramHandle={selected.instagram_handle} />
            </div>

            <div className="font-hand mt-3 text-xl text-diary-pink">
              {new Date(`${selected.requested_date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}{' '}
              at {selected.requested_time}
            </div>
            <div className="mt-2 inline-block rounded-full bg-diary-purple/10 px-2 py-0.5 text-xs text-diary-purple">{selected.status}</div>

            <div className="mt-3 space-y-1 rounded-lg bg-diary-black/5 p-2">
              <ContactStatus appointment={selected} onUpdated={updateSelected} />
              {selected.status === 'confirmed' && (
                <p className="text-xs font-semibold">
                  {selected.google_calendar_event_id ? (
                    <span className="text-green-600">✓ Added to Google Calendar</span>
                  ) : (
                    <span className="text-diary-black/50">Not synced to Google Calendar</span>
                  )}
                </p>
              )}
            </div>

            {selected.inspiration_image_url && (
              <img src={selected.inspiration_image_url} alt="Inspiration" className="mt-3 h-40 w-full rounded-md object-cover" />
            )}
            {selected.description && <p className="mt-3 text-sm italic text-diary-black/75">&ldquo;{selected.description}&rdquo;</p>}
            <button onClick={() => setSelected(null)} className="mt-4 w-full rounded-full border-2 border-diary-black py-2 text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
