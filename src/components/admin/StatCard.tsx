export function StatCard({ label, value, accent = 'pink' }: { label: string; value: number | string; accent?: 'pink' | 'purple' | 'gold' }) {
  const accentClasses = {
    pink: 'border-diary-pink text-diary-pink',
    purple: 'border-diary-purple text-diary-purple',
    gold: 'border-[#d4af37] text-[#a3801d]',
  }[accent];

  return (
    <div className={`rounded-xl border-2 bg-white p-4 shadow-sticker ${accentClasses}`}>
      <div className="font-display text-3xl">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-diary-black/60">{label}</div>
    </div>
  );
}
