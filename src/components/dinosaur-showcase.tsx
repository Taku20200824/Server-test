"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Eye, Footprints, ShieldAlert, UsersRound } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const showcaseImages = {
  rex: "/images/dinosaurs/trex.png"
};

export function DinosaurShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const { locale, t } = useLanguage();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const rexY = useTransform(scrollYProgress, [0, 1], [54, -54]);
  const rexScale = useTransform(scrollYProgress, [0, 0.48, 1], [1.05, 1.15, 1.25]);

  const moments = [
    { icon: Footprints, title: t("showcase.trackTitle"), body: t("showcase.trackBody") },
    { icon: ShieldAlert, title: t("showcase.surviveTitle"), body: t("showcase.surviveBody") },
    { icon: UsersRound, title: t("showcase.packTitle"), body: t("showcase.packBody") }
  ];

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden border-y border-white/10 bg-black py-24 sm:py-28">
      <motion.img
        src={showcaseImages.rex}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full origin-center object-cover object-[64%_48%] opacity-72 saturate-125"
        style={{ y: rexY, scale: rexScale }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_30%,rgba(20,184,166,.24),transparent_31%),radial-gradient(circle_at_24%_78%,rgba(245,158,11,.12),transparent_26%),linear-gradient(90deg,rgba(0,0,0,.9),rgba(0,0,0,.55)_52%,rgba(0,0,0,.74)),linear-gradient(180deg,rgba(2,6,5,.76),rgba(2,6,5,.42)_48%,rgba(2,6,5,.92))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="scanlines" />

      <div className="container relative z-10 max-w-full">
        <div className="max-w-3xl">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold uppercase text-primary backdrop-blur">
            <Eye className="h-4 w-4" />
            <span className="break-words">{t("showcase.eyebrow")}</span>
          </div>
          <h2
            className={cn(
              "mt-6 max-w-2xl break-words font-display text-4xl font-black leading-tight text-white drop-shadow-[0_0_34px_rgba(20,184,166,.2)] sm:text-6xl",
              locale === "mn" && "font-sans text-3xl leading-tight sm:text-5xl"
            )}
          >
            {t("showcase.title")}
          </h2>
          <p className="mt-6 max-w-2xl break-words text-lg leading-8 text-zinc-200">
            {t("showcase.body")}
          </p>
        </div>

        <div className="mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
          {moments.map(({ icon: Icon, title, body }) => (
            <article key={title} className="hud-card min-h-52 rounded-md p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/25 bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
