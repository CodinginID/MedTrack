'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const QueueContext = createContext()

export const QueueProvider = ({ children }) => {
  const [currentQueue, setCurrentQueue] = useState(null)
  const [queues, setQueues] = useState([])
  const [schedules, setSchedules] = useState([])

  const generateQueue = async (patientData) => {
    try {
      const response = await fetch('/api/queue/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(patientData),
      })
      const data = await response.json()
      if (response.ok) {
        setQueues([...queues, data.queue])
        return data.queue
      }
      throw new Error(data.message || 'Failed to generate queue')
    } catch (error) {
      console.error('Queue generation error:', error)
      throw error
    }
  }

  const getSchedules = async () => {
    try {
      const response = await fetch('/api/queue/schedule', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setSchedules(data.schedules)
        return data.schedules
      }
      throw new Error(data.message || 'Failed to get schedules')
    } catch (error) {
      console.error('Schedule fetch error:', error)
      throw error
    }
  }

  const sendNotification = async (queueId) => {
    try {
      const response = await fetch('/api/queue/notify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ queueId }),
      })
      const data = await response.json()
      if (response.ok) {
        return data
      }
      throw new Error(data.message || 'Failed to send notification')
    } catch (error) {
      console.error('Notification error:', error)
      throw error
    }
  }

  return (
    <QueueContext.Provider value={{ 
      currentQueue, 
      queues, 
      schedules, 
      generateQueue, 
      getSchedules, 
      sendNotification 
    }}>
      {children}
    </QueueContext.Provider>
  )
}

export const useQueue = () => useContext(QueueContext)