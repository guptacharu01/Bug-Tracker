import { useEffect, useState } from 'react'
import api, { errorMessage } from '../services/api'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function load() {
    api.get('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => setError(errorMessage(err, 'Could not load users.')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function changeRole(u, role) {
    try {
      await api.patch(`/users/${u.id}/role`, { role })
      setNotice(`${u.name} is now ${role}.`)
      load()
    } catch (err) { setError(errorMessage(err, 'Could not change the role.')) }
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-60">
        <Topbar title="Users" />
        <main className="p-4 md:p-8">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          {notice && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}
          {loading ? <Loader /> : users.length === 0 ? (
            <EmptyState title="No users yet" text="Users appear here after they register." />
          ) : (
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Change role</th></tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : u.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="rounded-lg border px-2 py-1.5 text-sm">
                          <option value="ADMIN">ADMIN</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="DEVELOPER">DEVELOPER</option>
                        </select>
                      </td>
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
