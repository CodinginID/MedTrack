'use client'
import { useState } from 'react'
import Link from 'next/link'

interface AuthFormProps {
    isLogin?: boolean
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    loading: boolean
    email: string
    setEmail: (value: string) => void
    password: string
    setPassword: (value: string) => void
    name?: string
    setName?: (value: string) => void
    phone?: string
    setPhone?: (value: string) => void
  }
  
  interface FormErrors {
    email?: string
    password?: string
    name?: string
    phone?: string
}

export default function AuthForm({ 
  isLogin = false,
  onSubmit,
  loading,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  phone,
  setPhone
} : AuthFormProps) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    
    if (!email) (newErrors as {email?: string}).email = 'Email harus diisi'
    else if (!/\S+@\S+\.\S+/.test(email)) (newErrors as {email?: string}).email = 'Email tidak valid'
    
    if (!password) (newErrors as {password?: string}).password = 'Password harus diisi'
    else if (password.length < 6) (newErrors as {password?: string}).password = 'Password minimal 6 karakter'
    
    if (!isLogin) {
      if (!name) (newErrors as {name?: string}).name = 'Nama harus diisi'
      if (!phone) (newErrors as {phone?: string}).phone = 'Nomor telepon harus diisi'
      else if (!/^[0-9]+$/.test(phone)) (newErrors as {phone?: string}).phone = 'Nomor telepon harus angka'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(e)
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm space-y-4">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border ${(errors as {name?: string}).name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black`}
              value={name}
              onChange={(e) => setName?.(e.target.value)}
            />
            {(errors as {name?: string}).name && <p className="mt-1 text-sm text-red-600">{(errors as {name?: string}).name}</p>}
          </div>
        )}

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
            className={`mt-1 block w-full px-3 py-2 border ${(errors as {email?: string}).email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {(errors as {email?: string}).email && <p className="mt-1 text-sm text-red-600">{(errors as {email?: string}).email}</p>}
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Nomor Telepon (WhatsApp)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className={`mt-1 block w-full px-3 py-2 border ${(errors as {phone?: string}).phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              value={phone}
              onChange={(e) => setPhone?.(e.target.value)}
            />
            {(errors as {phone?: string}).phone && <p className="mt-1 text-sm text-red-600">{(errors as {phone?: string}).phone}</p>}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            className={`mt-1 block w-full px-3 py-2 border ${(errors as {password?: string}).password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {(errors as {password?: string}).password && <p className="mt-1 text-sm text-red-600">{(errors as {password?: string}).password}</p>}
        </div>
      </div>

      {isLogin && (
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
            <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Lupa password?
            </Link>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </>
          ) : isLogin ? 'Masuk' : 'Daftar'}
        </button>
      </div>
    </form>
  )
}