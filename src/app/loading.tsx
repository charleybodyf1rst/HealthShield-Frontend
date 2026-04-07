export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-slate-700 rounded" />
          <div className="h-4 w-64 bg-slate-800 rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-slate-700 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-slate-800 rounded-xl" />
    </div>
  );
}
