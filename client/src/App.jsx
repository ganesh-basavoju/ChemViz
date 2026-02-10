import { useState, useEffect } from 'react'
import axios from 'axios'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/auth/status')
      if (res.data.authenticated) {
        setUser(res.data.user)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-container">
          <div className="reactor-spinner">
            <div className="reactor-core"></div>
            <div className="reactor-ring ring-1"></div>
            <div className="reactor-ring ring-2"></div>
            <div className="reactor-ring ring-3"></div>
          </div>
          <p className="loading-text">Initializing Systems...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return <Dashboard user={user} />
}

export default App
