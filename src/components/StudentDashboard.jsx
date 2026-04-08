import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

export default function StudentDashboard() {
  const { user, scores, recommendedCareers, resultSubmittedAt, isCatalogLoading, catalogError } =
    useAppContext()
  const navigate = useNavigate()

  const hasResults = scores && scores.length > 0

  if (isCatalogLoading) {
    return (
      <div className="page">
        <div className="card">
          <h2>Loading dashboard</h2>
          <p>Fetching your questions, careers, and latest results from the backend.</p>
        </div>
      </div>
    )
  }

  if (catalogError && !user) {
    return (
      <div className="page">
        <div className="card">
          <h2>Backend connection needed</h2>
          <p>{catalogError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <div className="page-header">
          <div className="page-header-main">
            <div>
              <h2>Welcome back{user?.name ? `, ${user.name}` : ''}</h2>
              <p>
                This is your student dashboard. Start a new assessment, review your results, or
                explore recommended careers.
              </p>
            </div>
            <div className="dashboard-photo">
              <img
                src="https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Students collaborating"
              />
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <h3>Next steps</h3>
            <p>
              Answer a short set of questions to understand your strengths, interests, and preferred
              working style.
            </p>
            <button type="button" className="primary-btn" onClick={() => navigate('/assessment')}>
              Start / continue assessment
            </button>
          </section>

          <section className="dashboard-panel">
            <h3>Your latest profile</h3>
            {hasResults ? (
              <>
                <p>
                  You have completed an assessment. View your score visualisation and personalised
                  career matches.
                </p>
                {resultSubmittedAt ? (
                  <p className="helper-text">
                    Latest submission: {new Date(resultSubmittedAt).toLocaleString()}
                  </p>
                ) : null}
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => navigate('/results')}
                >
                  View results
                </button>
              </>
            ) : (
              <p>No assessment results yet. Take the assessment to see your career profile.</p>
            )}
          </section>

          <section className="dashboard-panel wide">
            <h3>Recommended careers</h3>
            {hasResults && recommendedCareers && recommendedCareers.length > 0 ? (
              <ul className="simple-list">
                {recommendedCareers.map((career) => (
                  <li key={career.id}>
                    <strong>{career.name}</strong>
                    <span className="muted"> - {career.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                After you complete an assessment, careers that fit your strengths will appear here
                with short descriptions.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
