import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage, priorityStyle, statusLabel, statusStyle } from '../services/api'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import StatCard from '../components/StatCard'
import Loader from '../components/Loader'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/issues')])
      .then(([p, i]) => { setProjects(p.data); setIssues(i.data) })
      .catch((err) => setError(errorMessage(err, 'Could not load the dashboard.')))
      .finally(() => setLoading(false))
  }, [])

  const inProgress = issues.filter((i) => i.status === 'IN_PROGRESS').length
  const done = issues.filter((i) => i.status === 'DONE').length
  const recent = [...issues].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)).slice(0, 5)

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-60">
        <Topbar title="Dashboard" />
        <main className="p-4 md:p-8">
          {loading ? <Loader /> : error ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total projects" value={projects.length} />
                <StatCard label="Total issues" value={issues.length} />
                <StatCard label="In progress" value={inProgress} accent="text-blue-600" />
                <StatCard label="Completed" value={done} accent="text-green-600" />
              </div>
              <div className="mt-8 rounded-xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">Recent issues</h2>
                  <Link to="/issues" className="text-sm font-semibold text-indigo-600">View all →</Link>
                </div>
                {recent.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">No issues yet. Create a project, then add your first issue.</p>
                ) : (
                  <ul className="mt-4 divide-y">
                    {recent.map((issue) => (
                      <li key={issue.id} className="flex flex-wrap items-center gap-2 py-3">
                        <Link to={`/issues/${issue.id}`} className="flex-1 text-sm font-medium text-slate-800 hover:text-indigo-600">
                          #{issue.id} {issue.title}
                        </Link>
                        <span className="text-xs text-slate-500">{issue.projectName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityStyle[issue.priority]}`}>{issue.priority}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle[issue.status]}`}>{statusLabel[issue.status]}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
