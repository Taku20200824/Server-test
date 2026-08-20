import { ImageResponse } from "next/og";
import { siteConfig } from "@/data/site";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #06110f 0%, #123528 55%, #0b1218 100%)",
          color: "white",
          padding: 72
        }}
      >
        <div style={{ fontSize: 26, color: "#2dd4bf", fontWeight: 700 }}>English-speaking Asia community</div>
        <div style={{ fontSize: 96, fontWeight: 900, marginTop: 24 }}>{siteConfig.name}</div>
        <div style={{ fontSize: 34, marginTop: 24, maxWidth: 900 }}>{siteConfig.description}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
