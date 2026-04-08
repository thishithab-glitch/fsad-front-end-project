import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

function MetricCard({ label, value, tone, detail }) {
  return (
    <article className={`portal-metric ${tone}`}>
      <span className="portal-metric-label">{label}</span>
      <strong className="portal-metric-value">{value}</strong>
      <span className="portal-metric-detail">{detail}</span>
    </article>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="portal-empty">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  )
}

export default function AdminPage() {
  const {
    questions,
    careers,
    upsertQuestion,
    deleteQuestion,
    upsertCareer,
    deleteCareer,
    isCatalogLoading,
    catalogError,
    isAdminSaving,
  } = useAppContext()

  const [questionDraft, setQuestionDraft] = useState({
    id: '',
    text: '',
    category: '',
  })
  const [careerDraft, setCareerDraft] = useState({
    id: '',
    name: '',
    bestFor: '',
    description: '',
    skills: '',
  })
  const [questionFilter, setQuestionFilter] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [editingQuestionId, setEditingQuestionId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const totalCategories = new Set(questions.map((question) => question.category)).size
  const recommendationLinks = careers.reduce(
    (total, career) => total + (career.bestFor?.length || 0),
    0,
  )

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(questions.map((question) => question.category))).sort()],
    [questions],
  )

  const filteredQuestions = useMemo(() => {
    const normalizedFilter = questionFilter.trim().toLowerCase()

    return questions.filter((question) => {
      const matchesCategory = activeCategory === 'All' || question.category === activeCategory
      const matchesText =
        !normalizedFilter ||
        question.id.toLowerCase().includes(normalizedFilter) ||
        question.text.toLowerCase().includes(normalizedFilter) ||
        question.category.toLowerCase().includes(normalizedFilter)

      return matchesCategory && matchesText
    })
  }, [questions, questionFilter, activeCategory])

  function resetQuestionDraft() {
    setQuestionDraft({ id: '', text: '', category: '' })
    setEditingQuestionId('')
  }

  function startQuestionEdit(question) {
    setQuestionDraft({
      id: question.id,
      text: question.text,
      category: question.category,
    })
    setEditingQuestionId(question.id)
    setError('')
    setMessage(`Editing question ${question.id}. Update the fields and save.`)
  }

  async function handleQuestionSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!questionDraft.id || !questionDraft.text || !questionDraft.category) {
      setError('Please complete all question fields.')
      return
    }

    try {
      await upsertQuestion(questionDraft)
      const actionLabel = editingQuestionId ? 'updated' : 'added'
      resetQuestionDraft()
      setMessage(`Assessment question ${actionLabel} successfully.`)
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  async function handleCareerSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (
      !careerDraft.id ||
      !careerDraft.name ||
      !careerDraft.description ||
      !careerDraft.bestFor.trim() ||
      !careerDraft.skills.trim()
    ) {
      setError('Please complete all career recommendation fields.')
      return
    }

    const bestFor = careerDraft.bestFor
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const skills = careerDraft.skills
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    try {
      await upsertCareer({
        id: careerDraft.id,
        name: careerDraft.name,
        bestFor,
        description: careerDraft.description,
        skills,
      })

      setCareerDraft({
        id: '',
        name: '',
        bestFor: '',
        description: '',
        skills: '',
      })
      setMessage('Career recommendation saved successfully.')
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  async function handleDeleteQuestion(id) {
    setError('')
    setMessage('')

    try {
      await deleteQuestion(id)
      if (editingQuestionId === id) {
        resetQuestionDraft()
      }
      setMessage('Assessment question deleted.')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function handleDeleteCareer(id) {
    setError('')
    setMessage('')

    try {
      await deleteCareer(id)
      setMessage('Career recommendation deleted.')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  if (isCatalogLoading) {
    return (
      <div className="page">
        <div className="card">
          <h2>Loading admin portal</h2>
          <p>Fetching assessment tools, test data, and recommendation records.</p>
        </div>
      </div>
    )
  }

  if (catalogError) {
    return (
      <div className="page">
        <div className="card">
          <h2>Unable to load admin portal</h2>
          <p>{catalogError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page admin-portal-page">
      <div className="card admin-portal-card">
        <div className="page-header admin-hero">
          <div>
            <p className="portal-eyebrow">Assessment Administration</p>
            <h2>Professional admin portal for managing assessment questions</h2>
            <p>
              Add, update, organize, and review the assessment question bank while maintaining
              recommendation data from a single admin workspace.
            </p>
          </div>
          <div className="admin-hero-note">
            <strong>Admin workflow</strong>
            <span>Create new assessment questions</span>
            <span>Edit question wording and category</span>
            <span>Maintain career recommendation mappings</span>
          </div>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="helper-text">{message}</p> : null}

        <section className="portal-metrics-grid">
          <MetricCard
            label="Question Bank"
            value={questions.length}
            detail="Live assessment questions"
            tone="tone-blue"
          />
          <MetricCard
            label="Categories"
            value={totalCategories}
            detail="Strength areas covered"
            tone="tone-amber"
          />
          <MetricCard
            label="Career Paths"
            value={careers.length}
            detail="Recommendation records"
            tone="tone-green"
          />
          <MetricCard
            label="Mappings"
            value={recommendationLinks}
            detail="Category-to-career links"
            tone="tone-rose"
          />
        </section>

        <section className="portal-workspace">
          <article className="portal-panel question-library-panel">
            <div className="portal-panel-header">
              <div>
                <p className="portal-section-label">Assessment Question Library</p>
                <h3>Review and manage questions</h3>
              </div>
              <span className="portal-badge">{filteredQuestions.length} visible</span>
            </div>

            <div className="question-toolbar">
              <label className="field">
                <span>Search questions</span>
                <input
                  value={questionFilter}
                  onChange={(e) => setQuestionFilter(e.target.value)}
                  placeholder="Search by id, text, or category"
                />
              </label>
            </div>

            <div className="portal-tags question-filter-tags">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`portal-chip ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {filteredQuestions.length === 0 ? (
              <EmptyState
                title="No matching questions"
                description="Try a different search or create a new assessment question."
              />
            ) : (
              <div className="question-library">
                {filteredQuestions.map((question) => (
                  <article key={question.id} className="question-admin-card">
                    <div className="question-admin-header">
                      <div>
                        <strong>{question.id}</strong>
                        <span className="pill pill-light">{question.category}</span>
                      </div>
                      <div className="question-admin-actions">
                        <button
                          type="button"
                          className="secondary-btn small"
                          onClick={() => startQuestionEdit(question)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p>{question.text}</p>
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="portal-panel question-editor-panel">
            <div className="portal-panel-header">
              <div>
                <p className="portal-section-label">Question Editor</p>
                <h3>{editingQuestionId ? 'Update assessment question' : 'Add new assessment question'}</h3>
              </div>
              {editingQuestionId ? <span className="portal-badge editing">Editing {editingQuestionId}</span> : null}
            </div>

            <p className="portal-copy">
              Use this editor to create new questions or refine existing ones without leaving the
              admin portal.
            </p>

            <form className="admin-form" onSubmit={handleQuestionSubmit}>
              <label className="field">
                <span>Question id</span>
                <input
                  value={questionDraft.id}
                  onChange={(e) => setQuestionDraft((prev) => ({ ...prev, id: e.target.value }))}
                  placeholder="e.g. q13"
                  required
                />
              </label>
              <label className="field">
                <span>Question text</span>
                <textarea
                  value={questionDraft.text}
                  onChange={(e) =>
                    setQuestionDraft((prev) => ({ ...prev, text: e.target.value }))
                  }
                  rows={5}
                  placeholder="Write a clear assessment statement for students."
                  required
                />
              </label>
              <label className="field">
                <span>Category</span>
                <input
                  value={questionDraft.category}
                  onChange={(e) =>
                    setQuestionDraft((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="e.g. Analytical"
                  required
                />
              </label>

              <div className="portal-form-actions">
                {editingQuestionId ? (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetQuestionDraft}
                    disabled={isAdminSaving}
                  >
                    Cancel edit
                  </button>
                ) : null}
                <button type="submit" className="primary-btn" disabled={isAdminSaving}>
                  {isAdminSaving
                    ? 'Saving...'
                    : editingQuestionId
                      ? 'Update question'
                      : 'Add question'}
                </button>
              </div>
            </form>
          </article>
        </section>

        <section className="portal-overview-grid">
          <article className="portal-panel">
            <div className="portal-panel-header">
              <div>
                <p className="portal-section-label">Recommendation Data</p>
                <h3>Career recommendations</h3>
              </div>
            </div>

            {careers.length === 0 ? (
              <EmptyState
                title="No recommendation paths"
                description="Create career mappings so students can receive recommendation results."
              />
            ) : (
              <ul className="portal-list compact-list">
                {careers.map((career) => (
                  <li key={career.id} className="portal-list-item">
                    <div>
                      <strong>{career.name}</strong>
                      <p>{career.description}</p>
                      <div className="portal-tags compact">
                        {(career.bestFor || []).map((category) => (
                          <span key={`${career.id}-${category}`} className="pill">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => handleDeleteCareer(career.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="portal-panel">
            <div className="portal-panel-header">
              <div>
                <p className="portal-section-label">Add Recommendation</p>
                <h3>Career mapping editor</h3>
              </div>
            </div>

            <form className="admin-form" onSubmit={handleCareerSubmit}>
              <label className="field">
                <span>Career id</span>
                <input
                  value={careerDraft.id}
                  onChange={(e) => setCareerDraft((prev) => ({ ...prev, id: e.target.value }))}
                  placeholder="e.g. software-engineer"
                  required
                />
              </label>
              <label className="field">
                <span>Career name</span>
                <input
                  value={careerDraft.name}
                  onChange={(e) => setCareerDraft((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span>Best for categories</span>
                <input
                  value={careerDraft.bestFor}
                  onChange={(e) =>
                    setCareerDraft((prev) => ({ ...prev, bestFor: e.target.value }))
                  }
                  placeholder="e.g. Analytical, Technical"
                  required
                />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea
                  value={careerDraft.description}
                  onChange={(e) =>
                    setCareerDraft((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  required
                />
              </label>
              <label className="field">
                <span>Key skills</span>
                <input
                  value={careerDraft.skills}
                  onChange={(e) =>
                    setCareerDraft((prev) => ({ ...prev, skills: e.target.value }))
                  }
                  placeholder="e.g. SQL, Communication, Research"
                  required
                />
              </label>
              <div className="portal-form-actions">
                <button type="submit" className="secondary-btn" disabled={isAdminSaving}>
                  {isAdminSaving ? 'Saving...' : 'Save recommendation'}
                </button>
              </div>
            </form>
          </article>
        </section>
      </div>
    </div>
  )
}
