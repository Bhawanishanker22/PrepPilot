import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, MicOff, ChevronRight, Loader2, ArrowLeft } from 'lucide-react'
import api from '../api/axios'

export default function Interview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [interview, setInterview] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState([])
  const recognitionRef = useRef(null)

  useEffect(() => {
    api.get(`/interviews/${id}`).then(res => {
      setInterview(res.data)
      try {
        const cleaned = res.data.questionsJson
          .replace(/```json/g, '').replace(/```/g, '').trim()
        setQuestions(JSON.parse(cleaned))
      } catch {
        setQuestions([])
      }
    })
  }, [id])

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Use Chrome.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript).join('')
      setUserAnswer(transcript)
    }
    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return
    setSubmitting(true)
    try {
      await api.post('/interviews/answer', {
        interviewId: parseInt(id),
        question: questions[currentIndex].question,
        userAnswer: userAnswer.trim()
      })
      setAnswers([...answers, { question: questions[currentIndex].question, answer: userAnswer }])
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1)
        setUserAnswer('')
      } else {
        navigate(`/feedback/${id}`)
      }
    } catch (err) {
      alert('Failed to submit answer. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!interview || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    )
  }

  const question = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-900">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">PrepPilot</h1>
        </div>
        <span className="text-slate-500 text-sm">Question {currentIndex + 1} of {questions.length}</span>
      </nav>

      <div className="w-full bg-slate-200 h-1">
        <div className="bg-slate-900 h-1 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Question {currentIndex + 1}</p>
          <h2 className="text-xl font-semibold text-slate-900 leading-relaxed">{question.question}</h2>
          {question.hint && (
            <p className="mt-4 text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
              💡 Hint: {question.hint}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-slate-700">Your Answer</label>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isRecording
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isRecording ? <><MicOff size={16} /> Stop</> : <><Mic size={16} /> Record</>}
            </button>
          </div>
          <textarea
            rows={6}
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder="Speak your answer or type it here..."
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          />
          {isRecording && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording...
            </p>
          )}
        </div>

        <button
          onClick={submitAnswer}
          disabled={!userAnswer.trim() || submitting}
          className="w-full bg-slate-900 text-white rounded-xl py-3 font-medium hover:bg-slate-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 size={18} className="animate-spin" /> Getting feedback...</>
          ) : currentIndex + 1 === questions.length ? (
            'Finish Interview'
          ) : (
            <> Next Question <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  )
}