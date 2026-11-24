"use client";

import { useEffect, useRef, useState } from "react";
import { googleMapsApiKey } from "@/lib/location";

type GoogleMapInstance = {
  setCenter: (position: { lat: number; lng: number }) => void;
};

type GoogleMarkerInstance = {
  setMap: (map: GoogleMapInstance | null) => void;
};

type GoogleMapsNamespace = {
  Map: new (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => GoogleMapInstance;
  Marker: new (options: Record<string, unknown>) => GoogleMarkerInstance;
};

declare global {
  interface Window {
    google?: { maps: GoogleMapsNamespace };
  }
}

let mapsPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&v=weekly`;
    script.async = true;
    script.onload = () => {
      if (window.google?.maps) {
        resolve();
      } else {
        mapsPromise = null;
        reject(new Error("Google Maps ไม่พร้อมใช้งาน"));
      }
    };
    script.onerror = () => {
      mapsPromise = null;
      reject(new Error("โหลด Google Maps ไม่สำเร็จ"));
    };
    document.head.appendChild(script);
  });

  return mapsPromise;
}

export function GoogleMap({
  latitude,
  longitude,
  label,
  className = "h-52 w-full rounded-2xl border border-slate-200",
}: {
  latitude: number;
  longitude: number;
  label?: string | null;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const apiKey = googleMapsApiKey();

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    let marker: GoogleMarkerInstance | null = null;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.maps) return;
        const position = { lat: latitude, lng: longitude };
        const map = new window.google.maps.Map(containerRef.current, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        marker = new window.google.maps.Marker({
          position,
          map,
          title: label ?? undefined,
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      marker?.setMap(null);
    };
  }, [apiKey, latitude, longitude, label]);

  if (!apiKey) {
    return (
      <div
        className={`${className} grid place-items-center bg-slate-100 px-4 text-center text-xs text-slate-500`}
      >
        กรุณาตั้งค่า NEXT_PUBLIC_GOOGLE_MAPS_API_KEY เพื่อแสดงแผนที่
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={containerRef} className={className} />
      {status === "loading" ? (
        <div className={`${className} absolute inset-0 grid place-items-center bg-slate-100 text-xs text-slate-500`}>
          กำลังโหลดแผนที่...
        </div>
      ) : null}
      {status === "error" ? (
        <div className={`${className} absolute inset-0 grid place-items-center bg-slate-100 px-4 text-center text-xs text-rose-600`}>
          ไม่สามารถโหลด Google Maps ได้ กรุณาตรวจสอบ API key
        </div>
      ) : null}
    </div>
  );
}
