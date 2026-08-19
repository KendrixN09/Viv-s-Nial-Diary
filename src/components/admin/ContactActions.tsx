// Tap-to-call, tap-to-text (opens the phone's own native Messages app - no
// Twilio, uses Viv's own number/plan), and tap-to-DM links so acting on a
// decided appointment is one tap from a phone, which is how the admin
// dashboard mostly gets used.
export function ContactActions({ phone, instagramHandle }: { phone: string; instagramHandle: string | null }) {
  const igUsername = instagramHandle?.replace(/^@/, '').trim();

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`tel:${phone}`}
        className="rounded-full border-2 border-diary-black px-2.5 py-1 text-xs font-semibold hover:bg-diary-hotpink/15"
      >
        📞 Call
      </a>
      <a
        href={`sms:${phone}`}
        className="rounded-full border-2 border-diary-black px-2.5 py-1 text-xs font-semibold hover:bg-diary-hotpink/15"
      >
        💬 Text
      </a>
      {igUsername && (
        <a
          href={`https://instagram.com/${igUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border-2 border-diary-black px-2.5 py-1 text-xs font-semibold hover:bg-diary-hotpink/15"
        >
          📷 DM
        </a>
      )}
    </div>
  );
}
