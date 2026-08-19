'use client';

import { motion } from 'framer-motion';
import { HeartSticker, SparkleSticker, StarSticker, ButterflySticker } from '../ui/Stickers';

export function SuccessPage({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center p-6 text-center">
      <SparkleSticker className="animate-sparkle pointer-events-none absolute left-8 top-8 w-8" />
      <SparkleSticker className="animate-sparkle pointer-events-none absolute right-10 top-16 w-6" style={{ animationDelay: '0.6s' }} />
      <StarSticker className="animate-float pointer-events-none absolute left-10 bottom-16 w-12" color="#c86bff" />
      <ButterflySticker className="animate-float pointer-events-none absolute right-6 bottom-10 w-16" />

      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.55 }}>
        <HeartSticker className="mx-auto w-24" color="#ff2d9c" />
      </motion.div>

      <h2 className="font-display mt-4 text-2xl text-diary-black sm:text-3xl">Submission Sent! 💗</h2>
      <p className="font-hand mt-3 max-w-xs text-xl text-diary-purple sm:max-w-sm sm:text-2xl">
        Your request has been added to Viv&apos;s diary. Keep an eye on your phone for your confirmation ✧
      </p>

      <button
        onClick={onRestart}
        className="font-display mt-8 rounded-full border-4 border-diary-black bg-diary-pink px-6 py-3 text-sm text-white shadow-sticker transition hover:scale-105 sm:text-base"
      >
        Back to the Beginning ♡
      </button>
    </div>
  );
}
