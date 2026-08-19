'use client';

import { motion } from 'framer-motion';
import { SparkleSticker } from './Stickers';

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.3" fill="white" />
    </svg>
  );
}

export function InstagramGlowButton({ handle, url }: { handle: string; url: string }) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className="animate-glow font-display relative inline-flex items-center gap-3 overflow-hidden rounded-full border-4 border-diary-black bg-gradient-to-r from-diary-pink via-[#ff3fae] to-diary-purple px-6 py-3 text-sm text-white shadow-lg sm:px-8 sm:py-4 sm:text-base"
    >
      <span className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          className="absolute top-0 h-full w-1/3 bg-white/40 blur-sm"
          style={{ animation: 'shimmerSweep 3.2s ease-in-out infinite' }}
        />
      </span>
      <InstagramIcon />
      <span className="relative">{handle}</span>
      <SparkleSticker className="absolute -right-1 -top-1 w-5 animate-sparkle" />
      <SparkleSticker className="absolute -bottom-1 left-4 w-4 animate-sparkle" style={{ animationDelay: '1s' }} />
    </motion.a>
  );
}
