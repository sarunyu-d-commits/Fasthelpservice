import { osmEmbed, osmLink } from "@/lib/location";

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
      <iframe
        title="แผนที่จุดนัดหมาย"
        src={osmEmbed(latitude, longitude)}
        className="h-52 w-full rounded-2xl border border-slate-200"
        loading="lazy"
      />
      <p className="text-xs text-slate-500">
        พิกัด {latitude.toFixed(5)}, {longitude.toFixed(5)}
        {label ? ` · ${label}` : ""}
      </p>
      <a
        href={osmLink(latitude, longitude, label)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 transition hover:text-blue-900"
      >
        เปิดแผนที่ใน OpenStreetMap ↗
      </a>
    </div>
  );
}
