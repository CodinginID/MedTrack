import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  const { email, password } = await request.json()
  
  // Ini contoh sederhana, seharusnya validasi dengan database
  if (email === 'admin@klinik.com' && password === 'admin123') {
    const user = {
      id: '1',
      name: 'Admin Klinik',
      email: 'admin@klinik.com',
      role: 'admin',
      phone: '6281234567890'
    }
    
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' })
    
    return NextResponse.json({ 
      user, 
      token,
      message: 'Login berhasil' 
    })
  } else if (email === 'pasien@example.com' && password === 'pasien123') {
    const user = {
      id: '2',
      name: 'Pasien Contoh',
      email: 'pasien@example.com',
      role: 'patient',
      phone: '6289876543210'
    }
    
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' })
    
    return NextResponse.json({ 
      user, 
      token,
      message: 'Login berhasil' 
    })
  }
  
  return NextResponse.json({ 
    error: 'Email atau password salah' 
  }, { status: 401 })
}