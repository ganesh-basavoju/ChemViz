import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import FileUpload from './FileUpload'
import DatasetView from './DatasetView'
import HistoryPanel from './HistoryPanel'
import '../styles/Dashboard.css'

function Dashboard({ user }) {
  const [datasets, setDatasets] = useState([])
  const [activeDataset, setActiveDataset] = useState(null)
  const [activeView, setActiveView] = useState('upload')
  const [uploading, setUploading] = useState(false)

  const fetchDatasets = useCallback(async () => {
    try {
      const res = await axios.get('/api/datasets')
      setDatasets(res.data)
    } catch (err) {
      console.error('Failed to fetch datasets:', err)
    }
  }, [])

  useEffect(() => {
    fetchDatasets()
  }, [fetchDatasets])

  const handleUpload = async (file) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.success) {
        await fetchDatasets()
        handleViewDataset(res.data.dataset_id)
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed'
      alert(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleViewDataset = async (datasetId) => {
    try {
      const res = await axios.get(`/api/datasets/${datasetId}`)
      setActiveDataset(res.data)
      setActiveView('dataset')
    } catch (err) {
      console.error('Failed to load dataset:', err)
    }
  }

  const handleDeleteDataset = async (datasetId) => {
    if (!confirm('Delete this dataset?')) return
    try {
      await axios.delete(`/api/datasets/${datasetId}/delete`)
      if (activeDataset?.id === datasetId) {
        setActiveDataset(null)
        setActiveView('upload')
      }
      await fetchDatasets()
    } catch (err) {
      console.error('Failed to delete dataset:', err)
    }
  }

  const handleDownloadReport = (datasetId) => {
    window.open(`/api/datasets/${datasetId}/report`, '_blank')
  }

  const displayName = user.first_name || user.email?.split('@')[0] || 'User'

  return (
    <div className="dashboard">
      <header className="dash-header fade-in-up stagger-1">
        <div className="dash-header-left">
          <div className="dash-brand">
            <span className="brand-icon">⚗️</span>
            <span className="brand-text">ChemViz</span>
          </div>
        </div>
        <div className="dash-header-right">
          <div className="user-info">
            {user.profile_image_url && (
              <img src={user.profile_image_url} alt="" className="user-avatar" />
            )}
            <span className="user-name">{displayName}</span>
          </div>
          <a href="/auth/logout" className="btn btn-secondary btn-sm">
            Sign Out
          </a>
        </div>
      </header>

      <div className="dash-layout">
        <aside className="dash-sidebar fade-in-up stagger-2">
          <nav className="sidebar-nav">
            <button
              className={`sidebar-item ${activeView === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveView('upload')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload CSV
            </button>

            {activeDataset && (
              <button
                className={`sidebar-item ${activeView === 'dataset' ? 'active' : ''}`}
                onClick={() => setActiveView('dataset')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                Active Dataset
              </button>
            )}

            <button
              className={`sidebar-item ${activeView === 'history' ? 'active' : ''}`}
              onClick={() => setActiveView('history')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              History
              {datasets.length > 0 && (
                <span className="sidebar-badge">{datasets.length}</span>
              )}
            </button>
          </nav>

          {datasets.length > 0 && (
            <div className="sidebar-recent">
              <h4 className="sidebar-section-title">Recent Uploads</h4>
              {datasets.slice(0, 3).map((ds) => (
                <button
                  key={ds.id}
                  className={`recent-item ${activeDataset?.id === ds.id ? 'active' : ''}`}
                  onClick={() => handleViewDataset(ds.id)}
                >
                  <span className="recent-name">{ds.filename}</span>
                  <span className="recent-count">{ds.total_count} items</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="dash-main">
          {activeView === 'upload' && (
            <FileUpload onUpload={handleUpload} uploading={uploading} />
          )}
          {activeView === 'dataset' && activeDataset && (
            <DatasetView
              dataset={activeDataset}
              onDownloadReport={handleDownloadReport}
              onDelete={handleDeleteDataset}
            />
          )}
          {activeView === 'history' && (
            <HistoryPanel
              datasets={datasets}
              onView={handleViewDataset}
              onDelete={handleDeleteDataset}
              onDownloadReport={handleDownloadReport}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
