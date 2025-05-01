'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  // Reset password visibility when email changes
  useEffect(() => {
    if (!email) {
      setShowPassword(false)
      setPassword('')
    }
  }, [email])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Gagal masuk. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            TechCare
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (e.target.value.includes('@')) {
                  setShowPassword(true)
                } else {
                  setShowPassword(false)
                }
              }}
            />
          </div>

          <div className={`transition-all duration-300 ease-in-out ${showPassword ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required={showPassword}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Ingat saya
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500">
                Lupa password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !showPassword}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Atau</span>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {/* Implementasi login Google */}}
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
              />
              Google
            </button>

            <Link
              href="/register"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-purple-600 hover:bg-gray-50"
            >
              Daftar Sekarang
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}