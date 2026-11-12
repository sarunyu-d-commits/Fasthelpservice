import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  AppPreview,
  StepChooseArt,
  StepDoneArt,
  StepScheduleArt,
} from "@/components/illustrations";
import { SparklesIcon } from "@/components/icons";

export const metadata: Metadata = { title: "ภาพประกอบ FastHelp" };

function ArtCard({
  title,
  usage,
  children,
}: {
  title: string;
  usage: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          {usage}
        </span>
      </div>
      <div className="mt-4 grid place-items-center rounded-3xl bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6">
        {children}
      </div>
    </section>
  );
}

export default function IllustrationsPreviewPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
          <SparklesIcon className="size-3.5" />
          Design preview
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          ภาพประกอบของ FastHelp
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          ภาพประกอบทั้งหมดวาดด้วย SVG ภายในโปรเจกต์ (ไม่มีค่าลิขสิทธิ์)
          ใช้โทนฟ้า–น้ำเงินให้เข้ากับแบรนด์
        </p>
      </div>

      <section className="mt-8 overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              AppPreview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              มือถือจำลองหน้าจอแอป + การ์ดลอย (ใช้ใน Hero หน้าแรก)
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
            หน้าแรก · Hero
          </span>
        </div>
        <div className="mt-8 grid place-items-center rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-sky-50 px-4 py-10">
          <AppPreview />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ArtCard title="StepChooseArt" usage="ขั้นตอนที่ 1">
          <StepChooseArt className="w-full max-w-[220px]" />
        </ArtCard>
        <ArtCard title="StepScheduleArt" usage="ขั้นตอนที่ 2">
          <StepScheduleArt className="w-full max-w-[220px]" />
        </ArtCard>
        <ArtCard title="StepDoneArt" usage="ขั้นตอนที่ 3">
          <StepDoneArt className="w-full max-w-[220px]" />
        </ArtCard>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        หน้านี้มีไว้สำหรับดูภาพประกอบเท่านั้น ไม่ได้ลิงก์จากเมนูหลัก
      </p>
    </div>
  );
}
