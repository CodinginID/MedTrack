'use client'
import { useState } from 'react'

export default function DoctorSelection({ serviceId, onDoctorSelect }: { serviceId: number, onDoctorSelect: (doctor: { id: number, name: string, serviceId: number, schedule: string }) => void }) {
  const [selectedDoctor, setSelectedDoctor] = useState('')
  
  const doctors = [
    { id: 1, name: 'dr. Ahmad', serviceId: 1, schedule: '08:00 - 14:00' },
    { id: 2, name: 'dr. Budi', serviceId: 1, schedule: '14:00 - 20:00' },
    { id: 3, name: 'drg. Citra', serviceId: 2, schedule: '09:00 - 15:00' },
    { id: 4, name: 'dr. Diana, Sp.PD', serviceId: 3, schedule: '10:00 - 16:00' },
  ]

  const availableDoctors = doctors.filter(doctor => doctor.serviceId === serviceId)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pilih Dokter</h3>
      <div className="grid grid-cols-1 gap-4">
        {availableDoctors.map((doctor) => (
          <button
            key={doctor.id}
            onClick={() => {
              setSelectedDoctor(doctor.id.toString())
              onDoctorSelect(doctor)
            }}
            className={`p-4 border rounded-lg ${
              selectedDoctor === doctor.id.toString()
                ? 'bg-indigo-600 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-900'
            }`}
          >
            <div className="text-left">
              <p className="font-medium">{doctor.name}</p>
              <p className="text-sm">Jam Praktik: {doctor.schedule}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}