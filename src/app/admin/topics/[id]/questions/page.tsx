'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'

interface Topic {
  id: string
  nameUz: string
  nameEn: string
}

interface Question {
  id: string
  nameUz: string
  nameEn: string
  optionsUz: string
  optionsEn: string
  broadcasted: boolean
  createdAt: string
  _count: {
    answers: number
  }
}

export default function TopicQuestions({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [topicRes, questionsRes] = await Promise.all([
        fetch(`/api/topics/${id}`),
        fetch(`/api/questions?topicId=${id}`)
      ])

      if (topicRes.ok) {
        const topicData = await topicRes.json()
        setTopic(topicData)
      }

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json()
        setQuestions(questionsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This will also delete all related answers.')) {
      return
    }

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData()
      } else {
        alert('Failed to delete question')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question')
    }
  }

  const broadcastQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to broadcast this question to all users?')) {
      return
    }

    try {
      const response = await fetch(`/api/questions/${questionId}/broadcast`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Question broadcasted successfully!')
        await fetchData()
      } else {
        const error = await response.json()
        alert(`Failed to broadcast: ${error.error}`)
      }
    } catch (error) {
      console.error('Error broadcasting question:', error)
      alert('Failed to broadcast question')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Topic not found</h1>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
              <p className="text-gray-600">
                {topic.nameUz} / {topic.nameEn}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href={`/admin/topics/${id}/questions/new`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Question
              </Link>
              <Link
                href={`/admin/topics/${id}/edit`}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit Topic
              </Link>
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Questions ({questions.length})
            </h2>
          </div>

          {questions.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 mb-4">No questions found for this topic.</p>
              <Link
                href={`/admin/topics/${id}/questions/new`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add First Question
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question (Uzbek)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question (English)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Options
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Answers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question) => {
                    const optionsUz = JSON.parse(question.optionsUz)
                    const optionsEn = JSON.parse(question.optionsEn)
                    
                    return (
                      <tr key={question.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {question.nameUz}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {question.nameEn}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="space-y-1">
                            <div><strong>UZ:</strong> {optionsUz.join(', ')}</div>
                            <div><strong>EN:</strong> {optionsEn.join(', ')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {question._count.answers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {question.broadcasted ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Broadcasted
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              Not Broadcasted
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/topics/${id}/questions/${question.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                            {!question.broadcasted && (
                              <button
                                onClick={() => broadcastQuestion(question.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Broadcast
                              </button>
                            )}
                            <button
                              onClick={() => deleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
