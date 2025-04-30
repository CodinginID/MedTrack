import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  try {
    jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Contoh data jadwal
  const schedules = [
    {
      id: '1',
      doctorName: 'Dr. Ahmad',
      day: 'Senin',
      time: '08:00 - 12:00',
      quota: 20
    },
    {
      id: '2',
      doctorName: 'Dr. Budi',
      day: 'Selasa',
      time: '13:00 - 17:00',
      quota: 15
    }
  ]
  
  return NextResponse.json({ schedules })
}