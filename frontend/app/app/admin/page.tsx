'use client'
import { useAuth } from '../context/AuthContext'
import { useQueue } from '../context/QueueContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NotificationButton from '../components/NotificationButton'

export default function AdminPage() {
  const { user, loading, logout } = useAuth()
  const { currentQueue, queues, getSchedules, sendNotification } = useQueue()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  // Filter antrian berdasarkan pencarian
  const filteredQueues = queues.filter((queue: { number: string; serviceType: string }) =>
    queue.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
    // Create speech synthesis for queue announcement
    const speak = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }

    // Get next queue and announce it
    if (queues.length > 0) {
      const nextQueue = queues[0];
      const announcementText = `Nomor antrian ${nextQueue.number}, silakan menuju ke ${nextQueue.serviceType}`;
      speak(announcementText);

      // Optional: Add delay before second announcement
      setTimeout(() => {
        const doctorAnnouncement = `dengan dokter ${nextQueue.doctorName}`;
        speak(doctorAnnouncement);
      }, 3000);
    } else {
      speak("Tidak ada antrian berikutnya");
    }
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
        <div className="px-4 py-6 sm:px-0 grid grid-cols-1 md:grid-cols-2 gap-6"></div>
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

        {/* Daftar Semua Antrian dengan Pencarian */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Daftar Semua Antrian</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nomor antrian atau layanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>


          {filteredQueues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nomor Antrian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Layanan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQueues.map((queue: { id: string; number: string; serviceType: string }) => (
                    <tr key={queue.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {queue.number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {queue.serviceType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Menunggu
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => sendNotification(queue.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Notifikasi
                        </button>
                        <button
                          onClick={() => handleNextQueue()}
                          className="text-green-600 hover:text-green-900"
                        >
                          Panggil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Tidak ada antrian yang sesuai dengan pencarian' : 'Belum ada antrian'}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}