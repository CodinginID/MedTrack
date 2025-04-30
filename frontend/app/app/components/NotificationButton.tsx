'use client'
import { useState } from 'react'
import { useQueue } from '../context/QueueContext'

export default function NotificationButton({ queueId }: { queueId: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { sendNotification } = useQueue()

  const handleSendNotification = async () => {
    setLoading(true)
    setSuccess(false)
    try {
      await sendNotification(queueId)
      setSuccess(true)
    } catch (error) {
      console.error('Failed to send notification:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleSendNotification}
        disabled={loading}
        className={`px-4 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {loading ? 'Mengirim...' : 'Kirim Notifikasi WhatsApp'}
      </button>
      {success && (
        <p className="mt-2 text-green-600">Notifikasi berhasil dikirim!</p>
      )}
    </div>
  )
}