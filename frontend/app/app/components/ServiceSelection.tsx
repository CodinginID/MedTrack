'use client'
import { useState, useEffect } from 'react'

export default function ServiceSelection({ onServiceSelect }: { onServiceSelect: (service: { id: number; name: string }) => void }) {
  const [selectedService, setSelectedService] = useState('')
  
  const [services, setServices] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:8000/services')
        const result = await response.json()
        if (result.status && result.data) {
          // Map services sesuai dengan jenis_layanan di database
          const mappedServices = result.data.map((serviceName: string) => ({
            id: serviceName, // Gunakan nama layanan sebagai id
            name: serviceName
          }))
          setServices(mappedServices)
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }

    fetchServices()
  }, [])

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