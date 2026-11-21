import { Link } from 'react-router-dom'
import { priorityStyle, statusLabel, statusStyle } from '../services/api'

export default function IssueCard({ issue }) {
  return (
    <Link to={`/issues/${issue.id}`} className="block rounded-lg bg-white p-3 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-semibold text-slate-900">{issue.title}</p>
      <p className="mt-1 text-xs text-slate-500">#{issue.id} · {issue.projectName} · {issue.type}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityStyle[issue.priority]}`}>{issue.priority}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle[issue.status]}`}>{statusLabel[issue.status]}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {issue.assignee ? `Assigned to ${issue.assignee.name}` : 'Unassigned'}
        {issue.dueDate ? ` · Due ${issue.dueDate}` : ''}
      </p>
    </Link>
  )
}
