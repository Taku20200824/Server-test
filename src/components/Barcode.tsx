"use client";

/**
 * 依存ライブラリなしで Code 39 バーコードを SVG 描画する。
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
  if (!digits) return null;

  const wide = narrow * 3;
  const gap = narrow; // 文字間の細スペース
  const chars = `*${digits}*`.split("");

  const bars: { x: number; w: number }[] = [];
  let x = 0;

  for (let c = 0; c < chars.length; c++) {
    const pattern = CODE39[chars[c]];
    if (!pattern) continue;
    for (let i = 0; i < pattern.length; i++) {
      const w = pattern[i] === "w" ? wide : narrow;
      // 偶数インデックスはバー（黒）、奇数はスペース（白）
      if (i % 2 === 0) bars.push({ x, w });
      x += w;
    }
    x += gap; // 文字間ギャップ
  }

  const totalWidth = x - gap;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${totalWidth} ${height}`}
      width={totalWidth}
      height={height}
      role="img"
      aria-label={digits}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x={0} y={0} width={totalWidth} height={height} fill="#ffffff" />
      {bars.map((bar, index) => (
        <rect key={index} x={bar.x} y={0} width={bar.w} height={height} fill="#111111" />
      ))}
    </svg>
  );
}
