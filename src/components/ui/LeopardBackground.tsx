// Reusable leopard-print texture, built as an original tiled SVG pattern
// (irregular blob spots, not a photo) so the notebook cover/pages get the
// black-on-cream leopard print from the reference without depending on any
// external image asset.
export function LeopardBackground({
  className = '',
  spotColor = '#171217',
  baseColor = '#f4ecd8',
  opacity = 1,
}: {
  className?: string;
  spotColor?: string;
  baseColor?: string;
  opacity?: number;
}) {
  const patternId = `leopard-${spotColor.replace('#', '')}-${baseColor.replace('#', '')}`;
  return (
    <svg className={className} style={{ opacity }} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id={patternId} width="120" height="110" patternUnits="userSpaceOnUse" patternTransform="rotate(6)">
          <rect width="120" height="110" fill={baseColor} />
          {[
            'M14,18 Q22,8 34,14 Q40,20 32,28 Q20,32 12,26 Q8,22 14,18 Z',
            'M64,10 Q74,4 82,12 Q84,20 74,22 Q62,20 60,14 Q60,10 64,10 Z',
            'M96,40 Q106,34 112,44 Q112,52 102,52 Q92,48 92,44 Q92,40 96,40 Z',
            'M20,60 Q30,52 40,60 Q42,68 32,70 Q18,68 16,62 Q16,60 20,60 Z',
            'M70,58 Q80,52 88,60 Q88,68 78,70 Q64,66 64,60 Q64,58 70,58 Z',
            'M4,86 Q14,80 22,88 Q22,96 12,96 Q0,92 0,88 Q0,86 4,86 Z',
            'M46,90 Q56,82 66,90 Q66,98 54,100 Q42,96 42,92 Q42,90 46,90 Z',
            'M94,86 Q104,80 114,88 Q114,96 102,98 Q90,94 90,90 Q90,86 94,86 Z',
          ].map((d, i) => (
            <path key={i} d={d} fill={spotColor} />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
