'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FloatingPhoto } from '../ui/FloatingPhoto';
import { InstagramGlowButton } from '../ui/InstagramGlowButton';
import { StarSticker } from '../ui/Stickers';

type PortfolioImage = { id: string; image_url: string; alt_text: string };

// Shown until Viv's real photos are connected via Supabase (or if the
// portfolio table is ever genuinely empty) so the scrapbook layout is always
// visible rather than an error message where 8 pictures should be.
const FALLBACK_IMAGES: PortfolioImage[] = [
  { id: 'fallback-1', image_url: '/images/placeholder-1.svg', alt_text: 'Bee and honey French tip set' },
  { id: 'fallback-2', image_url: '/images/placeholder-2.svg', alt_text: 'Leopard cuff and hot pink chrome set' },
  { id: 'fallback-3', image_url: '/images/placeholder-3.svg', alt_text: 'Rainbow stripe and star Y2K set' },
  { id: 'fallback-4', image_url: '/images/placeholder-4.svg', alt_text: 'Cherry blossom French tips' },
  { id: 'fallback-5', image_url: '/images/placeholder-5.svg', alt_text: 'Black white and silver stiletto set' },
  { id: 'fallback-6', image_url: '/images/placeholder-6.svg', alt_text: 'Black and gold set with charm accents' },
  { id: 'fallback-7', image_url: '/images/placeholder-7.svg', alt_text: 'Old Tumblr dashboard aesthetic snapshot' },
  { id: 'fallback-8', image_url: '/images/placeholder-8.svg', alt_text: 'Old Instagram profile aesthetic snapshot' },
];

export function PortfolioPage({
  instagramHandle,
  instagramUrl,
}: {
  instagramHandle: string;
  instagramUrl: string;
}) {
  const [images, setImages] = useState<PortfolioImage[]>(FALLBACK_IMAGES);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(true);
  const [lightbox, setLightbox] = useState<PortfolioImage | null>(null);

  useEffect(() => {
    fetch('/api/portfolio', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.images) && data.images.length > 0) {
          setImages(data.images);
          setUsingFallback(false);
        }
      })
      .catch(() => {
        // network/parse failure - keep the fallback images already showing
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="scrollbar-thin flex h-full flex-col overflow-y-auto p-4 sm:p-8">
      <div className="mb-4 text-center">
        <p className="font-hand text-2xl text-diary-purple sm:text-3xl">More nail inspo on:</p>
        <div className="mt-2 flex justify-center">
          <InstagramGlowButton handle={instagramHandle} url={instagramUrl} />
        </div>
      </div>

      <div className="relative min-h-[520px] flex-1">
        {images.map((img, i) => (
          <FloatingPhoto key={img.id} src={img.image_url} alt={img.alt_text} index={i} onClick={() => setLightbox(img)} />
        ))}
        <StarSticker className="pointer-events-none absolute -right-2 top-2 w-8 opacity-70" color="#c86bff" />
        {!loading && usingFallback && (
          <p className="font-hand absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-diary-purple/50">
            (placeholder photos - real ones go in Admin → Portfolio)
          </p>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.img
              src={lightbox.image_url}
              alt={lightbox.alt_text}
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="max-h-[85vh] max-w-[90vw] rounded-lg border-4 border-white shadow-2xl"
            />
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close image"
              className="absolute right-6 top-6 rounded-full border-2 border-white bg-black/50 px-3 py-1 text-xl text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
