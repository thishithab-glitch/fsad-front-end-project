import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

function QuestionRow({ question, value, onChange }) {
  return (
    <div className="question-row">
      <div className="question-text">{question.text}</div>
      <div className="question-scale">
        {[1, 2, 3, 4, 5].map((score) => (
          <label key={score}>
            <input
              type="radio"
              name={question.id}
              value={score}
              checked={value === String(score)}
              onChange={(e) => onChange(question.id, e.target.value)}
            />
            <span>{score}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default function AssessmentPage() {
  const { user, questions, saveAssessment } = useAppContext()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')

  function handleChange(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const missing = questions.filter((q) => !answers[q.id])
    if (missing.length > 0) {
      setError('Please answer all questions before submitting.')
      return
    }

    saveAssessment(answers)
    navigate('/results')
  }

  if (!user) {
    return (
      <div className="page">
        <div className="card">
          <h2>Please login first</h2>
          <p>You need to login or sign up before taking the assessment.</p>
          <button className="primary-btn" type="button" onClick={() => navigate('/login')}>
            Go to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <div className="page-header">
          <div>
            <h2>Career Assessment</h2>
            <p>Rate how much you agree with each statement (1 = strongly disagree, 5 = strongly agree).</p>
          </div>
          <div className="user-pill">
            <span>{user.name}</span>
            <span className="user-role">Student</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="assessment-form">
          {questions.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              value={answers[q.id] ?? ''}
              onChange={handleChange}
            />
          ))}

          {error && <p className="error-text">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-btn">
              Submit and view recommendations
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

