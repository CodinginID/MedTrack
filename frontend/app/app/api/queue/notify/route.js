import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  let user
  try {
    user = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { queueId } = await request.json()
  
  // Di sini seharusnya mengintegrasikan dengan API WhatsApp seperti Twilio
  // Ini hanya simulasi
  console.log(`Mengirim notifikasi WhatsApp ke ${user.phone} untuk antrian ${queueId}`)
  
  return NextResponse.json({ 
    success: true,
    message: 'Notifikasi WhatsApp berhasil dikirim'
  })
}