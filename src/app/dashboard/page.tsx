'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import Link from 'next/link'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Topic {
  id: string
  nameUz: string
  nameEn: string
  questions: Question[]
  _count: {
    questions: number
  }
}

interface Question {
  id: string
  nameUz: string
  nameEn: string
  _count: {
    answers: number
  }
}

interface QuestionAnalytics {
  question: {
    id: string
    nameUz: string
    nameEn: string
    topic: {
      nameUz: string
      nameEn: string
    }
  }
  options: {
    uz: string[]
    en: string[]
  }
  data: Array<{
    optionIndex: number
    optionUz: string
    optionEn: string
    count: number
  }>
  totalAnswers: number
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get('lang') || 'uz') as 'uz' | 'en'
  
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [analytics, setAnalytics] = useState<QuestionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/dashboard/topics')
      if (response.ok) {
        const data = await response.json()
        setTopics(data)
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestionAnalytics = async (questionId: string) => {
    setAnalyticsLoading(true)
    try {
      const response = await fetch(`/api/dashboard/question/${questionId}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    setSelectedQuestion(null)
    setAnalytics(null)
  }

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question)
    fetchQuestionAnalytics(question.id)
  }

  const generateChartData = (analytics: QuestionAnalytics) => {
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#FF6384',
      '#36A2EB'
    ]

    return {
      labels: analytics.data.map(item => 
        lang === 'uz' ? item.optionUz : item.optionEn
      ),
      datasets: [
        {
          data: analytics.data.map(item => item.count),
          backgroundColor: colors.slice(0, analytics.data.length),
          borderColor: colors.slice(0, analytics.data.length),
          borderWidth: 2,
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }

  const getText = (textUz: string, textEn: string) => {
    return lang === 'uz' ? textUz : textEn
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {lang === 'uz' ? 'UzVoice Dashboard' : 'UzVoice Dashboard'}
              </h1>
              <span className="text-lg">
                {lang === 'uz' ? '🇺🇿' : '🇺🇸'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard?lang=${lang === 'uz' ? 'en' : 'uz'}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {lang === 'uz' ? '🇺🇸 English' : '🇺🇿 O\'zbekcha'}
              </Link>
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700"
              >
                ← {lang === 'uz' ? 'Bosh sahifa' : 'Home'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Topics Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {lang === 'uz' ? 'Mavzular' : 'Topics'}
              </h2>
              <div className="space-y-2">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTopic?.id === topic.id
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">
                      {getText(topic.nameUz, topic.nameEn)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {topic._count.questions} {lang === 'uz' ? 'savol' : 'questions'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-4">
            {selectedTopic ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {lang === 'uz' ? 'Savollar' : 'Questions'}
                </h2>
                <div className="space-y-3">
                  {selectedTopic.questions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => handleQuestionSelect(question)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedQuestion?.id === question.id
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="font-medium mb-2">
                        {lang === 'uz' ? 'Savol' : 'Question'} {index + 1}
                      </div>
                      <div className="text-sm line-clamp-2">
                        {getText(question.nameUz, question.nameEn)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {question._count.answers} {lang === 'uz' ? 'javob' : 'answers'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <p className="text-lg">
                  {lang === 'uz' 
                    ? 'Savollarni ko\'rish uchun mavzu tanlang'
                    : 'Select a topic to view questions'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Analytics Chart */}
          <div className="lg:col-span-5">
            {analytics ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {lang === 'uz' ? 'Javob statistikasi' : 'Answer Statistics'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {getText(analytics.question.topic.nameUz, analytics.question.topic.nameEn)} • {' '}
                    {getText(analytics.question.nameUz, analytics.question.nameEn)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {lang === 'uz' ? 'Jami javoblar:' : 'Total answers:'} {analytics.totalAnswers}
                  </p>
                </div>
                
                {analytics.totalAnswers > 0 ? (
                  <div className="h-96 flex items-center justify-center">
                    <Pie data={generateChartData(analytics)} options={chartOptions} />
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <p className="text-lg mb-2">📊</p>
                      <p>
                        {lang === 'uz' 
                          ? 'Hali javob berilmagan'
                          : 'No answers yet'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : analyticsLoading ? (
              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : selectedQuestion ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <p>
                  {lang === 'uz' 
                    ? 'Ma\'lumotlar yuklanmoqda...'
                    : 'Loading analytics...'
                  }
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <p className="text-lg">
                  {lang === 'uz' 
                    ? 'Statistikani ko\'rish uchun savol tanlang'
                    : 'Select a question to view analytics'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
