// Original, simple Y2K-flavored sticker SVGs. Deliberately generic
// (stars/hearts/sparkles/butterfly/lip mark/flame-heart/smiley/holo patch)
// rather than reproducing the licensed characters from the reference images
// (Hello Kitty, Bratz, Betty Boop, BTS) - same visual energy, original art.

type StickerProps = { className?: string; style?: React.CSSProperties };

export function StarSticker({ className, style, color = '#ff2d9c' }: StickerProps & { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <path
        d="M50 4 L61 36 L96 36 L67 57 L78 92 L50 71 L22 92 L33 57 L4 36 L39 36 Z"
        fill={color}
        stroke="#1a1420"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartSticker({ className, style, color = '#ff5cb8' }: StickerProps & { color?: string }) {
  return (
    <svg viewBox="0 0 100 90" className={className} style={style} aria-hidden="true">
      <path
        d="M50 84 C10 58 2 34 18 18 C30 6 46 10 50 26 C54 10 70 6 82 18 C98 34 90 58 50 84 Z"
        fill={color}
        stroke="#1a1420"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleSticker({ className, style, color = '#fff2f9' }: StickerProps & { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <path
        d="M50 0 C52 30 54 46 100 50 C54 54 52 70 50 100 C48 70 46 54 0 50 C46 46 48 30 50 0 Z"
        fill={color}
      />
    </svg>
  );
}

export function ButterflySticker({ className, style }: StickerProps) {
  return (
    <svg viewBox="0 0 100 80" className={className} style={style} aria-hidden="true">
      <path d="M48 40 C30 4 -4 8 6 34 C12 50 34 46 48 40 Z" fill="#c86bff" stroke="#1a1420" strokeWidth="2.5" />
      <path d="M52 40 C70 4 104 8 94 34 C88 50 66 46 52 40 Z" fill="#ff8fd6" stroke="#1a1420" strokeWidth="2.5" />
      <path d="M48 42 C32 66 2 68 8 52 C14 40 34 40 48 42 Z" fill="#ff8fd6" stroke="#1a1420" strokeWidth="2.5" />
      <path d="M52 42 C68 66 98 68 92 52 C86 40 66 40 52 42 Z" fill="#c86bff" stroke="#1a1420" strokeWidth="2.5" />
      <rect x="47" y="30" width="6" height="30" rx="3" fill="#1a1420" />
    </svg>
  );
}

export function LipGlossSticker({ className, style }: StickerProps) {
  return (
    <svg viewBox="0 0 100 60" className={className} style={style} aria-hidden="true">
      <path
        d="M50 10 C20 10 10 22 10 34 C10 48 28 52 50 52 C72 52 90 48 90 34 C90 22 80 10 50 10 Z"
        fill="#ff1f7a"
        stroke="#1a1420"
        strokeWidth="3"
      />
      <path d="M50 10 C40 10 34 16 34 22 C34 28 42 28 50 28 C58 28 66 28 66 22 C66 16 60 10 50 10 Z" fill="#ff6bab" />
    </svg>
  );
}

export function SmileySticker({ className, style }: StickerProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#ff2d9c" stroke="#1a1420" strokeWidth="3" />
      <circle cx="34" cy="42" r="6" fill="#1a1420" />
      <circle cx="66" cy="42" r="6" fill="#1a1420" />
      <path d="M28 60 Q50 82 72 60" stroke="#1a1420" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function FlameHeartSticker({ className, style }: StickerProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <path
        d="M50 8 C40 24 28 30 28 46 C28 60 38 68 50 68 C62 68 72 60 72 46 C72 30 60 24 50 8 Z"
        fill="#ff6b3d"
        stroke="#1a1420"
        strokeWidth="3"
      />
      <path
        d="M50 40 C6 66 20 96 50 92 C80 96 94 66 50 40 Z"
        fill="#ff2d9c"
        stroke="#1a1420"
        strokeWidth="3"
      />
    </svg>
  );
}

export function HoloPatchSticker({ className, style, label = '90% ANGEL' }: StickerProps & { label?: string }) {
  return (
    <svg viewBox="0 0 160 90" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c9f7ff" />
          <stop offset="30%" stopColor="#ffd6f7" />
          <stop offset="60%" stopColor="#d9c9ff" />
          <stop offset="100%" stopColor="#c9f7ff" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="45" rx="76" ry="40" fill="url(#holo)" stroke="#8b2fc9" strokeWidth="3" />
      <text
        x="80"
        y="52"
        textAnchor="middle"
        fontFamily="var(--font-hand)"
        fontSize="26"
        fill="#8b2fc9"
        transform="rotate(-6 80 45)"
      >
        {label}
      </text>
    </svg>
  );
}

export function RhinestoneDot({ className, style, color = '#fff2f9' }: StickerProps & { color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill={color} stroke="#c9c9c9" strokeWidth="1.5" />
      <path d="M20 4 L23 17 L36 20 L23 23 L20 36 L17 23 L4 20 L17 17 Z" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}
