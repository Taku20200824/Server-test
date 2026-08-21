"use client";

/**
 * 依存ライブラリなしで Code 39 バーコードを描く。
 * 数字（0-9）に対応。スキャナで読めるよう白地・黒バーで描く。
 */

const CODE39: Record<string, string> = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  "*": "nnwnwwnwn"
};

/** Code 39 のバー（黒帯）の位置と幅を計算する。 */
export function code39Bars(value: string, narrow = 1.5): { bars: { x: number; w: number }[]; width: number } {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return { bars: [], width: 0 };

  const wide = narrow * 3;
  const gap = narrow;
  const chars = `*${digits}*`.split("");
  const bars: { x: number; w: number }[] = [];
  let x = 0;

  for (const char of chars) {
    const pattern = CODE39[char];
    if (!pattern) continue;
    for (let i = 0; i < pattern.length; i++) {
      const w = pattern[i] === "w" ? wide : narrow;
      if (i % 2 === 0) bars.push({ x, w });
      x += w;
    }
    x += gap;
  }

  return { bars, width: x - gap };
}

/** 印刷用などに使う Code 39 の SVG 文字列を返す。 */
export function code39SvgString(value: string, height = 60, narrow = 2): string {
  const { bars, width } = code39Bars(value, narrow);
  if (!width) return "";
  const rects = bars.map((bar) => `<rect x="${bar.x}" y="0" width="${bar.w}" height="${height}"/>`).join("");
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/><g fill="#111111">${rects}</g></svg>`;
}

export function Barcode({
  value,
  height = 34,
  narrow = 1.5,
  className = "barcode-svg"
}: {
  value: string;
  height?: number;
  narrow?: number;
  className?: string;
}) {
  const digits = value.replace(/[^0-9]/g, "");
  const { bars, width } = code39Bars(value, narrow);
  if (!width) return null;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={digits}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x={0} y={0} width={width} height={height} fill="#ffffff" />
      {bars.map((bar, index) => (
        <rect key={index} x={bar.x} y={0} width={bar.w} height={height} fill="#111111" />
      ))}
    </svg>
  );
}
