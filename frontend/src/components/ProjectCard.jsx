import { Link } from 'react-router-dom'

export default function ProjectCard({ project, canManage, onEdit, onDelete }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-slate-900">{project.name}</h3>
        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">Project</span>
      </div>
      <p className="mt-2 min-h-10 text-sm text-slate-600">{project.description || 'No description.'}</p>
      <p className="mt-3 text-xs text-slate-500">
        Created {project.createdDate ? new Date(project.createdDate).toLocaleDateString() : '-'} · Owner: {project.owner?.name}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Members: {project.members?.map((m) => m.name).join(', ') || 'None'}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={`/board?projectId=${project.id}`} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Open board</Link>
        <Link to={`/issues?projectId=${project.id}`} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">Issues</Link>
        {canManage && (
          <>
            <button onClick={onEdit} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">Edit</button>
            <button onClick={onDelete} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
          </>
        )}
      </div>
    </div>
  )
}
