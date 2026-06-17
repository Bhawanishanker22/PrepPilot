import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import api from '../api/axios'

const EXPERIENCE_LEVELS = ['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead']

export default function NewInterview() {
  const [form, setForm] = useState({ jobPosition: '', jobDescription: '', experienceLevel: 'Fresher' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/interviews', form)
      navigate(`/interview/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create interview')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-900">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">New Interview</h1>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Set up your interview</h2>
          <p className="text-slate-500 text-sm mb-8">Tell us about the role and we'll generate tailored questions</p>

          {error && (
            <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-6 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Position</label>
              <input
                type="text"
                required
                value={form.jobPosition}
                onChange={e => setForm({ ...form, jobPosition: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="e.g. Backend Developer, Full Stack Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
              <textarea
                required
                rows={4}
                value={form.jobDescription}
                onChange={e => setForm({ ...form, jobDescription: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                placeholder="Paste the job description or key skills required..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
              <select
                value={form.experienceLevel}
                onChange={e => setForm({ ...form, experienceLevel: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-lg py-3 font-medium hover:bg-slate-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating questions...
                </>
              ) : 'Generate Interview Questions'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}