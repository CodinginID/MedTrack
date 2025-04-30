import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  const { name, email, phone, password } = await request.json()
  
  // Validasi sederhana
  if (!name || !email || !phone || !password) {
    return NextResponse.json({ 
      error: 'Semua field harus diisi' 
    }, { status: 400 })
  }
  
  // Simulasi penyimpanan user
  const user = {
    id: Math.random().toString(36).substring(2, 9),
    name,
    email,
    phone,
    role: 'patient'
  }
  
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' })
  
  return NextResponse.json({ 
    user, 
    token,
    message: 'Registrasi berhasil' 
  })
}