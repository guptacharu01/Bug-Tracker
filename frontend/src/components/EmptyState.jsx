export default function EmptyState({ title, text }) {
  return (
    <div className="rounded-xl bg-white p-10 text-center shadow-sm">
      <p className="font-display text-lg font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  )
}
