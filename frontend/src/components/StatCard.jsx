export default function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${accent || 'text-slate-900'}`}>{value}</p>
    </div>
  )
}
