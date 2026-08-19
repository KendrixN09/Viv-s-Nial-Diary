'use client';

import { useEffect, useState } from 'react';
import type { Appointment } from '@/lib/supabase';
import { ContactStatus } from '@/components/admin/ContactStatus';
import { ContactActions } from '@/components/admin/ContactActions';

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function PendingRequestsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetch('/api/admin/appointments?status=pending')
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.appointments) {
          throw new Error(data?.error ?? 'Could not load requests - is Supabase connected yet?');
        }
        setAppointments(data.appointments);
      })
      .catch((err) => {
        console.error('pending requests fetch failed', err);
        setError(err instanceof Error ? err.message : 'Could not load requests');
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function decide(id: string, action: 'accept' | 'decline') {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not update the request');
      // Kept in the list (not removed) showing its new status, rather than
      // silently vanishing - Accept/Decline won't render for it anymore
      // since those only show for status === 'pending' below, so there's no
      // way to re-trigger a second decision from this screen once decided.
      if (data.appointment) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? data.appointment : a)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusyId(null);
    }
  }

  function updateAppointment(updated: Appointment) {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  return (
    <div>
      <h1 className="font-hand text-4xl text-diary-purple">Waiting for your decision</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-diary-black/50">loading requests…</p>
      ) : error ? null : appointments.length === 0 ? (
        <p className="mt-6 text-sm text-diary-black/50">No pending requests right now ✧</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className={`rounded-xl border-2 bg-white p-4 shadow-sticker ${
                appt.status === 'pending' ? 'border-diary-black/15' : appt.status === 'confirmed' ? 'border-green-300' : 'border-diary-black/15 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-lg text-diary-black">{appt.client_name}</div>
                  <div className="text-sm text-diary-black/60">{appt.phone}</div>
                  {appt.instagram_handle && <div className="text-sm text-diary-purple">{appt.instagram_handle}</div>}
                </div>
                <div className="text-right">
                  <div className="font-hand text-xl text-diary-pink">{formatDate(appt.requested_date)}</div>
                  <div className="text-sm text-diary-black/70">{appt.requested_time}</div>
                </div>
              </div>

              <div className="mt-2">
                <ContactActions phone={appt.phone} instagramHandle={appt.instagram_handle} />
              </div>

              {appt.inspiration_image_url && (
                <button onClick={() => setLightbox(appt.inspiration_image_url)} className="mt-3 block">
                  <img
                    src={appt.inspiration_image_url}
                    alt="Client's inspiration"
                    className="h-32 w-32 rounded-md border-2 border-diary-black/20 object-cover"
                  />
                </button>
              )}

              {appt.description && <p className="mt-3 text-sm italic text-diary-black/75">&ldquo;{appt.description}&rdquo;</p>}

              <div className="mt-2 text-xs text-diary-black/40">
                requested {new Date(appt.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </div>

              {appt.status === 'pending' ? (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => decide(appt.id, 'accept')}
                    disabled={busyId === appt.id}
                    className="font-display flex-1 rounded-full border-2 border-diary-black bg-diary-pink py-2 text-sm text-white disabled:opacity-50"
                  >
                    {busyId === appt.id ? 'Working…' : 'Accept'}
                  </button>
                  <button
                    onClick={() => decide(appt.id, 'decline')}
                    disabled={busyId === appt.id}
                    className="font-display flex-1 rounded-full border-2 border-diary-black bg-white py-2 text-sm text-diary-black disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-1">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-diary-black/10 text-diary-black/60'}`}>
                    {appt.status === 'confirmed' ? 'Confirmed' : 'Declined'}
                  </span>
                  <ContactStatus appointment={appt} onUpdated={updateAppointment} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Inspiration enlarged" className="max-h-[85vh] max-w-[90vw] rounded-lg border-4 border-white" />
        </div>
      )}
    </div>
  );
}
