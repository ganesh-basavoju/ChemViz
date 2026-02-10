import { useState } from 'react'
import axios from 'axios'
import '../styles/LandingPage.css'

function LandingPage({ authMode, onLogin }) {
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const payload = isRegister ? { email, password, name } : { email, password }
      const res = await axios.post(endpoint, payload)
      if (res.data.success) {
        onLogin(res.data.user)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGetStarted = () => {
    if (authMode === 'replit') {
      window.location.href = '/auth/login'
    } else {
      setShowAuthForm(true)
    }
  }

  return (
    <div className="landing">
      <div className="landing-grid-bg"></div>
      <div className="landing-glow"></div>

      <nav className="landing-nav fade-in-up stagger-1">
        <div className="nav-brand">
          <span className="brand-icon">&#9879;&#65039;</span>
          <span className="brand-text">ChemViz</span>
        </div>
        {authMode === 'replit' ? (
          <a href="/auth/login" className="btn btn-primary">
            Sign In
          </a>
        ) : (
          <button onClick={() => { setShowAuthForm(true); setIsRegister(false); }} className="btn btn-primary">
            Sign In
          </button>
        )}
      </nav>

      <main className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge fade-in-up stagger-2">
            <span className="badge-dot"></span>
            Chemical Equipment Analytics
          </div>

          <h1 className="hero-title fade-in-up stagger-3">
            Visualize Your
            <br />
            <span className="hero-highlight">Equipment Data</span>
          </h1>

          <p className="hero-subtitle fade-in-up stagger-4">
            Upload CSV datasets of chemical equipment parameters.
            Get instant analytics with interactive charts, summary statistics,
            and downloadable PDF reports.
          </p>

          <div className="hero-actions fade-in-up stagger-5">
            <button onClick={handleGetStarted} className="btn btn-primary btn-lg">
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="hero-stats fade-in-up stagger-6">
            <div className="stat-item">
              <span className="stat-value">5</span>
              <span className="stat-label">Dataset History</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">4+</span>
              <span className="stat-label">Chart Types</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">PDF</span>
              <span className="stat-label">Report Export</span>
            </div>
          </div>
        </div>

        <div className="hero-visual fade-in-up stagger-4">
          <div className="visual-card">
            <div className="visual-header">
              <div className="visual-dots">
                <span></span><span></span><span></span>
              </div>
              <span className="visual-title">equipment_analysis.csv</span>
            </div>
            <div className="visual-content">
              <div className="visual-row header-row">
                <span>Name</span><span>Type</span><span>Flow</span><span>Pres</span><span>Temp</span>
              </div>
              <div className="visual-row"><span>Pump-1</span><span>Pump</span><span>120</span><span>5.2</span><span>110</span></div>
              <div className="visual-row"><span>Comp-1</span><span>Compressor</span><span>95</span><span>8.4</span><span>95</span></div>
              <div className="visual-row"><span>Valve-1</span><span>Valve</span><span>60</span><span>4.1</span><span>105</span></div>
              <div className="visual-row"><span>HX-1</span><span>HeatExchgr</span><span>150</span><span>6.2</span><span>130</span></div>
              <div className="visual-row"><span>React-1</span><span>Reactor</span><span>140</span><span>7.5</span><span>140</span></div>
            </div>
            <div className="visual-bar-chart">
              <div className="bar-group">
                <div className="bar" style={{height: '65%'}}></div>
                <span>Pump</span>
              </div>
              <div className="bar-group">
                <div className="bar bar-alt" style={{height: '40%'}}></div>
                <span>Comp</span>
              </div>
              <div className="bar-group">
                <div className="bar bar-cyan" style={{height: '50%'}}></div>
                <span>Valve</span>
              </div>
              <div className="bar-group">
                <div className="bar bar-green" style={{height: '35%'}}></div>
                <span>HX</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{height: '30%'}}></div>
                <span>React</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAuthForm && authMode === 'local' && (
        <div className="auth-modal-overlay" onClick={() => setShowAuthForm(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={() => setShowAuthForm(false)}>&times;</button>
            <h2 className="auth-modal-title">{isRegister ? 'Create Account' : 'Sign In'}</h2>
            <p className="auth-modal-subtitle">
              {isRegister ? 'Join ChemViz to start analyzing your equipment data' : 'Welcome back to ChemViz'}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {isRegister && (
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="form-input"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <p className="auth-toggle">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="auth-toggle-btn">
                {isRegister ? 'Sign In' : 'Create one'}
              </button>
            </p>
          </div>
        </div>
      )}

      <footer className="landing-footer fade-in stagger-6">
        <p>Chemical Equipment Parameter Visualizer</p>
      </footer>
    </div>
  )
}

export default LandingPage
