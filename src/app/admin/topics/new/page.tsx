'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewTopic() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nameUz: '',
    nameEn: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
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
      console.error('Error creating topic:', error)
      alert('Failed to create topic')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Add New Topic</h1>
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Topic'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
