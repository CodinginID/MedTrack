'use client'
import { useState, useEffect } from 'react'

export default function DoctorSelection({ serviceId, onDoctorSelect }: { serviceId: number, onDoctorSelect: (doctor: { id: number, name: string, serviceId: number, schedule: string }) => void }) {
  const [selectedDoctor, setSelectedDoctor] = useState('')
  
  const [doctors, setDoctors] = useState<Array<{
    id: number;
    nama: string;
    jenis_layanan: string;
    spesialisasi: string;
    jam_praktek: string;
    is_active: boolean;
  }>>([])

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`http://localhost:8000/doctors/search/${serviceId}?skip=0&limit=100`)
        if (!response.ok) {
          throw new Error('Failed to fetch doctors')
        }
        const result = await response.json()
        setDoctors(result.data) // Mengambil array doctors dari property data
      } catch (error) {
        console.error('Error fetching doctors:', error)
        setDoctors([])
      }
    }

    if (serviceId) {
      fetchDoctors()
    }
  }, [serviceId])

  // Menyesuaikan filter dengan struktur data yang baru
  const availableDoctors = doctors.filter(doctor => doctor.jenis_layanan === serviceId.toString())

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pilih Dokter</h3>
      <div className="grid grid-cols-1 gap-4">
        {availableDoctors.map((doctor) => (
          <button
            key={doctor.id}
            onClick={() => {
              setSelectedDoctor(doctor.id.toString())
              onDoctorSelect({
                id: doctor.id,
                name: doctor.nama,
                serviceId: parseInt(doctor.jenis_layanan),
                schedule: doctor.jam_praktek
              })
            }}
            className={`p-4 border rounded-lg ${
              selectedDoctor === doctor.id.toString()
                ? 'bg-indigo-600 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-900'
            }`}
          >
            <div className="text-left">
              <p className="font-medium font-bold">{doctor.nama}</p>
              <p className="font-medium">{doctor.spesialisasi}</p>
              <p className="text-sm">Jam Praktik: {doctor.jam_praktek}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}