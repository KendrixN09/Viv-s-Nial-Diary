'use client';

import { useState } from 'react';

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Y2K-styled month-grid date picker for the booking flow. Only dates present
// in `availableDates` (the admin's real open days, from /api/availability)
// are clickable - everything else renders dim and disabled, so a client can
// never even attempt to pick a day Viv hasn't opened.
export function CalendarPicker({
  availableDates,
  selectedDate,
  onSelect,
}: {
  availableDates: string[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  const availableSet = new Set(availableDates);
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstOfMonth = new Date(cursor.year, cursor.month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const monthLabel = firstOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const cells: (number | null)[] = [...Array(startWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div className="rounded-xl border-2 border-diary-black/20 bg-white/70 p-3 shadow-sticker">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className="rounded-full border-2 border-diary-black px-2 py-0.5 text-xs hover:bg-diary-hotpink/15"
        >
          ←
        </button>
        <span className="font-hand text-xl text-diary-purple">{monthLabel}</span>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="rounded-full border-2 border-diary-black px-2 py-0.5 text-xs hover:bg-diary-hotpink/15"
        >
          →
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[0.6rem] font-semibold uppercase text-diary-black/40">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = toDateKey(cursor.year, cursor.month, day);
          const isAvailable = availableSet.has(key);
          const isSelected = selectedDate === key;
          return (
            <button
              type="button"
              key={i}
              disabled={!isAvailable}
              onClick={() => onSelect(key)}
              className={`aspect-square rounded-md text-xs font-semibold transition sm:text-sm ${
                isSelected
                  ? 'bg-diary-pink text-white'
                  : isAvailable
                    ? 'bg-diary-hotpink/15 text-diary-black hover:bg-diary-hotpink/30'
                    : 'cursor-not-allowed text-diary-black/20'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[0.65rem] text-diary-black/40">pink = open ✧ tap a date</p>
    </div>
  );
}
