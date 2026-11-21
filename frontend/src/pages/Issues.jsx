import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api, { errorMessage, priorityStyle, statusLabel, statusStyle } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'

export default function Issues() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [issues, setIssues] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [type, setType] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [projectId, setProjectId] = useState(params.get('projectId') || '')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', type: 'TASK', priority: 'MEDIUM', status: 'TODO', assigneeId: '', projectId: '', dueDate: '' })

  const canCreate = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  function load() {
    setLoading(true)
    const query = {}
    if (search) query.search = search
    if (status) query.status = status
    if (priority) query.priority = priority
    if (type) query.type = type
    if (assigneeId) query.assigneeId = assigneeId
    if (projectId) query.projectId = projectId
    Promise.all([api.get('/issues', { params: query }), api.get('/projects'), api.get('/users')])
      .then(([i, p, u]) => { setIssues(i.data); setProjects(p.data); setUsers(u.data) })
      .catch((err) => setError(errorMessage(err, 'Could not load issues.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [search, status, priority, type, assigneeId, projectId])

  function applyProject(id) {
    setProjectId(id)
    if (id) setParams({ projectId: id })
    else setParams({})
  }

  async function create(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/issues', {
        title: form.title,
        description: form.description,
        type: form.type,
        priority: form.priority,
        status: form.status,
        projectId: Number(form.projectId),
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        dueDate: form.dueDate || null
      })
      setNotice('Issue created.')
      setShowForm(false)
      setForm({ title: '', description: '', type: 'TASK', priority: 'MEDIUM', status: 'TODO', assigneeId: '', projectId: '', dueDate: '' })
      load()
    } catch (err) { setError(errorMessage(err, 'Could not create the issue.')) }
  }

  const sorted = [...issues].sort((a, b) => {
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-60">
        <Topbar title="Issues" />
        <main className="p-4 md:p-8">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          {notice && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}
          <div className="mb-4 flex flex-wrap gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title…"
              className="min-w-48 flex-1 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500" />
            <select value={projectId} onChange={(e) => applyProject(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="">All projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="">All statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="">Bug & Task</option>
              <option value="BUG">Bug</option>
              <option value="TASK">Task</option>
            </select>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="">All assignees</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {canCreate && (
              <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                + New issue
              </button>
            )}
          </div>
          {showForm && (
            <form onSubmit={create} className="mb-6 grid gap-3 rounded-xl bg-white p-5 shadow-sm md:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Issue title" required
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-500 md:col-span-2" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3}
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-500 md:col-span-2" />
              <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required className="rounded-lg border px-3 py-2 text-sm">
                <option value="">Choose a project…</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
              </select>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
              <div className="md:col-span-2">
                <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Create issue</button>
              </div>
            </form>
          )}
          {loading ? <Loader /> : sorted.length === 0 ? (
            <EmptyState title="No issues found" text="Try different filters, or create a new issue." />
          ) : (
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Due date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sorted.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">#{issue.id}</td>
                      <td className="px-4 py-3 font-medium">
                        <Link to={`/issues/${issue.id}`} className="text-indigo-600 hover:underline">{issue.title}</Link>
                      </td>
                      <td className="px-4 py-3">{issue.projectName}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityStyle[issue.priority]}`}>{issue.priority}</span></td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle[issue.status]}`}>{statusLabel[issue.status]}</span></td>
                      <td className="px-4 py-3">{issue.assignee?.name || 'Unassigned'}</td>
                      <td className="px-4 py-3">{issue.dueDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
