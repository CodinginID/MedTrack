'use client'
import { useAuth } from '../context/AuthContext'
import { useQueue } from '../context/QueueContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import NotificationButton from '../components/NotificationButton'

export default function AdminPage() {
  const { user, loading, logout } = useAuth()
  const { currentQueue, queues, getSchedules, sendNotification } = useQueue()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
    getSchedules()
  }, [user, loading, router, getSchedules])

  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  const handleNextQueue = () => {
    // Implementasi logika untuk memindahkan ke antrian berikutnya
    console.log('Moving to next queue')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Admin: {user.name}</span>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Antrian Saat Ini</h2>
            {currentQueue ? (
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-4xl font-bold text-center">{currentQueue.number}</p>
                <p className="text-center">Layanan: {currentQueue.serviceType}</p>
                <NotificationButton queueId={currentQueue.id} />
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada antrian saat ini</p>
            )}
            <button
              onClick={handleNextQueue}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Panggil Antrian Berikutnya
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Daftar Antrian</h2>
            {queues.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {queues.map((queue: { id: string; number: string; serviceType: string }) => (
                  <li key={queue.id} className="py-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">No. {queue.number}</span>
                      <span className="text-sm text-gray-500">{queue.serviceType}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Belum ada antrian</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}