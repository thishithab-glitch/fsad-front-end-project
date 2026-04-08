import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

function QuestionRow({ question, value, onChange }) {
  return (
    <div className="question-row">
      <div className="question-text">
        <span className="question-category-pill">{question.category}</span>
        <span>{question.text}</span>
      </div>
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
  const { user, questions, saveAssessment, isCatalogLoading, catalogError, isAssessmentSaving } =
    useAppContext()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).filter((key) => answers[key]).length

  function handleChange(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const missing = questions.filter((question) => !answers[question.id])
    if (missing.length > 0) {
      setError('Please answer all questions before submitting.')
      return
    }

    try {
      await saveAssessment(answers)
      navigate('/results')
    } catch (submitError) {
      setError(submitError.message)
    }
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

  if (isCatalogLoading) {
    return (
      <div className="page">
        <div className="card">
          <h2>Loading assessment</h2>
          <p>Fetching the latest questions from the backend.</p>
        </div>
      </div>
    )
  }

  if (catalogError) {
    return (
      <div className="page">
        <div className="card">
          <h2>Unable to load assessment</h2>
          <p>{catalogError}</p>
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
            <p>
              Rate how much each statement describes you today. 1 = strongly disagree, 5 = strongly
              agree. Your answers help us highlight your strongest preference areas.
            </p>
          </div>
          <div className="user-pill">
            <span>{user.name}</span>
            <span className="user-role">{user.role || 'student'}</span>
          </div>
        </div>

        <div className="assessment-summary">
          <span>
            Questions answered: {answeredCount} / {totalQuestions}
          </span>
          <span>
            Domains covered:{' '}
            {[...new Set(questions.map((question) => question.category))].join(' | ')}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="assessment-form">
          {questions.map((question) => (
            <QuestionRow
              key={question.id}
              question={question}
              value={answers[question.id] ?? ''}
              onChange={handleChange}
            />
          ))}

          {error && <p className="error-text">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={isAssessmentSaving}>
              {isAssessmentSaving ? 'Submitting...' : 'Submit and view recommendations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
