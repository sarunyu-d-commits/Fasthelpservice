export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-8">
      <div className="h-8 w-52 rounded-xl bg-slate-200" />
      <div className="mt-2.5 h-4 w-72 rounded-lg bg-slate-100" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm"
          >
            <div className="size-12 shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
