"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import {
  Beef,
  Crosshair,
  Droplets,
  Fish,
  Info,
  Leaf,
  MapPin,
  Mountain,
  PawPrint,
  RotateCcw,
  Route,
  Shield,
  Trees,
  ZoomIn,
  ZoomOut,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

type MarkerType = "water" | "animal" | "zone" | "sanctuary" | "migration" | "spawn" | "food" | "resource";
type LocaleText = Record<"en" | "mn" | "ja" | "ko", string>;

export type IsleMapMarker = {
  id: string;
  type: string;
  name?: string;
  x: number;
  y: number;
  risk?: string;
  note?: string;
};

type LocalMarker = {
  id: string;
  type: MarkerType;
  icon?: LucideIcon;
  x: number;
  y: number;
  risk: LocaleText;
  name: LocaleText;
  note: LocaleText;
};

const gatewayMapImageUrl = "https://theisle.pixelbuilt.org/assets/gateway-map.webp";

const labels = {
  en: {
    filters: { water: "Water", animal: "Animals", zone: "Zones", sanctuary: "Sanctuary", migration: "Migration", spawn: "Spawn", food: "Food", resource: "Resources" },
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    reset: "Reset",
    selectedIntel: "Selected information",
    risk: "Risk",
    visibleMarkers: "Visible markers",
    activeFilters: "Active filters",
    version: "Map version",
    versionValue: "Gateway basemap",
    source: "Basemap from The Isle Map by Pixelbuilt. Marker data is a local community overlay.",
    operations: "Gateway field map",
    subtitle: "Drag to move. Use zoom and filters to plan routes.",
    coords: "Map coords",
    hint: "Click a marker to see route, water, food, animal, or zone information."
  },
  mn: {
    filters: { water: "Ус", animal: "Амьтан", zone: "Zone", sanctuary: "Sanctuary", migration: "Migration", spawn: "Spawn", food: "Food", resource: "Resource" },
    zoomOut: "Жижигрүүлэх",
    zoomIn: "Томруулах",
    reset: "Reset",
    selectedIntel: "Сонгосон мэдээлэл",
    risk: "Эрсдэл",
    visibleMarkers: "Харагдах marker",
    activeFilters: "Идэвхтэй filter",
    version: "Map хувилбар",
    versionValue: "Gateway basemap",
    source: "Basemap нь Pixelbuilt-ийн The Isle Map-аас. Marker мэдээлэл нь манай community overlay.",
    operations: "Gateway field map",
    subtitle: "Mouse-аар чирж хөдөлгөнө. Zoom болон filter ашиглаад route төлөвлөнө.",
    coords: "Map координат",
    hint: "Marker дээр дарахад route, ус, food, амьтан, zone мэдээлэл гарна."
  },
  ja: {
    filters: { water: "水", animal: "動物", zone: "ゾーン", sanctuary: "Sanctuary", migration: "Migration", spawn: "Spawn", food: "Food", resource: "Resource" },
    zoomOut: "縮小",
    zoomIn: "拡大",
    reset: "リセット",
    selectedIntel: "選択中の情報",
    risk: "危険度",
    visibleMarkers: "表示マーカー",
    activeFilters: "有効フィルター",
    version: "マップ版",
    versionValue: "Gateway basemap",
    source: "Basemap は Pixelbuilt の The Isle Map を使用。Marker 情報はローカル community overlay です。",
    operations: "Gateway フィールドマップ",
    subtitle: "ドラッグで移動。ズームとフィルターでルート確認できます。",
    coords: "マップ座標",
    hint: "マーカーを押すと route、水、food、動物、zone 情報が表示されます。"
  },
  ko: {
    filters: { water: "물", animal: "동물", zone: "Zone", sanctuary: "Sanctuary", migration: "Migration", spawn: "Spawn", food: "Food", resource: "Resource" },
    zoomOut: "축소",
    zoomIn: "확대",
    reset: "초기화",
    selectedIntel: "선택 정보",
    risk: "위험도",
    visibleMarkers: "표시 마커",
    activeFilters: "활성 필터",
    version: "지도 버전",
    versionValue: "Gateway basemap",
    source: "Basemap은 Pixelbuilt의 The Isle Map을 사용합니다. Marker 정보는 로컬 community overlay입니다.",
    operations: "Gateway 필드 지도",
    subtitle: "드래그로 이동. 줌과 필터로 루트를 확인하세요.",
    coords: "지도 좌표",
    hint: "마커를 누르면 route, 물, food, 동물, zone 정보가 표시됩니다."
  }
};

const markerMeta: Record<MarkerType, { icon: LucideIcon; color: string; ring: string; pulse: string }> = {
  water: { icon: Droplets, color: "bg-cyan-300 text-cyan-950", ring: "ring-cyan-300/45", pulse: "bg-cyan-300/20" },
  animal: { icon: PawPrint, color: "bg-orange-300 text-orange-950", ring: "ring-orange-300/45", pulse: "bg-orange-300/20" },
  zone: { icon: Mountain, color: "bg-violet-300 text-violet-950", ring: "ring-violet-300/45", pulse: "bg-violet-300/20" },
  sanctuary: { icon: Shield, color: "bg-emerald-300 text-emerald-950", ring: "ring-emerald-300/45", pulse: "bg-emerald-300/20" },
  migration: { icon: Route, color: "bg-amber-300 text-amber-950", ring: "ring-amber-300/45", pulse: "bg-amber-300/20" },
  spawn: { icon: Crosshair, color: "bg-sky-300 text-sky-950", ring: "ring-sky-300/45", pulse: "bg-sky-300/20" },
  food: { icon: Beef, color: "bg-rose-300 text-rose-950", ring: "ring-rose-300/45", pulse: "bg-rose-300/20" },
  resource: { icon: Leaf, color: "bg-lime-300 text-lime-950", ring: "ring-lime-300/45", pulse: "bg-lime-300/20" }
};

const mapMarkers: LocalMarker[] = [
  {
    id: "north-lake",
    type: "water",
    x: 63,
    y: 18,
    risk: { en: "Medium", mn: "Дунд", ja: "中", ko: "보통" },
    name: { en: "North Lake", mn: "North Lake ус", ja: "North Lake 水場", ko: "North Lake 물" },
    note: {
      en: "Open water with long sight lines. Use the trees before drinking.",
      mn: "Ил задгай ус. Уухаасаа өмнө мод, cover ашиглавал аюул багатай.",
      ja: "見通しの良い水場です。飲む前に木陰を使うと安全です。",
      ko: "시야가 긴 물가입니다. 물을 마시기 전 나무 엄폐를 이용하세요."
    }
  },
  {
    id: "water-access",
    type: "water",
    x: 42,
    y: 48,
    risk: { en: "High", mn: "Өндөр", ja: "高", ko: "높음" },
    name: { en: "Water Access", mn: "Water Access", ja: "Water Access", ko: "Water Access" },
    note: {
      en: "Busy drinking route. Good for groups, dangerous for solo players.",
      mn: "Их хүн явдаг уух route. Багаараа бол ашигтай, ганцаараа бол эрсдэлтэй.",
      ja: "通行量が多い水場ルート。集団向けで、ソロは危険です。",
      ko: "이동이 많은 물 루트입니다. 그룹은 좋지만 솔로는 위험합니다."
    }
  },
  {
    id: "swamps",
    type: "zone",
    icon: Trees,
    x: 53,
    y: 73,
    risk: { en: "Medium", mn: "Дунд", ja: "中", ko: "보통" },
    name: { en: "Swamps Center Zone", mn: "Swamps Center zone", ja: "Swamps Center ゾーン", ko: "Swamps Center Zone" },
    note: {
      en: "Dense cover and messy paths. Good escape area, but easy to get turned around.",
      mn: "Cover ихтэй, зам нь будлиантай. Зугтахад сайн ч төөрөхөд амархан.",
      ja: "遮蔽物が多く道が複雑。逃げやすいですが迷いやすいです。",
      ko: "엄폐가 많고 길이 복잡합니다. 도망치기 좋지만 길을 잃기 쉽습니다."
    }
  },
  {
    id: "north-sanctuary",
    type: "sanctuary",
    x: 65,
    y: 28,
    risk: { en: "Low", mn: "Бага", ja: "低", ko: "낮음" },
    name: { en: "Northern Sanctuary", mn: "Хойд sanctuary", ja: "北 Sanctuary", ko: "북쪽 Sanctuary" },
    note: {
      en: "Safer early growth area with several exits toward water and jungle.",
      mn: "Өсөлтийн эхэнд аюул багатай. Ус болон jungle руу гарах хэд хэдэн гарцтай.",
      ja: "序盤成長向けの比較的安全な場所。水場とジャングルへの出口があります。",
      ko: "초반 성장에 비교적 안전합니다. 물과 정글로 나가는 길이 있습니다."
    }
  },
  {
    id: "central-migration",
    type: "migration",
    x: 53,
    y: 54,
    risk: { en: "High", mn: "Өндөр", ja: "高", ko: "높음" },
    name: { en: "Central Migration", mn: "Төв migration route", ja: "中央 Migration", ko: "중앙 Migration" },
    note: {
      en: "Main travel lane. Expect patrols, hunters, and frequent encounters.",
      mn: "Гол явах route. Patrol, анчид, олон тааралдах магадлалтай.",
      ja: "主要移動ルート。巡回、ハンター、遭遇が多いです。",
      ko: "주요 이동로입니다. 순찰, 사냥꾼, 조우가 많습니다."
    }
  },
  {
    id: "west-migration",
    type: "migration",
    x: 30,
    y: 56,
    risk: { en: "Medium", mn: "Дунд", ja: "中", ko: "보통" },
    name: { en: "West Rail Route", mn: "West Rail route", ja: "West Rail ルート", ko: "West Rail 루트" },
    note: {
      en: "Long route toward west rail and food paths. Move carefully through open ground.",
      mn: "West rail болон food path руу явдаг урт route. Задгай хэсгээр болгоомжтой яв.",
      ja: "West Rail と食料ルートへ向かう長い道。開けた場所は注意。",
      ko: "West Rail과 먹이 경로로 가는 긴 루트입니다. 개활지는 조심하세요."
    }
  },
  {
    id: "north-spawn",
    type: "spawn",
    x: 35,
    y: 31,
    risk: { en: "Medium", mn: "Дунд", ja: "中", ko: "보통" },
    name: { en: "Northwest Ridge Spawn", mn: "Northwest Ridge spawn", ja: "Northwest Ridge Spawn", ko: "Northwest Ridge Spawn" },
    note: {
      en: "Fast start toward ridge cover. Water access needs a planned route.",
      mn: "Ridge cover руу хурдан эхэлнэ. Ус руу route-ээ урьдчилж бодсон нь дээр.",
      ja: "尾根の遮蔽へ早く移動できます。水場ルートは計画が必要です。",
      ko: "능선 엄폐로 빠르게 시작합니다. 물까지는 루트 계획이 필요합니다."
    }
  },
  {
    id: "south-spawn",
    type: "spawn",
    x: 47,
    y: 82,
    risk: { en: "Low", mn: "Бага", ja: "低", ko: "낮음" },
    name: { en: "South Plains Spawn", mn: "South Plains spawn", ja: "South Plains Spawn", ko: "South Plains Spawn" },
    note: {
      en: "Good starter route toward cover, food, and southern water.",
      mn: "Cover, food, өмнөд ус руу явахад эхлэгчдэд тохиромжтой.",
      ja: "遮蔽、食料、南側の水場へ向かいやすい開始地点です。",
      ko: "엄폐, 먹이, 남쪽 물가로 가기 좋은 시작 지점입니다."
    }
  },
  {
    id: "highland-food",
    type: "food",
    icon: Fish,
    x: 55,
    y: 36,
    risk: { en: "High", mn: "Өндөр", ja: "高", ko: "높음" },
    name: { en: "Highland Food", mn: "Highland food", ja: "Highland Food", ko: "Highland Food" },
    note: {
      en: "Reliable food near common movement routes. Check the ridge before feeding.",
      mn: "Их явдаг route-ийн ойролцоох food. Идэхээсээ өмнө ridge шалга.",
      ja: "よく使われるルート近くの食料。食べる前に尾根を確認。",
      ko: "이동 루트 근처의 안정적인 먹이입니다. 먹기 전에 능선을 확인하세요."
    }
  },
  {
    id: "jungle-food",
    type: "food",
    x: 49,
    y: 61,
    risk: { en: "Medium", mn: "Дунд", ja: "中", ko: "보통" },
    name: { en: "Jungle Food", mn: "Jungle food", ja: "Jungle Food", ko: "Jungle Food" },
    note: {
      en: "Good food route if you avoid central crossings and stay under cover.",
      mn: "Central crossing-оос зайлсхийж cover дотор явбал сайн food route.",
      ja: "中央の交差を避け、遮蔽内を進めば良い食料ルートです。",
      ko: "중앙 교차로를 피하고 엄폐를 유지하면 좋은 먹이 루트입니다."
    }
  },
  {
    id: "boar-zone",
    type: "animal",
    icon: PawPrint,
    x: 46,
    y: 66,
    risk: { en: "Medium", mn: "Дунд", ja: "中", ko: "보통" },
    name: { en: "Small AI Trail", mn: "Жижиг AI амьтдын trail", ja: "小型AI Trail", ko: "소형 AI Trail" },
    note: {
      en: "Useful for early carnivore food checks. Listen before crossing open clearings.",
      mn: "Эхний carnivore food шалгахад хэрэгтэй. Задгай газар гарахаас өмнө сайн чагна.",
      ja: "序盤の肉食向け食料確認に便利。開けた場所に出る前に音を確認。",
      ko: "초반 육식 먹이 확인에 좋습니다. 개활지 전 소리를 확인하세요."
    }
  },
  {
    id: "salt-rocks",
    type: "resource",
    x: 57,
    y: 46,
    risk: { en: "Medium", mn: "Дунд", ja: "中", ko: "보통" },
    name: { en: "Resource Point", mn: "Resource point", ja: "Resource Point", ko: "Resource Point" },
    note: {
      en: "Resource check area near the central path. Use it quickly and keep moving.",
      mn: "Төв route-ийн ойролцоох resource area. Хурдан шалгаад хөдөлсөн нь дээр.",
      ja: "中央ルート近くの資源確認エリア。短時間で済ませて移動しましょう。",
      ko: "중앙 경로 근처의 자원 확인 구역입니다. 빠르게 확인하고 이동하세요."
    }
  }
];

const regionLabels = [
  { name: "Northwest Ridge", className: "left-[27%] top-[28%]" },
  { name: "Northern Jungle", className: "left-[58%] top-[25%]" },
  { name: "Water Access", className: "left-[37%] top-[45%]" },
  { name: "Jungle Sector", className: "left-[49%] top-[58%]" },
  { name: "Swamps Center", className: "left-[50%] top-[72%]" },
  { name: "Southern Beach", className: "left-[52%] top-[87%]" }
];

function normalizeType(type: string): MarkerType {
  return type in markerMeta ? (type as MarkerType) : "water";
}

function buildLocalMarkers(markers?: IsleMapMarker[]): LocalMarker[] {
  if (!markers?.length) {
    return mapMarkers;
  }

  return markers.map((marker) => {
    const type = normalizeType(marker.type);
    const name = marker.name || marker.id;
    const note = marker.note || "Community marker.";
    const risk = marker.risk || "Medium";

    return {
      id: marker.id,
      type,
      x: marker.x,
      y: marker.y,
      risk: { en: risk, mn: risk, ja: risk, ko: risk },
      name: { en: name, mn: name, ja: name, ko: name },
      note: { en: note, mn: note, ja: note, ko: note }
    };
  });
}

export function IsleMap({ markers }: { markers?: IsleMapMarker[] }) {
  const { locale } = useLanguage();
  const text = labels[locale];
  const localMarkers = useMemo(() => buildLocalMarkers(markers), [markers]);
  const allTypes = Object.keys(markerMeta) as MarkerType[];
  const [activeTypes, setActiveTypes] = useState<MarkerType[]>(allTypes);
  const [selectedMarkerId, setSelectedMarkerId] = useState(localMarkers[0]?.id ?? "north-lake");
  const [zoom, setZoom] = useState(1.05);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0
  });

  const selectedMarker = localMarkers.find((marker) => marker.id === selectedMarkerId) ?? localMarkers[0];
  const visibleMarkers = useMemo(() => localMarkers.filter((marker) => activeTypes.includes(marker.type)), [activeTypes, localMarkers]);

  function toggleType(type: MarkerType) {
    setActiveTypes((current) => {
      if (current.length === 1 && current.includes(type)) {
        return current;
      }

      return current.includes(type) ? current.filter((item) => item !== type) : [...current, type];
    });
  }

  function resetView() {
    setZoom(1.05);
    setPan({ x: 0, y: 0 });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = { active: true, startX: event.clientX, startY: event.clientY, baseX: pan.x, baseY: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;

    setPan({
      x: dragRef.current.baseX + event.clientX - dragRef.current.startX,
      y: dragRef.current.baseY + event.clientY - dragRef.current.startY
    });
  }

  function stopDragging(event: PointerEvent<HTMLDivElement>) {
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/35 shadow-[0_30px_120px_rgba(0,0,0,.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[.04] p-3">
          <div className="flex flex-wrap gap-2">
            {allTypes.map((type) => {
              const meta = markerMeta[type];
              const Icon = meta.icon;
              const active = activeTypes.includes(type);

              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold uppercase tracking-normal transition",
                    active ? "border-primary/45 bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {text.filters[type]}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom((value) => Math.max(0.75, value - 0.15))} aria-label={text.zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-16 text-center text-xs font-bold text-zinc-300">{Math.round(zoom * 100)}%</div>
            <Button variant="outline" size="icon" onClick={() => setZoom((value) => Math.min(2.4, value + 0.15))} aria-label={text.zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={resetView} aria-label={text.reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className="relative h-[72vh] min-h-[620px] touch-none overflow-hidden bg-[#06080f] select-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onWheel={(event) => {
            event.preventDefault();
            setZoom((value) => Math.min(2.4, Math.max(0.75, value + (event.deltaY < 0 ? 0.08 : -0.08))));
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 aspect-square w-[min(980px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-emerald-300/15 bg-black shadow-[0_30px_120px_rgba(0,0,0,.45)]"
            style={{ transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`, transformOrigin: "center" }}
          >
            <img
              src={gatewayMapImageUrl}
              alt="The Isle Evrima Gateway basemap"
              className="absolute inset-0 h-full w-full rounded-lg object-contain"
              draggable={false}
            />
            <div className="absolute inset-0 rounded-lg bg-[linear-gradient(90deg,rgba(0,0,0,.14),transparent_24%,transparent_72%,rgba(0,0,0,.14))]" />
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" aria-hidden="true">
              <path d="M285 535 C360 510 423 520 492 575 C570 638 642 622 736 584" fill="none" stroke="rgba(250,204,21,.7)" strokeWidth="7" strokeDasharray="22 18" strokeLinecap="round" />
              <path d="M338 330 C410 370 475 360 548 405 C620 448 680 422 748 382" fill="none" stroke="rgba(250,204,21,.55)" strokeWidth="6" strokeDasharray="18 15" strokeLinecap="round" />
              <path d="M424 765 C484 703 550 704 615 746" fill="none" stroke="rgba(250,204,21,.55)" strokeWidth="6" strokeDasharray="18 15" strokeLinecap="round" />
            </svg>

            {regionLabels.map((region) => (
              <div key={region.name} className={cn("pointer-events-none absolute rounded bg-black/50 px-2 py-1 text-[10px] font-black uppercase text-white/80 shadow", region.className)}>
                {region.name}
              </div>
            ))}

            {visibleMarkers.map((marker) => {
              const meta = markerMeta[marker.type];
              const Icon = marker.icon ?? meta.icon;
              const selected = selectedMarker?.id === marker.id;

              return (
                <button
                  key={marker.id}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => setSelectedMarkerId(marker.id)}
                  className={cn(
                    "absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black/70 font-bold shadow-[0_10px_34px_rgba(0,0,0,.55)] ring-4 transition hover:scale-110 md:h-12 md:w-12",
                    meta.color,
                    selected ? "scale-110 ring-white/70" : meta.ring
                  )}
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  aria-label={marker.name[locale]}
                  title={marker.name[locale]}
                >
                  <span className={cn("absolute inset-[-9px] rounded-full", meta.pulse, selected ? "animate-pulse" : "opacity-0")} />
                  <Icon className="relative h-5 w-5" />
                </button>
              );
            })}
          </div>

          <div className="pointer-events-none absolute bottom-4 left-4 max-w-[360px] rounded-md border border-white/10 bg-black/65 px-3 py-2 text-xs text-zinc-300 backdrop-blur">
            <div className="font-bold uppercase text-white">{text.operations}</div>
            <div className="mt-1 text-zinc-400">{text.subtitle}</div>
          </div>
        </div>
      </div>

      {selectedMarker ? (
        <aside className="rounded-lg border border-white/10 bg-white/[.04] p-5 backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
            <Info className="h-4 w-4" />
            {text.selectedIntel}
          </div>
          <h2 className="mt-4 text-3xl font-black text-white">{selectedMarker.name[locale]}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={cn("inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-bold uppercase", markerMeta[selectedMarker.type].color)}>
              {text.filters[selectedMarker.type]}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold uppercase text-zinc-300">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {Math.round(selectedMarker.x)} / {Math.round(selectedMarker.y)}
            </span>
          </div>
          <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-4">
            <div className="text-xs font-bold uppercase text-zinc-500">{text.risk}</div>
            <div className="mt-1 text-xl font-black text-white">{selectedMarker.risk[locale]}</div>
          </div>
          <p className="mt-5 text-sm leading-7 text-zinc-300">{selectedMarker.note[locale]}</p>

          <div className="mt-8 grid gap-3 text-sm text-zinc-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>{text.visibleMarkers}</span>
              <span className="font-bold text-white">{visibleMarkers.length}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>{text.activeFilters}</span>
              <span className="font-bold text-white">{activeTypes.length}/{allTypes.length}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span>{text.coords}</span>
              <span className="font-bold text-white">{Math.round(selectedMarker.x)}, {Math.round(selectedMarker.y)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{text.version}</span>
              <span className="font-bold text-white">{text.versionValue}</span>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-zinc-200">
            {text.hint}
          </div>
          <div className="mt-4 text-xs leading-5 text-zinc-500">{text.source}</div>
        </aside>
      ) : null}
    </section>
  );
}
