'use client';

import { motion } from 'framer-motion';
import { LeopardBackground } from '../ui/LeopardBackground';
import {
  StarSticker,
  HeartSticker,
  SparkleSticker,
  ButterflySticker,
  LipGlossSticker,
  SmileySticker,
  FlameHeartSticker,
  HoloPatchSticker,
} from '../ui/Stickers';

export function Cover({ onOpen, kennesawText }: { onOpen: () => void; kennesawText: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[18px] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.7)]">
      <LeopardBackground className="absolute inset-0 h-full w-full" spotColor="#171018" baseColor="#f3e9d8" />
      {/* pink wash to tie the leopard base into the brand palette without losing the black/white read */}
      <div className="absolute inset-0 bg-gradient-to-br from-diary-pink/10 via-transparent to-diary-purple/15" />

      {/* cloth spine binding down the left edge - the single most
          recognizable "this is a composition notebook" cue, wrapping the
          marbled/leopard cover paper the way a real one does */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-[7%] min-w-[22px]"
        style={{
          background:
            'repeating-linear-gradient(90deg, #100d12 0px, #100d12 3px, #201a24 3px, #201a24 6px)',
          boxShadow: 'inset -6px 0 10px -4px rgba(0,0,0,0.6), 3px 0 8px -2px rgba(0,0,0,0.5)',
        }}
        aria-hidden="true"
      />

      {/* stacked page edges peeking out along the right side */}
      <div
        className="absolute inset-y-[3%] right-0 z-10 w-[1.6%] min-w-[6px] bg-gradient-to-r from-transparent to-[#efe6d4]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(20,16,20,0.12) 0px, rgba(20,16,20,0.12) 1px, transparent 1px, transparent 5px)',
          backgroundColor: '#efe6d4',
        }}
        aria-hidden="true"
      />

      {/* scattered sticker collage - kept clear of the center label */}
      <StarSticker
        className="animate-float absolute left-[10%] top-[8%] w-14 drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)] sm:w-20"
        style={{ ['--float-rot' as string]: '-14deg', transform: 'rotate(-14deg)' }}
        color="#fff2f9"
      />
      <HoloPatchSticker className="absolute right-[4%] top-[6%] w-32 -rotate-6 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] sm:w-44" />
      <HeartSticker
        className="animate-float absolute left-[9%] top-[42%] w-16 -rotate-12 drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)] sm:w-24"
        color="#ff2d9c"
      />
      <ButterflySticker className="absolute right-[8%] top-[36%] w-20 rotate-6 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] sm:w-28" />
      <SmileySticker className="absolute left-[11%] bottom-[20%] w-12 rotate-6 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] sm:w-16" />
      <LipGlossSticker className="absolute right-[6%] bottom-[24%] w-20 -rotate-3 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] sm:w-28" />
      <FlameHeartSticker className="absolute left-[13%] bottom-[6%] w-14 rotate-6 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] sm:w-20" />
      <StarSticker
        className="absolute right-[14%] bottom-[10%] w-10 rotate-12 sm:w-14"
        color="#c86bff"
      />
      <SparkleSticker className="animate-sparkle absolute left-[24%] top-[16%] w-6 sm:w-8" />
      <SparkleSticker className="animate-sparkle absolute right-[24%] top-[52%] w-5 sm:w-7" style={{ animationDelay: '0.8s' }} />
      <SparkleSticker className="animate-sparkle absolute left-[19%] bottom-[34%] w-6 sm:w-8" style={{ animationDelay: '1.4s' }} />

      {/* the composition-book label block */}
      <div className="absolute left-1/2 top-1/2 w-[78%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-diary-black bg-[#fdf8ef] px-6 py-7 text-center shadow-[0_10px_22px_rgba(0,0,0,0.35)] sm:px-10 sm:py-9">
        <div className="font-body text-[0.65rem] font-bold uppercase tracking-[0.3em] text-diary-purple/70 sm:text-xs">
          Nail Diary Co.
        </div>
        <h1 className="font-display mt-3 text-3xl leading-tight text-diary-black sm:text-5xl">
          Viv&apos;s
          <br />
          Nail Diary
        </h1>
        <div className="mx-auto mt-4 h-px w-4/5 bg-diary-black/70" />
        <div className="mx-auto mt-2 h-px w-4/5 bg-diary-black/70" />
        <p className="font-hand mt-4 text-xl text-diary-pink sm:text-2xl">{kennesawText} ✧</p>
      </div>

      {/* OPEN button - styled as part of the notebook, not a generic web button */}
      <motion.button
        onClick={onOpen}
        whileHover={{ scale: 1.06, rotate: -2 }}
        whileTap={{ scale: 0.95 }}
        className="animate-glow font-display absolute bottom-[9%] left-1/2 -translate-x-1/2 rounded-full border-4 border-diary-black bg-diary-pink px-10 py-4 text-lg tracking-wider text-white sm:text-2xl"
        aria-label="Open Viv's Nail Diary"
      >
        OPEN
      </motion.button>
    </div>
  );
}
