import { GoogleMap } from "@/components/google-map";
import { googleMapsLink } from "@/lib/location";

export function BookingMap({
  latitude,
  longitude,
  label = "จุดนัดหมาย",
}: {
  latitude: number;
  longitude: number;
  label?: string | null;
}) {
  return (
    <div className="space-y-2">
      <GoogleMap latitude={latitude} longitude={longitude} label={label} />
      <p className="text-xs text-slate-500">
        พิกัด {latitude.toFixed(5)}, {longitude.toFixed(5)}
        {label ? ` · ${label}` : ""}
      </p>
      <a
        href={googleMapsLink(latitude, longitude)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 transition hover:text-blue-900"
      >
        เปิดแผนที่ใน Google Maps ↗
      </a>
    </div>
  );
}
