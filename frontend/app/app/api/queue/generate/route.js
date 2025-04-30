import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

let queues = []
let lastQueueNumber = 0

export async function POST(request) {
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

  const { patientId, serviceType } = await request.json()
  
  lastQueueNumber++
  const queue = {
    id: `Q-${Date.now()}`,
    number: lastQueueNumber,
    patientId,
    serviceType,
    createdAt: new Date().toISOString(),
    status: 'waiting'
  }
  
  queues.push(queue)
  
  return NextResponse.json({ 
    queue,
    message: 'Antrian berhasil dibuat' 
  })
}