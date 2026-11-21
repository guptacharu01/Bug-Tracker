import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Topbar({ title }) {
  const { user } = useAuth()
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/90 px-4 py-4 backdrop-blur md:px-8">
      <h1 className="font-display text-xl font-bold text-slate-900 md:text-2xl">{title}</h1>
      <div className="flex items-center gap-3">
        <nav className="flex gap-4 text-sm font-medium text-slate-600 md:hidden">
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/issues">Issues</Link>
          <Link to="/board">Board</Link>
        </nav>
        <span className="hidden rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 sm:block">
          {user?.name} · {user?.role}
        </span>
      </div>
    </header>
  )
}
