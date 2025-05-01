import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  const { email, password } = await request.json()
  
  try {
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        error: errorData.detail || 'Login gagal'
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    // Membuat user object dari data response
    const user = {
      email: email,
      token: data.access_token
    }
    
    // Membuat token JWT untuk frontend
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' })
    
    return NextResponse.json({ 
      user,
      token: data.access_token,
      message: 'Login berhasil'
    })

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Gagal terhubung ke server autentikasi'
    }, { status: 500 });
  }
}