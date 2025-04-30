'use client'
import { useEffect } from 'react'
import { useQueue } from '../context/QueueContext'

export default function QueueDisplay() {
  const { currentQueue, queues, generateQueue, getSchedules } = useQueue()

  useEffect(() => {
    getSchedules()
  }, [])

  const handleGenerateQueue = async () => {
    try {
      await generateQueue({
        patientId: '123', // Ini bisa diganti dengan data pasien yang sesungguhnya
        serviceType: 'Umum', // Jenis layanan
      })
    } catch (error) {
      console.error('Error generating queue:', error)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Antrian Berobat</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Antrian Saat Ini</h3>
        {currentQueue ? (
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-3xl font-bold text-center">{currentQueue.number}</p>
            <p className="text-center">Layanan: {currentQueue.serviceType}</p>
          </div>
        ) : (
          <p className="text-gray-500">Tidak ada antrian saat ini</p>
        )}
      </div>

      <button
        onClick={handleGenerateQueue}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mb-6"
      >
        Ambil Nomor Antrian
      </button>

      <div>
        <h3 className="text-xl font-semibold mb-2">Daftar Antrian</h3>
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
  )
}