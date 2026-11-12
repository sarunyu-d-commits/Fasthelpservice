"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { buildPromptPayPayload } from "@/lib/promptpay";
import { formatTHB } from "@/lib/format";

export function PromptPayQR({
  amount,
  promptpayId,
  receiverName,
}: {
  amount: number;
  promptpayId: string;
  receiverName: string;
}) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!promptpayId) return;
    const payload = buildPromptPayPayload(promptpayId, amount);
    if (!payload) return;

    let cancelled = false;
    QRCode.toDataURL(payload, {
      width: 280,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl("");
      });

    return () => {
      cancelled = true;
    };
  }, [amount, promptpayId]);

  if (!promptpayId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
        ยังไม่ได้ตั้งค่า NEXT_PUBLIC_PROMPTPAY_ID สำหรับรับเงิน
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        {dataUrl ? (
          <Image
            src={dataUrl}
            alt="PromptPay QR Code"
            width={220}
            height={220}
            unoptimized
            className="size-[220px]"
          />
        ) : (
          <div className="grid size-[220px] place-items-center text-sm text-slate-400">
            กำลังสร้าง QR...
          </div>
        )}
      </div>
      <div className="text-center text-sm text-slate-600">
        <p className="font-semibold text-slate-900">พร้อมเพย์</p>
        <p>{receiverName}</p>
        <p className="text-blue-700">{formatTHB(amount)}</p>
      </div>
    </div>
  );
}
