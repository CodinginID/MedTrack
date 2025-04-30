'use client'
import { useState } from 'react'

export default function ServiceSelection({ onServiceSelect }: { onServiceSelect: (service: { id: number; name: string }) => void }) {
  const [selectedService, setSelectedService] = useState('')
  
  const services = [
    { id: 1, name: 'Pemeriksaan Umum' },
    { id: 2, name: 'Pemeriksaan Gigi' },
    { id: 3, name: 'Konsultasi Spesialis' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pilih Layanan</h3>
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => {
              setSelectedService(service.id.toString())
              onServiceSelect(service)
            }}
            className={`p-4 border rounded-lg ${
              selectedService === service.id.toString()
                ? 'bg-indigo-600 text-white'
                : 'bg-white hover:bg-gray-50 text-black'
            }`}
          >
            {service.name}
          </button>
        ))}
      </div>
    </div>
  )
}