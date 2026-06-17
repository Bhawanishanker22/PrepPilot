import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogOut, Clock, Briefcase } from 'lucide-react'
import api from '../api/axios'

export default function Dashboard() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    api.get('/interviews')
      .then(res => setInterviews(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-900">PrepPilot</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-sm">Hi, {user.name}</span>
          <button onClick={logout} className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Interviews</h2>
            <p className="text-slate-500 mt-1">Practice and track your progress</p>
          </div>
          <button
            onClick={() => navigate('/interview/new')}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-700 transition font-medium"
          >
            <Plus size={18} /> New Interview
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">Loading...</div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600">No interviews yet</h3>
            <p className="text-slate-400 mt-1">Start your first mock interview to begin practicing</p>
            <button
              onClick={() => navigate('/interview/new')}
              className="mt-6 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-700 transition font-medium"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {interviews.map(interview => (
              <div
                key={interview.id}
                onClick={() => navigate(`/feedback/${interview.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{interview.jobPosition}</h3>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-1">{interview.jobDescription}</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
                    {interview.experienceLevel}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-4 text-slate-400 text-xs">
                  <Clock size={12} />
                  <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}