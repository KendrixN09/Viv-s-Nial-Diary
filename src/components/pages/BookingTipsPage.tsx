'use client';

import { useEffect, useState } from 'react';
import { HeartSticker, SparkleSticker, ButterflySticker } from '../ui/Stickers';

export function BookingTipsPage() {
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setInstructions(data.content?.booking_instructions ?? ''));
  }, []);

  return (
    <div className="relative flex h-full flex-col items-center justify-center p-6 text-center sm:p-10">
      <ButterflySticker className="pointer-events-none absolute left-4 top-6 w-16 opacity-80" />
      <SparkleSticker className="animate-sparkle pointer-events-none absolute right-8 top-10 w-6" />
      <HeartSticker className="pointer-events-none absolute bottom-8 right-6 w-12 -rotate-6 opacity-80" />

      <h2 className="font-hand text-4xl text-diary-purple sm:text-5xl">How booking works</h2>
      <p className="font-body mt-4 max-w-xs text-sm leading-relaxed text-diary-black/75 sm:max-w-sm sm:text-base">
        {instructions}
      </p>
      <div className="mt-6 max-w-xs space-y-2 text-left text-sm text-diary-black/70 sm:max-w-sm">
        <p>✧ pick an open day + time</p>
        <p>✧ tell Viv a bit about you + the set</p>
        <p>✧ she reviews + confirms by text</p>
        <p>✧ status starts as pending, not automatic!</p>
      </div>
    </div>
  );
}
