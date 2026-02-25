import { useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

export default function AdminPage() {
  const { questions, careers, upsertQuestion, deleteQuestion, upsertCareer, deleteCareer } =
    useAppContext()

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

  function handleQuestionSubmit(e) {
    e.preventDefault()
    if (!questionDraft.id || !questionDraft.text || !questionDraft.category) return
    upsertQuestion(questionDraft)
    setQuestionDraft({ id: '', text: '', category: '' })
  }

  function handleCareerSubmit(e) {
    e.preventDefault()
    if (!careerDraft.id || !careerDraft.name) return
    const bestFor = careerDraft.bestFor
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
    const skills = careerDraft.skills
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)

    upsertCareer({
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
  }

  return (
    <div className="page">
      <div className="card">
        <div className="page-header">
          <div>
            <h2>Admin: Assessment configuration</h2>
            <p>Manage questions and career mappings. Changes are stored in this browser only.</p>
          </div>
        </div>

        <div className="admin-grid">
          <section>
            <h3>Questions</h3>
            <ul className="simple-list">
              {questions.map((q) => (
                <li key={q.id}>
                  <strong>{q.id}</strong> – {q.text}{' '}
                  <span className="pill pill-light">{q.category}</span>
                  <button type="button" className="link-btn" onClick={() => deleteQuestion(q.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            <form className="admin-form" onSubmit={handleQuestionSubmit}>
              <h4>Add / update question</h4>
              <label className="field">
                <span>Question id</span>
                <input
                  value={questionDraft.id}
                  onChange={(e) => setQuestionDraft((p) => ({ ...p, id: e.target.value }))}
                  placeholder="e.g. q6"
                  required
                />
              </label>
              <label className="field">
                <span>Question text</span>
                <input
                  value={questionDraft.text}
                  onChange={(e) => setQuestionDraft((p) => ({ ...p, text: e.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span>Category</span>
                <input
                  value={questionDraft.category}
                  onChange={(e) => setQuestionDraft((p) => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Technical"
                  required
                />
              </label>
              <button type="submit" className="secondary-btn">
                Save question
              </button>
            </form>
          </section>

          <section>
            <h3>Careers</h3>
            <ul className="simple-list">
              {careers.map((career) => (
                <li key={career.id}>
                  <strong>{career.name}</strong>{' '}
                  <span className="muted">({career.id})</span>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => deleteCareer(career.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            <form className="admin-form" onSubmit={handleCareerSubmit}>
              <h4>Add / update career</h4>
              <label className="field">
                <span>Career id</span>
                <input
                  value={careerDraft.id}
                  onChange={(e) => setCareerDraft((p) => ({ ...p, id: e.target.value }))}
                  placeholder="e.g. data-analyst"
                  required
                />
              </label>
              <label className="field">
                <span>Career name</span>
                <input
                  value={careerDraft.name}
                  onChange={(e) => setCareerDraft((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span>Best for categories (comma separated)</span>
                <input
                  value={careerDraft.bestFor}
                  onChange={(e) => setCareerDraft((p) => ({ ...p, bestFor: e.target.value }))}
                  placeholder="e.g. Analytical, Technical"
                />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea
                  value={careerDraft.description}
                  onChange={(e) =>
                    setCareerDraft((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                />
              </label>
              <label className="field">
                <span>Skills (comma separated)</span>
                <input
                  value={careerDraft.skills}
                  onChange={(e) => setCareerDraft((p) => ({ ...p, skills: e.target.value }))}
                  placeholder="e.g. SQL, Excel, Storytelling"
                />
              </label>
              <button type="submit" className="secondary-btn">
                Save career
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

