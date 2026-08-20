"use client";

import { ExternalLink, MapPinned } from "lucide-react";
import { IsleMap } from "@/components/isle-map";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

const sourceMapUrl = "https://theisle.pixelbuilt.org/";

const labels = {
  en: {
    eyebrow: "Map",
    title: "Gateway interactive map",
    description: "Use the Evrima Gateway map with local filters, points, zoom, and route markers.",
    source: "Source map"
  },
  mn: {
    eyebrow: "Газрын зураг",
    title: "Gateway интерактив газрын зураг",
    description: "Evrima Gateway map-ийг filter, marker, zoom, route тэмдэглэгээтэйгээр эндээс ашиглана.",
    source: "Эх map"
  },
  ja: {
    eyebrow: "マップ",
    title: "Gateway インタラクティブマップ",
    description: "Evrima Gateway マップをフィルター、マーカー、ズーム、ルート表示付きで確認できます。",
    source: "元マップ"
  },
  ko: {
    eyebrow: "지도",
    title: "Gateway 인터랙티브 지도",
    description: "Evrima Gateway 지도를 필터, 마커, 줌, 루트 표시와 함께 사용할 수 있습니다.",
    source: "원본 지도"
  }
};

export function MapPageContent() {
  const { locale } = useLanguage();
  const text = labels[locale];

  return (
    <main className="container min-h-screen pt-28 pb-16 sm:pt-32">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow={text.eyebrow}
          title={text.title}
          description={text.description}
        />
        <Button asChild variant="outline" className="mb-10 shrink-0">
          <a href={sourceMapUrl} target="_blank" rel="noopener noreferrer">
            <MapPinned className="h-4 w-4" />
            {text.source}
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <IsleMap />
    </main>
  );
}
