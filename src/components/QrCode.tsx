"use client";

import QRCode from "qrcode";

/** qrcode ライブラリでモジュール行列を作り、SVG として同期描画する（横方向は連結して軽量化）。 */
export function QrCode({
  value,
  size = 60,
  className = "qr-svg"
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const text = (value ?? "").trim();
  if (!text) return null;

  let count = 0;
  let data: Uint8Array | number[] = [];
  try {
    const modules = QRCode.create(text, { errorCorrectionLevel: "M" }).modules;
    count = modules.size;
    data = modules.data;
  } catch {
    return null;
  }

  const rects: { x: number; y: number; w: number }[] = [];
  for (let r = 0; r < count; r++) {
    let c = 0;
    while (c < count) {
      if (data[r * count + c]) {
        let w = 1;
        while (c + w < count && data[r * count + c + w]) w++;
        rects.push({ x: c, y: r, w });
        c += w;
      } else {
        c++;
      }
    }
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${count} ${count}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={text}
    >
      <rect x={0} y={0} width={count} height={count} fill="#ffffff" />
      <g fill="#111111">
        {rects.map((rect, index) => (
          <rect key={index} x={rect.x} y={rect.y} width={rect.w} height={1} />
        ))}
      </g>
    </svg>
  );
}
