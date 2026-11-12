import type { ReactNode } from "react";
import { BadgeCheckIcon, ShieldIcon, StarIcon } from "./icons";
import { Logo } from "./logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 sm:py-10">
      <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 px-5 py-6">
        <Logo />
        <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {subtitle}
        </p>
      </div>

      <div className="-mt-3 mx-3 rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(37,99,235,0.45)] sm:p-6">
        {children}
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}

      <div className="mt-5 flex items-center justify-center gap-4 text-[11px] font-medium text-slate-500">
        <span className="inline-flex items-center gap-1">
          <ShieldIcon className="size-3.5 text-blue-500" />
          ช่างผ่านการตรวจสอบ
        </span>
        <span className="inline-flex items-center gap-1">
          <BadgeCheckIcon className="size-3.5 text-blue-500" />
          ใช้บริการจริง
        </span>
        <span className="inline-flex items-center gap-1">
          <StarIcon className="size-3.5 text-amber-400" />
          4.9
        </span>
      </div>
    </div>
  );
}
