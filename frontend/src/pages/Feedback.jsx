import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Plus, Loader2 } from 'lucide-react'
import api from '../api/axios'

export default function Feedback() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/interviews/${id}`),
      api.get(`/interviews/${id}/answers`)
    ]).then(([interviewRes, answersRes]) => {
      setInterview(interviewRes.data)
      setAnswers(answersRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  const avgRating = answers.length
    ? (answers.reduce((sum, a) => sum + (a.aiRating || 0), 0) / answers.length).toFixed(1)
    : 0

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-600 bg-green-50'
    if (rating >= 5) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-900">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">PrepPilot</h1>
        </div>
        <button
          onClick={() => navigate('/interview/new')}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
        >
          <Plus size={16} /> New Interview
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900">Interview Feedback</h2>
          <p className="text-slate-500 mt-1">{interview?.jobPosition} · {interview?.experienceLevel}</p>

          {answers.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star
                    key={i}
                    size={20}
                    className={parseFloat(avgRating) >= i * 2 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-slate-900">{avgRating}<span className="text-slate-400 text-base font-normal">/10</span></span>
              <span className="text-slate-500 text-sm">Average Score</span>
            </div>
          )}
        </div>

        {answers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No answers submitted yet.</p>
            <button
              onClick={() => navigate(`/interview/${id}`)}
              className="mt-4 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-700 transition font-medium"
            >
              Start Answering
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <div key={answer.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Question {index + 1}</p>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${getRatingColor(answer.aiRating)}`}>
                    {answer.aiRating}/10
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-4">{answer.question}</h3>
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-slate-500 mb-1">Your Answer</p>
                    <p className="text-slate-700 text-sm">{answer.userAnswer}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-blue-600 mb-1">AI Feedback</p>
                    <p className="text-slate-700 text-sm whitespace-pre-line">{answer.aiFeedback}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
