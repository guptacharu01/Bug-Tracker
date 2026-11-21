import { useEffect, useState } from 'react'
import api, { errorMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ProjectCard from '../components/ProjectCard'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memberProject, setMemberProject] = useState(null)
  const [memberId, setMemberId] = useState('')

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  function load() {
    setLoading(true)
    Promise.all([api.get('/projects'), api.get('/users')])
      .then(([p, u]) => { setProjects(p.data); setUsers(u.data) })
      .catch((err) => setError(errorMessage(err, 'Could not load projects.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null); setName(''); setDescription(''); setShowForm(true)
  }

  function openEdit(p) {
    setEditing(p); setName(p.name); setDescription(p.description || ''); setShowForm(true)
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    try {
      if (editing) await api.put(`/projects/${editing.id}`, { name, description })
      else await api.post('/projects', { name, description })
      setNotice(editing ? 'Project updated.' : 'Project created.')
      setShowForm(false)
      load()
    } catch (err) { setError(errorMessage(err, 'Could not save the project.')) }
  }

  async function remove(p) {
    if (!window.confirm(`Delete project "${p.name}"? Its issues will be deleted too.`)) return
    try { await api.delete(`/projects/${p.id}`); setNotice('Project deleted.'); load() }
    catch (err) { setError(errorMessage(err, 'Could not delete the project.')) }
  }

  async function addMember(e) {
    e.preventDefault()
    try {
      await api.post(`/projects/${memberProject.id}/members/${memberId}`)
      setNotice('Member added.')
      setMemberProject(null)
      load()
    } catch (err) { setError(errorMessage(err, 'Could not add the member.')) }
  }

  async function removeMember(p, userId) {
    try { await api.delete(`/projects/${p.id}/members/${userId}`); setNotice('Member removed.'); load() }
    catch (err) { setError(errorMessage(err, 'Could not remove the member.')) }
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-60">
        <Topbar title="Projects" />
        <main className="p-4 md:p-8">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          {notice && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}
          {canManage && (
            <button onClick={openCreate} className="mb-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              + New project
            </button>
          )}
          {showForm && (
            <form onSubmit={save} className="mb-6 rounded-xl bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-semibold">{editing ? 'Edit project' : 'New project'}</h2>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" required
                className="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-500" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" rows={3}
                className="mt-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-500" />
              <div className="mt-3 flex gap-2">
                <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
              </div>
            </form>
          )}
          {loading ? <Loader /> : projects.length === 0 ? (
            <EmptyState title="No projects yet" text="Create your first project to start tracking issues." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((p) => (
                <div key={p.id}>
                  <ProjectCard project={p} canManage={canManage} onEdit={() => openEdit(p)} onDelete={() => remove(p)} />
                  {canManage && (
                    <div className="mt-2 rounded-xl bg-white p-3 shadow-sm">
                      <button onClick={() => { setMemberProject(p); setMemberId('') }} className="text-xs font-semibold text-indigo-600">Manage members</button>
                      {p.members?.filter((m) => m.id !== p.owner?.id).map((m) => (
                        <span key={m.id} className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                          {m.name}
                          <button onClick={() => removeMember(p, m.id)} className="text-red-500" title="Remove">×</button>
                        </span>
                      ))}
                      {memberProject?.id === p.id && (
                        <form onSubmit={addMember} className="mt-2 flex gap-2">
                          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required
                            className="flex-1 rounded-lg border px-2 py-1.5 text-sm">
                            <option value="">Choose a user…</option>
                            {users.filter((u) => !p.members.some((m) => m.id === u.id)).map((u) => (
                              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                          </select>
                          <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">Add</button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
