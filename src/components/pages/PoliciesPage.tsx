'use client';

import { useEffect, useState } from 'react';
import { HeartSticker, StarSticker } from '../ui/Stickers';

type Notice = { title: string; content: string };
type PriceLine = { label: string; price: string };

// Extracted from the reference "Notice" images provided 2026-08-18. Shown
// until Supabase is connected (or if the admin ever clears every notice) so
// this page never sits blank/erroring where real policies should be.
const FALLBACK_NOTICES: Notice[] = [
  { title: 'Payment Methods', content: 'Cash, CashApp, Apple Pay, Zelle, & Venmo' },
  { title: 'House Calls', content: 'House calls are only for Kennesaw locations!' },
  { title: 'Nail Prep', content: 'Empty nails are preferred for your appointment' },
  { title: 'Fixes & Refunds', content: 'Fixes are free (I’m a beginner!) - no free full sets or refunds' },
  { title: 'Booking Etiquette', content: 'Please don’t book if you’re going to rush me! All love, please book when you’re free' },
  { title: 'Services Offered', content: 'I only provide Gel X, gel builder on natural nails, and Gel X fills' },
  { title: 'Toes', content: 'Of course I do toes! Menu is on my highlights - acrylic on 2 big toes only' },
  { title: 'Intricate Designs', content: 'I only charge extra for intricate designs (ones that take me 4+ hours)' },
  { title: 'Deposits', content: 'No deposit needed to book with me! Things happen - you can always rebook through DM' },
];

const FALLBACK_PRICING: PriceLine[] = [
  { label: 'Full set (any length/design)', price: '$50' },
  { label: 'Toes - gel polish change', price: '$25' },
  { label: 'Toes - gel polish change, french', price: '$30' },
  { label: 'Toes - gel polish change, french + design', price: '$38' },
  { label: 'Acrylic on 2 big toes + any design', price: '$40' },
];

export function PoliciesPage() {
  const [notices, setNotices] = useState<Notice[]>(FALLBACK_NOTICES);
  const [pricing, setPricing] = useState<PriceLine[]>(FALLBACK_PRICING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/policies', { cache: 'no-store' }).then((res) => res.json()),
      fetch('/api/pricing', { cache: 'no-store' }).then((res) => res.json()),
    ])
      .then(([policiesResult, pricingResult]) => {
        if (policiesResult.status === 'fulfilled' && Array.isArray(policiesResult.value.policies) && policiesResult.value.policies.length > 0) {
          setNotices(policiesResult.value.policies);
        }
        if (pricingResult.status === 'fulfilled' && Array.isArray(pricingResult.value.pricing) && pricingResult.value.pricing.length > 0) {
          setPricing(
            pricingResult.value.pricing.map((p: { service: string; price: string }) => ({ label: p.service, price: p.price }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="scrollbar-thin relative h-full overflow-y-auto p-5 sm:p-9">
      <HeartSticker className="pointer-events-none absolute -left-2 top-2 w-10 opacity-80" />
      <StarSticker className="pointer-events-none absolute right-3 top-6 w-8 opacity-80" color="#c86bff" />

      <h2 className="font-hand text-center text-4xl text-diary-black sm:text-5xl">Notices</h2>
      {loading && <p className="font-hand mt-1 text-center text-sm text-diary-purple/50">loading…</p>}

      <div className="mx-auto mt-5 grid max-w-md gap-3">
        {notices.map((notice, i) => (
          <div
            key={i}
            className="relative rounded-sm bg-[#fdfdf5] p-4 shadow-sticker"
            style={{ transform: `rotate(${i % 2 === 0 ? -0.6 : 0.6}deg)` }}
          >
            <span
              className="tape absolute -top-2 h-5 w-14 -rotate-6"
              style={{ left: i % 3 === 0 ? '10%' : i % 3 === 1 ? '40%' : '65%' }}
              aria-hidden="true"
            />
            <h3 className="font-hand text-xl text-diary-pink">{notice.title}</h3>
            <p className="mt-1 text-sm leading-snug text-diary-black/85">{notice.content}</p>
          </div>
        ))}
      </div>

      {pricing.length > 0 && (
        <div className="sticky-note relative mx-auto mt-6 max-w-md rotate-[1deg] rounded-sm p-5 sm:p-6">
          <span className="tape absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2" aria-hidden="true" />
          <h3 className="font-hand text-center text-3xl text-diary-black">Price List ✧</h3>
          <ul className="mt-3 space-y-2">
            {pricing.map((line, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 border-b border-dashed border-diary-black/20 pb-1 text-sm sm:text-base">
                <span className="text-diary-black/80">{line.label}</span>
                <span className="font-hand text-lg text-diary-pink">{line.price}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
