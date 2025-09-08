'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">UzVoice</h1>
            <p className="text-gray-600">Survey Analytics Dashboard</p>
          </div>

          {/* Language Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Choose Language / Tilni tanlang
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <Link
                href="/dashboard?lang=uz"
                className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">🇺🇿</span>
                  <span className="text-lg">O'zbekcha</span>
                </div>
                <p className="text-blue-100 text-sm mt-1 opacity-90 group-hover:opacity-100">
                  So'rovnoma natijalarini ko'rish
                </p>
              </Link>
              
              <Link
                href="/dashboard?lang=en"
                className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">🇺🇸</span>
                  <span className="text-lg">English</span>
                </div>
                <p className="text-green-100 text-sm mt-1 opacity-90 group-hover:opacity-100">
                  View survey results
                </p>
              </Link>
            </div>
          </div>

          {/* Admin Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/admin/login"
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
            >
              🔐 Admin Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
