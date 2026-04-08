import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../api.js'

const AppContext = createContext(null)
const STORAGE_KEY = 'fsad-career-app-state'
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
    id: 'data-analyst',
    name: 'Data Analyst',
    bestFor: ['Analytical', 'Research'],
    description:
      'Uses data, statistics and visualisation to answer questions and support decisions.',
    skills: ['Spreadsheets / SQL', 'Data visualisation', 'Critical thinking', 'Statistics basics'],
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    bestFor: ['Creative', 'Communication'],
    description:
      'Creates user-friendly and visually appealing digital interfaces like websites and apps.',
    skills: ['Design tools', 'User research', 'Wireframing', 'Visual design'],
  },
  {
    id: 'digital-marketer',
    name: 'Digital Marketer',
    bestFor: ['Creative', 'Analytical'],
    description:
      'Plans and runs online campaigns to reach audiences through social media, email and ads.',
    skills: ['Content creation', 'Social media', 'Analytics tools', 'Copywriting'],
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
    id: 'project-manager',
    name: 'Project Manager',
    bestFor: ['Leadership', 'Communication'],
    description:
      'Plans, coordinates and monitors projects so that teams deliver quality work on time.',
    skills: ['Planning', 'Risk management', 'Team coordination', 'Stakeholder communication'],
  },
  {
    id: 'student-counsellor',
    name: 'Student Counsellor',
    bestFor: ['Social', 'Leadership'],
    description:
      'Guides students in academic and personal decisions by understanding their strengths and challenges.',
    skills: ['Active listening', 'Empathy', 'Communication', 'Ethics'],
  },
  {
    id: 'teacher-trainer',
    name: 'Teacher / Trainer',
    bestFor: ['Social', 'Communication'],
    description:
      'Helps learners build knowledge and confidence through structured lessons and feedback.',
    skills: ['Subject knowledge', 'Classroom management', 'Presentation', 'Assessment design'],
  },
  {
    id: 'lab-technician',
    name: 'Lab Technician',
    bestFor: ['Practical', 'Technical'],
    description:
      'Supports experiments and testing by preparing equipment, samples and accurate records.',
    skills: ['Laboratory safety', 'Attention to detail', 'Instrument handling', 'Documentation'],
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    bestFor: ['Research', 'Analytical'],
    description:
      'Helps with academic or industry research by collecting, cleaning and analysing information.',
    skills: ['Literature review', 'Data collection', 'Report writing', 'Critical thinking'],
  },
]

function deriveRecommendations(scoreList, careerList) {
  if (!scoreList?.length || !careerList?.length) {
    return []
  }

  const normalize = (value) => String(value || '').trim().toLowerCase()

  const topCategories = scoreList
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((score) => normalize(score.category))

  return careerList.filter((career) =>
    (career.bestFor || []).some((category) => topCategories.includes(normalize(category))),
  )
}

function buildGeneratedRecommendations(scoreList) {
  const suggestionMap = {
    analytical: {
      id: 'generated-analytical',
      name: 'Data Analyst',
      bestFor: ['Analytical'],
      description: 'A good fit if you enjoy numbers, structured thinking, and solving problems.',
      skills: ['Excel or SQL', 'Critical thinking', 'Data interpretation', 'Reporting'],
    },
    technical: {
      id: 'generated-technical',
      name: 'Software Engineer',
      bestFor: ['Technical'],
      description: 'A strong option if you like systems, tools, coding, and building solutions.',
      skills: ['Programming', 'Debugging', 'Problem-solving', 'Version control'],
    },
    creative: {
      id: 'generated-creative',
      name: 'UI/UX Designer',
      bestFor: ['Creative'],
      description: 'A strong match for visual thinking, design ideas, and user-focused work.',
      skills: ['Design tools', 'Wireframing', 'Creativity', 'User research'],
    },
    communication: {
      id: 'generated-communication',
      name: 'Content Strategist',
      bestFor: ['Communication'],
      description: 'A suitable path if you like explaining ideas clearly and working with people.',
      skills: ['Writing', 'Presentation', 'Storytelling', 'Collaboration'],
    },
    leadership: {
      id: 'generated-leadership',
      name: 'Project Manager',
      bestFor: ['Leadership'],
      description: 'A good fit if you enjoy organizing work, guiding teams, and taking ownership.',
      skills: ['Planning', 'Coordination', 'Decision-making', 'Communication'],
    },
    social: {
      id: 'generated-social',
      name: 'Counsellor',
      bestFor: ['Social'],
      description: 'A meaningful option if you enjoy helping others and working closely with people.',
      skills: ['Empathy', 'Listening', 'Communication', 'Guidance'],
    },
    practical: {
      id: 'generated-practical',
      name: 'Lab Technician',
      bestFor: ['Practical'],
      description: 'A nice match if you prefer hands-on work and applied problem-solving.',
      skills: ['Hands-on practice', 'Observation', 'Equipment handling', 'Documentation'],
    },
    research: {
      id: 'generated-research',
      name: 'Research Assistant',
      bestFor: ['Research'],
      description: 'A strong path if you like investigating topics and learning in depth.',
      skills: ['Research methods', 'Analysis', 'Documentation', 'Critical thinking'],
    },
  }

  return scoreList
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((score) => suggestionMap[String(score.category || '').trim().toLowerCase()])
    .filter(Boolean)
    .filter(
      (career, index, list) => list.findIndex((item) => item.id === career.id) === index,
    )
}

function resolveRecommendations(resultRecommendations, scoreList, careerList) {
  if (resultRecommendations?.length > 0) {
    return resultRecommendations
  }

  const matchedCareers = deriveRecommendations(scoreList, careerList)
  if (matchedCareers.length > 0) {
    return matchedCareers
  }

  return buildGeneratedRecommendations(scoreList)
}

function loadInitialState() {
  if (typeof window === 'undefined') return null

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  const stored = loadInitialState()

  const [user, setUser] = useState(stored?.user ?? null)
  const [questions, setQuestions] = useState([])
  const [careers, setCareers] = useState([])
  const [scores, setScores] = useState(null)
  const [recommendedCareers, setRecommendedCareers] = useState([])
  const [resultSubmittedAt, setResultSubmittedAt] = useState(null)
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isAssessmentSaving, setIsAssessmentSaving] = useState(false)
  const [isAdminSaving, setIsAdminSaving] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }))
  }, [user])

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      setIsCatalogLoading(true)
      setCatalogError('')

      try {
        const [questionData, careerData] = await Promise.all([
          apiRequest('/api/questions'),
          apiRequest('/api/careers'),
        ])

        if (cancelled) return

        setQuestions(questionData)
        setCareers(careerData.length > 0 ? careerData : defaultCareers)
      } catch (error) {
        if (!cancelled) {
          setCatalogError(error.message)
        }
      } finally {
        if (!cancelled) {
          setIsCatalogLoading(false)
        }
      }
    }

    loadCatalog()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setScores(null)
      setRecommendedCareers([])
      setResultSubmittedAt(null)
      return
    }

    let cancelled = false

    async function loadLatestResult() {
      try {
        const result = await apiRequest(`/api/assessments/latest/${user.id}`)

        if (cancelled) return

        const availableCareers = careers.length > 0 ? careers : defaultCareers
        const nextRecommendations = resolveRecommendations(
          result.recommendedCareers,
          result.scores,
          availableCareers,
        )

        setScores(result.scores)
        setRecommendedCareers(nextRecommendations)
        setResultSubmittedAt(result.submittedAt)
      } catch (error) {
        if (cancelled) return

        if (error.message === 'No assessment result found for this user.') {
          setScores(null)
          setRecommendedCareers([])
          setResultSubmittedAt(null)
          return
        }

        setCatalogError(error.message)
      }
    }

    loadLatestResult()

    return () => {
      cancelled = true
    }
  }, [user?.id, careers])

  async function authenticate(endpoint, payload) {
    setIsAuthLoading(true)

    try {
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const normalizedUser = {
        ...response,
        role: response.role?.toLowerCase() || 'student',
      }

      setUser(normalizedUser)
      return normalizedUser
    } finally {
      setIsAuthLoading(false)
    }
  }

  function login({ email, password, role }) {
    return authenticate('/api/auth/login', { email, password, role: role?.toUpperCase() })
  }

  function signup({ name, email, password }) {
    return authenticate('/api/auth/signup', { name, email, password })
  }

  function logout() {
    setUser(null)
    setScores(null)
    setRecommendedCareers([])
    setResultSubmittedAt(null)
  }

  async function saveAssessment(answers) {
    if (!user?.id) {
      throw new Error('Please log in before submitting the assessment.')
    }

    setIsAssessmentSaving(true)

    try {
      const result = await apiRequest('/api/assessments/submit', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          answers: Object.fromEntries(
            Object.entries(answers).map(([questionId, value]) => [questionId, Number(value)]),
          ),
        }),
      })

      const availableCareers = careers.length > 0 ? careers : defaultCareers
      const nextRecommendations = resolveRecommendations(
        result.recommendedCareers,
        result.scores,
        availableCareers,
      )

      setScores(result.scores)
      setRecommendedCareers(nextRecommendations)
      setResultSubmittedAt(result.submittedAt)
      return result
    } finally {
      setIsAssessmentSaving(false)
    }
  }

  async function upsertQuestion(newQuestion) {
    setIsAdminSaving(true)

    try {
      const existing = questions.some((question) => question.id === newQuestion.id)
      const savedQuestion = await apiRequest(
        existing ? `/api/admin/questions/${newQuestion.id}` : '/api/admin/questions',
        {
          method: existing ? 'PUT' : 'POST',
          body: JSON.stringify(newQuestion),
        },
      )

      setQuestions((prev) => {
        const existingIndex = prev.findIndex((question) => question.id === savedQuestion.id)
        if (existingIndex === -1) {
          return [...prev, savedQuestion]
        }

        const updated = [...prev]
        updated[existingIndex] = savedQuestion
        return updated
      })

      return savedQuestion
    } finally {
      setIsAdminSaving(false)
    }
  }

  async function deleteQuestion(id) {
    setIsAdminSaving(true)

    try {
      await apiRequest(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      })

      setQuestions((prev) => prev.filter((question) => question.id !== id))
    } finally {
      setIsAdminSaving(false)
    }
  }

  async function upsertCareer(newCareer) {
    setIsAdminSaving(true)

    try {
      const existing = careers.some((career) => career.id === newCareer.id)
      const savedCareer = await apiRequest(
        existing ? `/api/admin/careers/${newCareer.id}` : '/api/admin/careers',
        {
          method: existing ? 'PUT' : 'POST',
          body: JSON.stringify(newCareer),
        },
      )

      setCareers((prev) => {
        const existingIndex = prev.findIndex((career) => career.id === savedCareer.id)
        if (existingIndex === -1) {
          return [...prev, savedCareer]
        }

        const updated = [...prev]
        updated[existingIndex] = savedCareer
        return updated
      })

      return savedCareer
    } finally {
      setIsAdminSaving(false)
    }
  }

  async function deleteCareer(id) {
    setIsAdminSaving(true)

    try {
      await apiRequest(`/api/admin/careers/${id}`, {
        method: 'DELETE',
      })

      setCareers((prev) => prev.filter((career) => career.id !== id))
      setRecommendedCareers((prev) => prev.filter((career) => career.id !== id))
    } finally {
      setIsAdminSaving(false)
    }
  }

  const value = {
    user,
    questions,
    careers,
    scores,
    recommendedCareers,
    resultSubmittedAt,
    isCatalogLoading,
    catalogError,
    isAuthLoading,
    isAssessmentSaving,
    isAdminSaving,
    login,
    signup,
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
