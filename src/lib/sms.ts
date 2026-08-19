// Sends client SMS via Twilio when TWILIO_* env vars are configured. When
// they're absent (e.g. local dev before Viv has a Twilio account), calls
// fall back to a logged mock mode instead of throwing - so the rest of the
// accept/decline flow (DB status, calendar sync) still works end to end
// without a real SMS provider connected yet.
function twilioConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

export type SmsResult = { sent: boolean; mock: boolean; messageId: string | null; error: string | null };

async function sendSms(to: string, body: string): Promise<SmsResult> {
  if (!twilioConfigured()) {
    console.log(`[sms:mock] would send to ${to}: ${body}`);
    return { sent: true, mock: true, messageId: null, error: null };
  }

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
    const message = await client.messages.create({
      to,
      from: process.env.TWILIO_FROM_NUMBER!,
      body,
    });
    return { sent: true, mock: false, messageId: message.sid, error: null };
  } catch (err) {
    // Twilio failures (bad number, account issue, network) must never throw
    // out of here - the caller (accept/decline) needs a clean result so it
    // can keep the appointment's confirmed/declined status and surface a
    // retry option, instead of the whole action failing.
    console.error('twilio send failed', err);
    return { sent: false, mock: false, messageId: null, error: err instanceof Error ? err.message : 'SMS send failed' };
  }
}

function formatDateLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export async function sendConfirmationSms(phone: string, date: string, time: string): Promise<SmsResult> {
  const body = [
    '💗 Viv\'s Nail Diary',
    'Your nail appointment has been confirmed!',
    `Date: ${formatDateLabel(date)}`,
    `Time: ${time}`,
    'See you soon! ✧',
  ].join('\n');
  return sendSms(phone, body);
}

export async function sendDeclineSms(phone: string, date: string, time: string): Promise<SmsResult> {
  const body = [
    '💗 Viv\'s Nail Diary',
    `Unfortunately, your requested appointment for ${formatDateLabel(date)} at ${time} could not be confirmed.`,
    'Please visit Viv\'s Nail Diary again to request another available time. ✧',
  ].join('\n');
  return sendSms(phone, body);
}
