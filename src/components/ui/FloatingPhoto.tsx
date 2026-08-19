'use client';

import { motion } from 'framer-motion';

// Preset placement "recipes" the 8 portfolio photos cycle through, so the
// scrapbook layout is intentionally varied (size/rotation/position) rather
// than a grid, but stable across renders instead of re-randomizing.
const LAYOUTS = [
  { top: '2%', left: '4%', w: '46%', rot: -7, z: 3, frame: 'polaroid' as const },
  { top: '0%', left: '46%', w: '50%', rot: 5, z: 2, frame: 'torn' as const },
  { top: '30%', left: '2%', w: '40%', rot: 4, z: 4, frame: 'torn' as const },
  { top: '26%', left: '54%', w: '42%', rot: -5, z: 1, frame: 'polaroid' as const },
  { top: '55%', left: '20%', w: '38%', rot: -8, z: 5, frame: 'polaroid' as const },
  { top: '58%', left: '58%', w: '38%', rot: 6, z: 2, frame: 'torn' as const },
  { top: '80%', left: '3%', w: '32%', rot: 5, z: 1, frame: 'torn' as const },
  { top: '80%', left: '62%', w: '32%', rot: -4, z: 3, frame: 'polaroid' as const },
];

export function FloatingPhoto({
  src,
  alt,
  index,
  onClick,
}: {
  src: string;
  alt: string;
  index: number;
  onClick?: () => void;
}) {
  const layout = LAYOUTS[index % LAYOUTS.length];
  const delay = (index % LAYOUTS.length) * 0.35;

  const frameClasses =
    layout.frame === 'polaroid'
      ? 'bg-white p-2 pb-6 rounded-[2px]'
      : 'bg-white p-1.5 [clip-path:polygon(0%_2%,3%_0%,97%_1%,100%_4%,99%_97%,96%_100%,2%_99%,1%_95%)]';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="torn-edge animate-float absolute cursor-pointer text-left"
      style={{
        top: layout.top,
        left: layout.left,
        width: layout.w,
        zIndex: layout.z,
        transform: `rotate(${layout.rot}deg)`,
        ['--float-rot' as string]: `${layout.rot}deg`,
        animationDelay: `${delay}s`,
      }}
      whileHover={{ scale: 1.08, rotate: 0, zIndex: 20 }}
      whileFocus={{ scale: 1.08, rotate: 0, zIndex: 20 }}
      whileTap={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      aria-label={`View nail photo: ${alt}`}
    >
      <span className={`block shadow-sticker ${frameClasses}`}>
        <img src={src} alt={alt} className="aspect-square w-full rounded-[1px] object-cover" loading="lazy" />
      </span>
      {/* small tape strip pinning the photo down */}
      <span
        className="tape absolute -top-2 left-1/2 h-5 w-12 -translate-x-1/2 -rotate-3"
        aria-hidden="true"
      />
    </motion.button>
  );
}
