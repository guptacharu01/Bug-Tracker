import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/issues', label: 'Issues' },
  { to: '/board', label: 'Kanban Board' },
  { to: '/users', label: 'Users', admin: true }
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-navy text-white md:flex">
      <div className="px-6 py-5">
        <p className="font-display text-xl font-bold">🐞 Bug Tracker</p>
        <p className="mt-1 text-xs text-slate-400">Track. Fix. Ship.</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.filter((l) => !l.admin || user?.role === 'ADMIN').map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}
            className={({ isActive }) => `block rounded-lg px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-slate-400">{user?.email} · {user?.role}</p>
        <button onClick={() => { logout(); navigate('/login') }}
          className="mt-3 w-full rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
          Log out
        </button>
      </div>
    </aside>
  )
}
