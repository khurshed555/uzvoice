'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalTopics: number
  totalQuestions: number
  totalAnswers: number
}

interface Topic {
  id: string
  nameUz: string
  nameEn: string
  questions: any[]
  _count: {
    questions: number
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTopics: 0,
    totalQuestions: 0,
    totalAnswers: 0
  })
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('admin-token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    setIsAuthenticated(true)
    fetchStats()
    fetchTopics()
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin-token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [usersRes, topicsRes, questionsRes] = await Promise.all([
        fetch('/api/users', { headers }),
        fetch('/api/topics', { headers }),
        fetch('/api/questions', { headers })
      ])

      const users = await usersRes.json()
      const topicsData = await topicsRes.json()
      const questions = await questionsRes.json()

      const totalAnswers = users.reduce((sum: number, user: any) => sum + user._count.answers, 0)

      setStats({
        totalUsers: users.length,
        totalTopics: topicsData.length,
        totalQuestions: questions.length,
        totalAnswers
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch('/api/topics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      
      const data = await response.json()
      setTopics(data)
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('admin-token')
      router.push('/admin/login')
    }
  }

  const deleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? This will also delete all its questions.')) {
      return
    }

    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchTopics()
        fetchStats()
      } else {
        alert('Failed to delete topic')
      }
    } catch (error) {
      console.error('Error deleting topic:', error)
      alert('Failed to delete topic')
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">UzVoice Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Topics</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTopics}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalQuestions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0v2a2 2 0 002 2h2a2 2 0 002-2v-2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0V3a2 2 0 012-2h2a2 2 0 012 2v2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Answers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAnswers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/topics/new"
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="font-semibold mb-1">Add New Topic</h3>
            <p className="text-blue-100 text-sm">Create a new topic for surveys</p>
          </Link>
          
          <div className="bg-green-600 text-white p-6 rounded-lg text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-semibold mb-1">Analytics</h3>
            <p className="text-green-100 text-sm">View response analytics</p>
          </div>
          
          <div className="bg-purple-600 text-white p-6 rounded-lg text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="font-semibold mb-1">Users</h3>
            <p className="text-purple-100 text-sm">Manage bot users</p>
          </div>
        </div>
        
        {/* Topics Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Topics Management</h2>
              <div className="flex space-x-3">
                <Link 
                  href="/admin/topics/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Topic
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic (Uzbek)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic (English)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topics.map((topic) => (
                  <tr key={topic.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {topic.nameUz}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic.nameEn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic._count.questions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <Link
                          href={`/admin/topics/${topic.id}/questions`}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                        >
                          Questions ({topic._count.questions})
                        </Link>
                        <Link
                          href={`/admin/topics/${topic.id}/questions/new`}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                        >
                          + Add Question
                        </Link>
                        <Link
                          href={`/admin/topics/${topic.id}/edit`}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteTopic(topic.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
