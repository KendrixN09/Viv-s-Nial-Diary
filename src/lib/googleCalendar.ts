import type { Appointment } from './supabase';

// Server-side Google Calendar sync for confirmed appointments. Uses a
// service account (not user OAuth) so there's no login flow for Viv to
// maintain - she shares her calendar with the service account's email once,
// and every accepted appointment appears on it automatically.
//
// TO ACTIVATE: create a Google Cloud project -> enable the Calendar API ->
// create a service account -> download its JSON key -> set
// GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (the key's
// "private_key" field, with literal \n newlines preserved), and
// GOOGLE_CALENDAR_ID (Viv's calendar id, found in Google Calendar ->
// Settings -> "Integrate calendar" - after sharing that calendar with the
// service account email as "Make changes to events").
function googleConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
      process.env.GOOGLE_CALENDAR_ID
  );
}

function slotToDateTime(date: string, time: string): Date {
  // time is stored as a display label like "2:00 PM" - parse it against the
  // requested date to build a real Date for the calendar event.
  const [, hourStr, minuteStr, meridiem] = time.match(/(\d+):(\d+)\s*(AM|PM)/i) ?? [];
  let hour = parseInt(hourStr ?? '9', 10);
  const minute = parseInt(minuteStr ?? '0', 10);
  if (meridiem?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (meridiem?.toUpperCase() === 'AM' && hour === 12) hour = 0;
  const d = new Date(`${date}T00:00:00`);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export async function createCalendarEvent(appt: Appointment): Promise<{ eventId: string | null; mock: boolean }> {
  if (!googleConfigured()) {
    console.log(`[google-calendar:mock] would create event for appointment ${appt.id}`);
    return { eventId: null, mock: true };
  }

  const { google } = await import('googleapis');
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const calendar = google.calendar({ version: 'v3', auth });

  const start = slotToDateTime(appt.requested_date, appt.requested_time);
  const end = new Date(start.getTime() + 90 * 60 * 1000); // default 90 min block

  const res = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: {
      summary: `Nail appt - ${appt.client_name}`,
      description: [
        `Client: ${appt.client_name}`,
        `Phone: ${appt.phone}`,
        appt.instagram_handle ? `Instagram: ${appt.instagram_handle}` : null,
        '',
        `Set description: ${appt.description || '(none provided)'}`,
      ]
        .filter(Boolean)
        .join('\n'),
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    },
  });

  return { eventId: res.data.id ?? null, mock: false };
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (!googleConfigured()) {
    console.log(`[google-calendar:mock] would delete event ${eventId}`);
    return;
  }
  const { google } = await import('googleapis');
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.delete({ calendarId: process.env.GOOGLE_CALENDAR_ID!, eventId }).catch(() => {});
}
