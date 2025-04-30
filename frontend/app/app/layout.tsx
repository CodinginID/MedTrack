import { AuthProvider } from './context/AuthContext'
import { QueueProvider } from './context/QueueContext'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QueueProvider>
            {children}
          </QueueProvider>
        </AuthProvider>
      </body>
    </html>
  )
}