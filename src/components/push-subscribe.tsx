"use client";

import { useEffect, useState } from "react";

import {
  removePushSubscription,
  savePushSubscription,
} from "@/app/actions/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export function PushSubscribe() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const [subscribed, setSubscribed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function check() {
      if (
        !publicKey ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        if (active) setChecking(false);
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const current = await registration.pushManager.getSubscription();
        if (active) setSubscribed(Boolean(current));
      } catch {
        // Ignore browsers where push is unavailable.
      } finally {
        if (active) setChecking(false);
      }
    }
    void check();
    return () => {
      active = false;
    };
  }, [publicKey]);

  if (!publicKey) return null;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setMessage("เบราว์เซอร์นี้รองรับการแจ้งเตือนไม่ได้");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const current = await registration.pushManager.getSubscription();

      if (current) {
        const json = current.toJSON();
        await current.unsubscribe();
        const result = await removePushSubscription(json.endpoint ?? "");
        setSubscribed(false);
        setMessage(result.error ?? "ปิดการแจ้งเตือนแล้ว");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("กรุณาอนุญาตการแจ้งเตือนในเบราว์เซอร์ก่อน");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey!),
      });
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("invalid subscription");
      }
      const result = await savePushSubscription({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      });
      setSubscribed(!result.error);
      setMessage(result.error ?? "เปิดการแจ้งเตือนแล้ว");
    } catch {
      setMessage("เปิดการแจ้งเตือนไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  }

  const disabled = checking || busy;

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
      <h2 className="font-display text-lg font-bold text-ink">การแจ้งเตือน</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        แจ้งเตือนเมื่อมีข้อความใหม่หรือสถานะงานเปลี่ยน แม้ปิดเว็บอยู่
      </p>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {checking
          ? "กำลังตรวจสอบการแจ้งเตือน..."
          : busy
            ? "กำลังบันทึก..."
            : subscribed
              ? "ปิดการแจ้งเตือน"
              : "เปิดการแจ้งเตือน"}
      </button>
      {message ? (
        <p className="mt-2 text-center text-xs text-slate-500" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
