'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Topic {
  id: string
  nameUz: string
  nameEn: string
}

export default function EditTopic({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState({
    nameUz: '',
    nameEn: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [topic, setTopic] = useState<Topic | null>(null)

  useEffect(() => {
    fetchTopic()
  }, [id])

  const fetchTopic = async () => {
    try {
      const response = await fetch(`/api/topics/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTopic(data)
        setFormData({
          nameUz: data.nameUz,
          nameEn: data.nameEn
        })
      } else {
        alert('Topic not found')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching topic:', error)
      alert('Failed to load topic')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating topic:', error)
      alert('Failed to update topic')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Topic</h1>
            <div className="flex space-x-4">
              <Link
                href={`/admin/topics/${id}/questions`}
                className="text-blue-600 hover:text-blue-800"
              >
                Manage Questions
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nameUz" className="block text-sm font-medium text-gray-700">
                Topic Name (Uzbek)
              </label>
              <input
                type="text"
                id="nameUz"
                name="nameUz"
                required
                value={formData.nameUz}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Mavzu nomi (Oʻzbekcha)"
              />
            </div>

            <div>
              <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700">
                Topic Name (English)
              </label>
              <input
                type="text"
                id="nameEn"
                name="nameEn"
                required
                value={formData.nameEn}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Topic Name (English)"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/admin"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Updating...' : 'Update Topic'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
