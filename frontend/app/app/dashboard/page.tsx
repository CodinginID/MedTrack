'use client'
import { useState, useEffect, useRef } from 'react'
import ServiceSelection from '../components/ServiceSelection'
import DoctorSelection from '../components/DoctorSelection'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext' //
import Modal from '../components/Modal'

// Definisikan tipe untuk Service dan Doctor
interface Service {
  id: number
  name: string
}

interface Doctor {
  id: number
  name: string
  schedule: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth() // tambahkan user dari context
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [queueInfo, setQueueInfo] = useState<{
    queueNumber: string;
    serviceName: string;
    doctorName: string;
  } | null>(null)
  
   // Redirect jika tidak ada user yang login
   useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // ... (other handler functions remain the same)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleViewProfile = () => {
    // Implement your profile view logic here
    alert(`Viewing profile of ${user?.name}`)
    setShowDropdown(false)
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setError(null)
    setStep(2)
  }

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setError(null)
    setStep(3)
  }

  const handleBack = () => {
    setStep(step - 1)
    setError(null)
    if (step === 2) {
      setSelectedService(null)
    }
  }

  const handleGetQueue = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!selectedService || !selectedDoctor) {
        throw new Error('Silakan pilih layanan dan dokter terlebih dahulu')
      }

      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/queue/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          doctorId: selectedDoctor.id
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengambil nomor antrian')
      }

      // Tampilkan konfirmasi berhasil
      // alert(`Nomor Antrian: ${data.queueNumber}\nLayanan: ${selectedService?.name}\nDokter: ${selectedDoctor?.name}`)

      // Set queue info dan tampilkan modal
      setQueueInfo({
        queueNumber: data.queueNumber,
        serviceName: selectedService.name,
        doctorName: selectedDoctor.name
      })
      setShowModal(true)
      
      // Reset form setelah modal ditutup
      setStep(1)
      setSelectedService(null)
      setSelectedDoctor(null)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Pendaftaran Berobat</h2>
          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="text-right">
              <p className="text-gray-900">Selamat datang,</p>
              <p className="text-gray-900 font-medium">{user?.name || 'Tamu'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {user?.name?.charAt(0).toUpperCase() || 'G'}
            </div>
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={handleViewProfile}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['Pilih Layanan', 'Pilih Dokter', 'Konfirmasi'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step > index ? 'bg-green-500' : step === index + 1 ? 'bg-indigo-600' : 'bg-gray-300'
              } text-white`}>
                {step > index ? '✓' : index + 1}
              </div>
              <span className="ml-2 text-sm">{label}</span>
              {index < 2 && <div className="h-1 w-16 mx-4 bg-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {step === 1 && (
        <ServiceSelection onServiceSelect={handleServiceSelect} />
      )}
      
      {step === 2 && (
        <>
          <DoctorSelection 
            serviceId={selectedService?.id || 0}
            onDoctorSelect={handleDoctorSelect}
          />
          <button
            onClick={handleBack}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            ← Kembali ke pilih layanan
          </button>
        </>
      )}
      
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg text-black">
            <h3 className="font-medium text-lg mb-4">Ringkasan Pendaftaran:</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Layanan:</span> {selectedService?.name}</p>
              <p><span className="font-medium">Dokter:</span> {selectedDoctor?.name}</p>
              <p><span className="font-medium">Jadwal:</span> {selectedDoctor?.schedule}</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Kembali
            </button>
            <button
              onClick={handleGetQueue}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Ambil Nomor Antrian'}
            </button>
          </div>
        </div>
      )}

<Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nomor Antrian Anda"
      >
        {queueInfo && (
          <div className="space-y-2">
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-indigo-600 text-black">{queueInfo.queueNumber}</p>
            </div>
            <div className="border-t pt-3 text-black">
              <p><span className="font-medium">Layanan:</span> {queueInfo.serviceName}</p>
              <p><span className="font-medium">Dokter:</span> {queueInfo.doctorName}</p>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-black">
              Silakan tunggu panggilan dari petugas kami
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}