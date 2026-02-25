import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

function ProgressBar({ label, value }) {
  return (
    <div className="progress-item">
      <div className="progress-header">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const { scores, recommendedCareers } = useAppContext()
  const navigate = useNavigate()

  const hasResults = scores && scores.length > 0

  if (!hasResults) {
    return (
      <div className="page">
        <div className="card">
          <h2>No results yet</h2>
          <p>Take the assessment to see your scores and personalised career recommendations.</p>
          <button className="primary-btn" type="button" onClick={() => navigate('/assessment')}>
            Start assessment
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
            <h2>Your career profile</h2>
            <p>These scores show how strongly you lean towards each strength area.</p>
          </div>
        </div>

        <section className="results-section">
          <h3>Score visualisation</h3>
          <div className="progress-grid">
            {scores.map((s) => (
              <ProgressBar key={s.category} label={s.category} value={s.score} />
            ))}
          </div>
        </section>

        <section className="results-section">
          <h3>Recommended careers</h3>
          {recommendedCareers.length === 0 ? (
            <p>
              We could not match a specific career, but you can discuss your scores with a counsellor
              to explore more options.
            </p>
          ) : (
            <div className="career-grid">
              {recommendedCareers.map((career) => (
                <article key={career.id} className="career-card">
                  <h4>{career.name}</h4>
                  <p className="career-desc">{career.description}</p>
                  <p className="career-tags">
                    Best for:{' '}
                    {career.bestFor.map((b) => (
                      <span key={b} className="pill">
                        {b}
                      </span>
                    ))}
                  </p>
                  <div className="skills-list">
                    <h5>Key skills to develop</h5>
                    <ul>
                      {career.skills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={() => navigate('/assessment')}>
            Retake assessment
          </button>
        </div>
      </div>
    </div>
  )
}

