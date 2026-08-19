'use client';

import { useState } from 'react';
import type { Appointment } from '@/lib/supabase';

// A manual note-to-self, not an automated notification status: lets Viv mark
// that she's already personally texted/DM'd this client about the decision,
// so she doesn't lose track of who she still needs to message.
export function ContactStatus({ appointment, onUpdated }: { appointment: Appointment; onUpdated?: (updated: Appointment) => void }) {
  const [busy, setBusy] = useState(false);

  if (appointment.status !== 'confirmed' && appointment.status !== 'declined') return null;
  const contacted = appointment.sms_status === 'sent';

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/appointments/mark-contacted', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: appointment.id, contacted: !contacted }),
      });
      const data = await res.json();
      if (res.ok && data.appointment) onUpdated?.(data.appointment);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`text-xs font-semibold underline decoration-dotted disabled:opacity-50 ${contacted ? 'text-green-600' : 'text-diary-black/50'}`}
    >
      {contacted ? '✓ You contacted them (tap to undo)' : 'Mark as contacted'}
    </button>
  );
}
