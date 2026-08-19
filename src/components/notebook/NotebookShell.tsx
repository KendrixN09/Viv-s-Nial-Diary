'use client';

import { motion } from 'framer-motion';
import { Cover } from './Cover';
import { usePrefersReducedMotion } from '@/lib/useIsMobile';

export function NotebookShell({
  isOpen,
  onOpen,
  kennesawText,
  pageKey,
  direction,
  leftPage,
  rightPage,
  onNext,
  onBack,
  onClose,
  canNext,
  canBack,
  isMobile,
}: {
  isOpen: boolean;
  onOpen: () => void;
  kennesawText: string;
  pageKey: string;
  direction: 1 | -1;
  leftPage: React.ReactNode;
  rightPage: React.ReactNode | null;
  onNext?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  canNext: boolean;
  canBack: boolean;
  isMobile: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();

  // Sized off both viewport width AND height (not just a fixed max-width) so
  // the notebook genuinely fills the screen on tall monitors as well as wide
  // ones, rather than being capped by whichever dimension runs out first.
  const bookAspect = isMobile ? 3 / 4 : 4 / 3;

  return (
    <div
      className="relative mx-auto"
      style={{
        perspective: reducedMotion ? undefined : 2400,
        width: isMobile ? 'min(96vw, calc(88vh * 0.75))' : 'min(96vw, calc(90vh * 1.3333))',
        maxWidth: isMobile ? '520px' : '1700px',
      }}
    >
      <div className="relative w-full overflow-visible" style={{ aspectRatio: bookAspect }}>
        {/* the open notebook body - always mounted underneath so its content
            is ready the instant the cover swings away */}
        <div className="absolute inset-0 flex overflow-hidden rounded-[18px] border-4 border-diary-black bg-[#efe6d4] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.7)]">
          <div className="notebook-paper relative flex-1 overflow-hidden">
            {/* Plain key-based remount rather than AnimatePresence: React
                swaps the old page out and mounts the new one immediately and
                reliably (no dependency on Framer Motion detecting an exit
                animation's completion, which proved unreliable nested inside
                this preserve-3d/perspective context - the old page would
                linger in the DOM instead of being removed). The new page
                still animates in via initial->animate. */}
            <motion.div
              key={`${pageKey}-left`}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: direction * 70, x: direction * 60 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.5, ease: [0.4, 0.1, 0.2, 1] }}
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'right center' }}
              className="h-full w-full"
            >
              {leftPage}
            </motion.div>
            {canBack && onBack && (
              <button
                onClick={onBack}
                aria-label="Previous page"
                className="font-hand absolute left-3 top-3 z-20 -rotate-3 rounded-md border-2 border-diary-black bg-white px-3 py-1 text-lg text-diary-black shadow-sticker transition hover:-rotate-1 hover:bg-diary-hotpink/20 sm:left-5 sm:top-5 sm:text-xl"
              >
                ← back
              </button>
            )}
          </div>

          {!isMobile && (
            <>
              <div className="w-3 shrink-0 bg-gradient-to-r from-black/25 via-black/5 to-black/25" />
              <div className="notebook-paper relative flex-1 overflow-hidden">
                <motion.div
                  key={`${pageKey}-right`}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: direction * -70, x: direction * -60 }}
                  animate={{ opacity: 1, rotateY: 0, x: 0 }}
                  transition={{ duration: reducedMotion ? 0.15 : 0.5, ease: [0.4, 0.1, 0.2, 1] }}
                  style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center' }}
                  className="h-full w-full"
                >
                  {rightPage}
                </motion.div>
                {canNext && onNext && (
                  <button
                    onClick={onNext}
                    aria-label="Next page"
                    className="font-hand absolute right-3 top-3 z-20 rotate-3 rounded-md border-2 border-diary-black bg-white px-3 py-1 text-lg text-diary-black shadow-sticker transition hover:rotate-1 hover:bg-diary-hotpink/20 sm:right-5 sm:top-5 sm:text-xl"
                  >
                    next →
                  </button>
                )}
              </div>
            </>
          )}

          {isMobile && canNext && onNext && (
            <button
              onClick={onNext}
              aria-label="Next page"
              className="font-hand absolute right-3 top-3 z-20 rotate-3 rounded-md border-2 border-diary-black bg-white px-3 py-1 text-lg text-diary-black shadow-sticker transition hover:rotate-1 hover:bg-diary-hotpink/20"
            >
              next →
            </button>
          )}
        </div>

        {/* Close Book - a hanging heart-charm bookmark tab, present on every
            open spread (not the cover itself). Animates the whole notebook
            shut via the same cover-rotation mechanism OPEN uses in reverse,
            rather than an instant redirect. */}
        {isOpen && onClose && (
          <motion.button
            onClick={onClose}
            aria-label="Close notebook"
            initial={{ y: -6 }}
            animate={{ y: [-6, 2, -6] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="font-hand absolute -bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border-2 border-diary-black bg-diary-hotpink px-4 py-1.5 text-base text-white shadow-sticker sm:text-lg"
          >
            Close Book ♡
          </motion.button>
        )}

        {/* the closed cover - swings open/closed on the left edge. Stays
            mounted permanently (never unmounted) so "Back to the Beginning"
            can animate it shut again; backface-visibility hides it once it's
            rotated past 90deg, and pointer-events is dropped so it can't
            eat clicks meant for the pages underneath while open. */}
        <motion.div
          className="absolute inset-0 z-30"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: isOpen ? 'none' : 'auto',
          }}
          animate={{ rotateY: isOpen ? -180 : 0 }}
          transition={{ duration: reducedMotion ? 0.2 : 1.1, ease: [0.34, 1.15, 0.64, 1] }}
        >
          <Cover onOpen={onOpen} kennesawText={kennesawText} />
        </motion.div>
      </div>
    </div>
  );
}
