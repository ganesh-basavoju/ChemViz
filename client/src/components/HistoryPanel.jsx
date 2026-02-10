import '../styles/HistoryPanel.css'

function HistoryPanel({ datasets, onView, onDelete, onDownloadReport }) {
  if (datasets.length === 0) {
    return (
      <div className="history-view fade-in-up stagger-3">
        <div className="history-header">
          <h2 className="section-title">Upload History</h2>
          <p className="section-desc">Your last 5 uploaded datasets are stored here</p>
        </div>
        <div className="history-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p>No datasets uploaded yet</p>
          <span>Upload a CSV file to get started</span>
        </div>
      </div>
    )
  }

  return (
    <div className="history-view fade-in-up stagger-3">
      <div className="history-header">
        <h2 className="section-title">Upload History</h2>
        <p className="section-desc">Showing your last {datasets.length} dataset{datasets.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="history-list">
        {datasets.map((ds, idx) => (
          <div key={ds.id} className={`history-card fade-in-up stagger-${idx + 1}`}>
            <div className="history-card-main">
              <div className="history-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="history-card-info">
                <h3>{ds.filename}</h3>
                <span className="history-date">
                  {new Date(ds.uploaded_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="history-card-stats">
              <div className="mini-stat">
                <span className="mini-stat-value">{ds.total_count}</span>
                <span className="mini-stat-label">Items</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">{ds.avg_flowrate}</span>
                <span className="mini-stat-label">Avg Flow</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">{ds.avg_pressure}</span>
                <span className="mini-stat-label">Avg Pres</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">{ds.avg_temperature}</span>
                <span className="mini-stat-label">Avg Temp</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">{Object.keys(ds.type_distribution).length}</span>
                <span className="mini-stat-label">Types</span>
              </div>
            </div>

            <div className="history-card-actions">
              <button className="btn btn-primary btn-sm" onClick={() => onView(ds.id)}>
                View Details
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => onDownloadReport(ds.id)}>
                PDF
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(ds.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistoryPanel
