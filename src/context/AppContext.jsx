import { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext(null)

const defaultQuestions = [
  {
    id: 'q1',
    text: 'I enjoy solving logical and analytical problems.',
    category: 'Analytical',
  },
  {
    id: 'q2',
    text: 'I like helping people and working in teams.',
    category: 'Social',
  },
  {
    id: 'q3',
    text: 'I am interested in technology and how things work.',
    category: 'Technical',
  },
  {
    id: 'q4',
    text: 'I enjoy creative activities like writing, design or art.',
    category: 'Creative',
  },
  {
    id: 'q5',
    text: 'I am comfortable making decisions and taking responsibility.',
    category: 'Leadership',
  },
]

const defaultCareers = [
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    bestFor: ['Analytical', 'Technical'],
    description:
      'Designs, builds and maintains software applications used by people and organizations.',
    skills: ['Programming fundamentals', 'Problem-solving', 'Data structures', 'Version control'],
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    bestFor: ['Creative', 'Social'],
    description:
      'Creates user-friendly and visually appealing digital interfaces like websites and apps.',
    skills: ['Design tools (Figma, XD)', 'User research', 'Wireframing', 'Visual design'],
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    bestFor: ['Analytical', 'Leadership'],
    description:
      'Connects business needs with technical solutions by gathering requirements and analysing data.',
    skills: ['Requirements analysis', 'Communication', 'Documentation', 'Presentation'],
  },
  {
    id: 'counsellor',
    name: 'Student Counsellor',
    bestFor: ['Social', 'Leadership'],
    description:
      'Guides students in academic and personal decisions by understanding their strengths and challenges.',
    skills: ['Active listening', 'Empathy', 'Communication', 'Ethics'],
  },
]

const STORAGE_KEY = 'fsad-career-app-state'

function loadInitialState() {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  const stored = loadInitialState()

  const [user, setUser] = useState(stored?.user ?? null)
  const [questions, setQuestions] = useState(stored?.questions ?? defaultQuestions)
  const [careers, setCareers] = useState(stored?.careers ?? defaultCareers)
  const [scores, setScores] = useState(stored?.scores ?? null)
  const [recommendedCareers, setRecommendedCareers] = useState(
    stored?.recommendedCareers ?? [],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const snapshot = {
      user,
      questions,
      careers,
      scores,
      recommendedCareers,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }, [user, questions, careers, scores, recommendedCareers])

  function login({ name, email }) {
    setUser({ name, email, role: 'student' })
  }

  function logout() {
    setUser(null)
    setScores(null)
    setRecommendedCareers([])
  }

  function saveAssessment(answers) {
    const categoryTotals = {}
    const categoryCounts = {}

    questions.forEach((q) => {
      const value = Number(answers[q.id] ?? 0)
      if (!Number.isFinite(value)) return
      if (!categoryTotals[q.category]) {
        categoryTotals[q.category] = 0
        categoryCounts[q.category] = 0
      }
      categoryTotals[q.category] += value
      categoryCounts[q.category] += 1
    })

    const computedScores = Object.keys(categoryTotals).map((category) => {
      const total = categoryTotals[category]
      const count = categoryCounts[category] || 1
      const average = total / count
      const percent = Math.round((average / 5) * 100)
      return { category, score: percent }
    })

    setScores(computedScores)

    if (computedScores.length === 0) {
      setRecommendedCareers([])
      return
    }

    const topCategories = computedScores
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((s) => s.category)

    const recommended = careers.filter((career) =>
      career.bestFor.some((cat) => topCategories.includes(cat)),
    )

    setRecommendedCareers(recommended)
  }

  function upsertQuestion(newQuestion) {
    setQuestions((prev) => {
      const existingIndex = prev.findIndex((q) => q.id === newQuestion.id)
      if (existingIndex === -1) {
        return [...prev, newQuestion]
      }
      const updated = [...prev]
      updated[existingIndex] = newQuestion
      return updated
    })
  }

  function deleteQuestion(id) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  function upsertCareer(newCareer) {
    setCareers((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === newCareer.id)
      if (existingIndex === -1) {
        return [...prev, newCareer]
      }
      const updated = [...prev]
      updated[existingIndex] = newCareer
      return updated
    })
  }

  function deleteCareer(id) {
    setCareers((prev) => prev.filter((c) => c.id !== id))
  }

  const value = {
    user,
    questions,
    careers,
    scores,
    recommendedCareers,
    login,
    logout,
    saveAssessment,
    upsertQuestion,
    deleteQuestion,
    upsertCareer,
    deleteCareer,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return ctx
}

