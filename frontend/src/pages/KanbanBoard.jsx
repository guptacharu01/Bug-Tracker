import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import api, { errorMessage } from '../services/api'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import IssueCard from '../components/IssueCard'
import Loader from '../components/Loader'

const COLUMNS = [
  { id: 'TODO', title: 'To Do', dot: 'bg-slate-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', dot: 'bg-blue-500' },
  { id: 'DONE', title: 'Done', dot: 'bg-green-500' }
]

function DraggableIssue({ issue }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: String(issue.id) })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}>
      <IssueCard issue={issue} />
    </div>
  )
}

function Column({ column, issues }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  return (
    <div ref={setNodeRef} className={`flex min-h-64 flex-col rounded-xl p-3 ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'bg-slate-100'}`}>
      <div className="flex items-center gap-2 px-1 pb-3">
        <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
        <h2 className="font-display text-sm font-semibold">{column.title}</h2>
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">{issues.length}</span>
      </div>
      <div className="space-y-2">
        {issues.map((issue) => <DraggableIssue key={issue.id} issue={issue} />)}
        {issues.length === 0 && <p className="rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">Drop issues here</p>}
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const [params, setParams] = useSearchParams()
  const [issues, setIssues] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const projectId = params.get('projectId') || ''

  function load() {
    const query = projectId ? { projectId } : {}
    Promise.all([api.get('/issues', { params: query }), api.get('/projects')])
      .then(([i, p]) => { setIssues(i.data); setProjects(p.data) })
      .catch((err) => setError(errorMessage(err, 'Could not load the board.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [projectId])

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return
    const issueId = Number(active.id)
    const newStatus = over.id
    const issue = issues.find((i) => i.id === issueId)
    if (!issue || issue.status === newStatus) return
    // Update immediately, then save to the backend.
    setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)))
    try {
      const res = await api.patch(`/issues/${issueId}/status`, { status: newStatus })
      setIssues((prev) => prev.map((i) => (i.id === issueId ? res.data : i)))
    } catch (err) {
      setIssues((prev) => prev.map((i) => (i.id === issueId ? issue : i)))
      setError(errorMessage(err, 'Could not move the issue. You may not have permission.'))
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-60">
        <Topbar title="Kanban Board" />
        <main className="p-4 md:p-8">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <select value={projectId} onChange={(e) => { if (e.target.value) setParams({ projectId: e.target.value }); else setParams({}) }}
              className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="">All projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <p className="text-sm text-slate-500">Drag an issue card into another column to change its status.</p>
          </div>
          {loading ? <Loader /> : (
            <DndContext onDragEnd={handleDragEnd}>
              <div className="grid gap-4 lg:grid-cols-3">
                {COLUMNS.map((col) => (
                  <Column key={col.id} column={col} issues={issues.filter((i) => i.status === col.id)} />
                ))}
              </div>
            </DndContext>
          )}
        </main>
      </div>
    </div>
  )
}
