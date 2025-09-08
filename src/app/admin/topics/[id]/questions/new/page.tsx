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

export default function NewQuestion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [formData, setFormData] = useState({
    nameUz: '',
    nameEn: '',
    optionsUz: ['', ''],
    optionsEn: ['', ''],
    broadcast: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTopic()
  }, [id])

  const fetchTopic = async () => {
    try {
      const response = await fetch(`/api/topics/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTopic(data)
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

    // Validate options
    const validOptionsUz = formData.optionsUz.filter(option => option.trim())
    const validOptionsEn = formData.optionsEn.filter(option => option.trim())

    if (validOptionsUz.length < 2 || validOptionsEn.length < 2) {
      alert('Please provide at least 2 options for both languages')
      setSaving(false)
      return
    }

    if (validOptionsUz.length !== validOptionsEn.length) {
      alert('Number of options must be the same for both languages')
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nameUz: formData.nameUz,
          nameEn: formData.nameEn,
          optionsUz: validOptionsUz,
          optionsEn: validOptionsEn,
          topicId: id,
          broadcast: formData.broadcast
        })
      })

      if (response.ok) {
        router.push(`/admin/topics/${id}/questions`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating question:', error)
      alert('Failed to create question')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleOptionChange = (language: 'uz' | 'en', index: number, value: string) => {
    const optionsKey = language === 'uz' ? 'optionsUz' : 'optionsEn'
    const newOptions = [...formData[optionsKey]]
    newOptions[index] = value
    
    setFormData({
      ...formData,
      [optionsKey]: newOptions
    })
  }

  const addOption = () => {
    setFormData({
      ...formData,
      optionsUz: [...formData.optionsUz, ''],
      optionsEn: [...formData.optionsEn, '']
    })
  }

  const removeOption = (index: number) => {
    if (formData.optionsUz.length <= 2) return // Keep at least 2 options
    
    const newOptionsUz = formData.optionsUz.filter((_, i) => i !== index)
    const newOptionsEn = formData.optionsEn.filter((_, i) => i !== index)
    
    setFormData({
      ...formData,
      optionsUz: newOptionsUz,
      optionsEn: newOptionsEn
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Question</h1>
              <p className="text-gray-600">
                {topic.nameUz} / {topic.nameEn}
              </p>
            </div>
            <Link
              href={`/admin/topics/${id}/questions`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Questions
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nameUz" className="block text-sm font-medium text-gray-700">
                Question Text (Uzbek)
              </label>
              <textarea
                id="nameUz"
                name="nameUz"
                required
                value={formData.nameUz}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Savol matni (Oʻzbekcha)"
              />
            </div>

            <div>
              <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700">
                Question Text (English)
              </label>
              <textarea
                id="nameEn"
                name="nameEn"
                required
                value={formData.nameEn}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Question Text (English)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Answer Options
              </label>
              
              <div className="space-y-4">
                {formData.optionsUz.map((optionUz, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Option {index + 1} (Uzbek)
                      </label>
                      <input
                        type="text"
                        required
                        value={optionUz}
                        onChange={(e) => handleOptionChange('uz', index, e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        placeholder={`Variant ${index + 1} (Oʻzbekcha)`}
                      />
                    </div>
                    <div className="flex">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Option {index + 1} (English)
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.optionsEn[index]}
                          onChange={(e) => handleOptionChange('en', index, e.target.value)}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                          placeholder={`Option ${index + 1} (English)`}
                        />
                      </div>
                      {formData.optionsUz.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="ml-2 mt-6 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addOption}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                + Add Another Option
              </button>
            </div>

            <div className="flex items-center">
              <input
                id="broadcast"
                name="broadcast"
                type="checkbox"
                checked={formData.broadcast}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="broadcast" className="ml-2 block text-sm text-gray-900">
                Broadcast this question to all users immediately after creation
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href={`/admin/topics/${id}/questions`}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Creating...' : 'Create Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
