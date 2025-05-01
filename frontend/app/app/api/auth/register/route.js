import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json()
  
    // Validasi input
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ 
        error: 'Semua field harus diisi' 
      }, { status: 400 })
    }

    // Kirim request ke backend
    const response = await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        phone
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        error: errorData.detail || 'Registrasi gagal'
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // Buat user object dari response
    const user = {
      id: data.id || Math.random().toString(36).substring(2, 9),
      name,
      email,
      phone,
      role: 'patient'
    }
    
    // Generate token untuk frontend
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' })
    
    return NextResponse.json({ 
      user,
      token: data.access_token || token,
      message: 'Registrasi berhasil'
    })

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: 'Gagal terhubung ke server'
    }, { status: 500 });
  }
}