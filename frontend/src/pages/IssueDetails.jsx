import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api, { errorMessage, priorityStyle, statusLabel, statusStyle } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Loader from '../components/Loader'

export default function IssueDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [issue, setIssue] = useState(null)
  const [comments, setComments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [commentText, setCommentText] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', type: 'TASK', priority: 'MEDIUM', status: 'TODO', assigneeId: '', dueDate: '' })
  const [file, setFile] = useState(null)

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER'
  const canEdit = canManage || issue?.assignee?.id === user?.id || issue?.reporter?.id === user?.id

  function load() {
    Promise.all([api.get(`/issues/${id}`), api.get(`/issues/${id}/comments`), api.get('/users')])
      .then(([i, c, u]) => {
        setIssue(i.data); setComments(c.data); setUsers(u.data)
        setForm({
          title: i.data.title, description: i.data.description || '', type: i.data.type,
          priority: i.data.priority, status: i.data.status,
          assigneeId: i.data.assignee?.id || '', dueDate: i.data.dueDate || ''
        })
      })
      .catch((err) => setError(errorMessage(err, 'Could not load this issue.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  async function saveEdit(e) {
    e.preventDefault()
    try {
      const res = await api.put(`/issues/${id}`, {
        title: form.title, description: form.description, type: form.type,
        priority: form.priority, status: form.status, projectId: issue.projectId,
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        dueDate: form.dueDate || null
      })
      setIssue(res.data); setEditing(false); setNotice('Issue updated.')
    } catch (err) { setError(errorMessage(err, 'Could not save the issue.')) }
  }

  async function changeStatus(status) {
    try {
      const res = await api.patch(`/issues/${id}/status`, { status })
      setIssue(res.data); setNotice('Status updated.')
    } catch (err) { setError(errorMessage(err, 'Could not change the status.')) }
  }

  async function remove() {
    if (!window.confirm('Delete this issue?')) return
    try { await api.delete(`/issues/${id}`); navigate('/issues') }
    catch (err) { setError(errorMessage(err, 'Could not delete the issue.')) }
  }

  async function addComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    try {
      const res = await api.post(`/issues/${id}/comments`, { text: commentText })
      setComments([...comments, res.data]); setCommentText('')
    } catch (err) { setError(errorMessage(err, 'Could not add the comment.')) }
  }

  async function uploadScreenshot(e) {
    e.preventDefault()
    if (!file) return
    const data = new FormData()
    data.append('file', file)
    try {
      const res = await api.post(`/issues/${id}/screenshot`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setIssue(res.data); setNotice('Screenshot uploaded.'); setFile(null)
    } catch (err) { setError(errorMessage(err, 'Could not upload the screenshot.')) }
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-60">
        <Topbar title="Issue details" />
        <main className="p-4 md:p-8">
          {loading ? <Loader /> : !issue ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error || 'Issue not found.'}</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
                {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
                {notice && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}
                {!editing ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">#{issue.id} · {issue.projectName} · {issue.type}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold">{issue.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{issue.description || 'No description.'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyle[issue.priority]}`}>{issue.priority} priority</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[issue.status]}`}>{statusLabel[issue.status]}</span>
                    </div>
                    <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                      <div><dt className="text-slate-400">Assignee</dt><dd className="font-medium">{issue.assignee?.name || 'Unassigned'}</dd></div>
                      <div><dt className="text-slate-400">Reporter</dt><dd className="font-medium">{issue.reporter?.name}</dd></div>
                      <div><dt className="text-slate-400">Created</dt><dd className="font-medium">{new Date(issue.createdDate).toLocaleString()}</dd></div>
                      <div><dt className="text-slate-400">Due date</dt><dd className="font-medium">{issue.dueDate || '-'}</dd></div>
                    </dl>
                    {issue.screenshot && (
                      <img src={`/uploads/${issue.screenshot}`} alt="Issue screenshot" className="mt-5 max-h-80 rounded-lg border" />
                    )}
                    {canEdit && (
                      <form onSubmit={uploadScreenshot} className="mt-4 flex flex-wrap items-center gap-2">
                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
                        <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">Upload screenshot</button>
                      </form>
                    )}
                    <div className="mt-6 flex flex-wrap gap-2">
                      {canEdit && <button onClick={() => setEditing(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Edit issue</button>}
                      {canManage && <button onClick={remove} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">Delete issue</button>}
                    </div>
                  </>
                ) : (
                  <form onSubmit={saveEdit} className="grid gap-3 md:grid-cols-2">
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                      className="rounded-lg border px-3 py-2 text-sm md:col-span-2" />
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
                      className="rounded-lg border px-3 py-2 text-sm md:col-span-2" />
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                      <option value="TASK">Task</option><option value="BUG">Bug</option>
                    </select>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                      <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                    </select>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                      <option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option>
                    </select>
                    <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                      <option value="">Unassigned</option>
                      {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
                    <div className="flex gap-2 md:col-span-2">
                      <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Save changes</button>
                      <button type="button" onClick={() => setEditing(false)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
              <div className="space-y-6">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h3 className="font-display text-base font-semibold">Change status</h3>
                  <div className="mt-3 flex flex-col gap-2">
                    {['TODO', 'IN_PROGRESS', 'DONE'].map((s) => (
                      <button key={s} onClick={() => changeStatus(s)} disabled={!canEdit || issue.status === s}
                        className={`rounded-lg px-3 py-2 text-left text-sm font-medium ${issue.status === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} disabled:opacity-60`}>
                        {statusLabel[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h3 className="font-display text-base font-semibold">Comments ({comments.length})</h3>
                  <ul className="mt-3 space-y-3">
                    {comments.length === 0 && <li className="text-sm text-slate-500">No comments yet. Start the discussion.</li>}
                    {comments.map((c) => (
                      <li key={c.id} className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-700">{c.author?.name} <span className="font-normal text-slate-400">· {new Date(c.createdAt).toLocaleString()}</span></p>
                        <p className="mt-1 text-sm text-slate-700">{c.text}</p>
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={addComment} className="mt-4">
                    <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment…" rows={3}
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                    <button className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Add comment</button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
