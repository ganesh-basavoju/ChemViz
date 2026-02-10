import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2'
import '../styles/DatasetView.css'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
)

const CHART_COLORS = [
  '#e87200', '#2196f3', '#00bcd4', '#4caf50',
  '#ff9a3c', '#9c27b0', '#ef5350', '#ffc107'
]

function DatasetView({ dataset, onDownloadReport, onDelete }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const typeLabels = Object.keys(dataset.type_distribution)
  const typeCounts = Object.values(dataset.type_distribution)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sortedEquipment = [...dataset.equipment].sort((a, b) => {
    if (!sortField) return 0
    const aVal = a[sortField]
    const bVal = b[sortField]
    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal
  })

  const distributionData = {
    labels: typeLabels,
    datasets: [{
      data: typeCounts,
      backgroundColor: CHART_COLORS.slice(0, typeLabels.length),
      borderColor: '#1a2234',
      borderWidth: 2,
    }]
  }

  const barData = {
    labels: typeLabels,
    datasets: [
      {
        label: 'Avg Flowrate',
        data: typeLabels.map(t => dataset.type_averages[t]?.avg_flowrate || 0),
        backgroundColor: 'rgba(232, 114, 0, 0.7)',
        borderColor: '#e87200',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Avg Pressure',
        data: typeLabels.map(t => dataset.type_averages[t]?.avg_pressure || 0),
        backgroundColor: 'rgba(33, 150, 243, 0.7)',
        borderColor: '#2196f3',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Avg Temperature',
        data: typeLabels.map(t => dataset.type_averages[t]?.avg_temperature || 0),
        backgroundColor: 'rgba(0, 188, 212, 0.7)',
        borderColor: '#00bcd4',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  }

  const equipmentNames = dataset.equipment.map(e => e.equipment_name)
  const lineData = {
    labels: equipmentNames,
    datasets: [
      {
        label: 'Flowrate',
        data: dataset.equipment.map(e => e.flowrate),
        borderColor: '#e87200',
        backgroundColor: 'rgba(232, 114, 0, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Pressure (x10)',
        data: dataset.equipment.map(e => e.pressure * 10),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Temperature',
        data: dataset.equipment.map(e => e.temperature),
        borderColor: '#00bcd4',
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }

  const radarData = {
    labels: typeLabels,
    datasets: [
      {
        label: 'Avg Flowrate',
        data: typeLabels.map(t => dataset.type_averages[t]?.avg_flowrate || 0),
        backgroundColor: 'rgba(232, 114, 0, 0.2)',
        borderColor: '#e87200',
        pointBackgroundColor: '#e87200',
      },
      {
        label: 'Avg Temperature',
        data: typeLabels.map(t => dataset.type_averages[t]?.avg_temperature || 0),
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        borderColor: '#00bcd4',
        pointBackgroundColor: '#00bcd4',
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#8899b0', font: { family: 'Outfit' } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#5a6b82', font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: 'rgba(42, 58, 82, 0.3)' }
      },
      y: {
        ticks: { color: '#5a6b82', font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: 'rgba(42, 58, 82, 0.3)' }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8899b0', font: { family: 'Outfit' }, padding: 16 }
      }
    }
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#8899b0', font: { family: 'Outfit' } }
      }
    },
    scales: {
      r: {
        ticks: { color: '#5a6b82', backdropColor: 'transparent' },
        grid: { color: 'rgba(42, 58, 82, 0.4)' },
        angleLines: { color: 'rgba(42, 58, 82, 0.4)' },
        pointLabels: { color: '#8899b0', font: { family: 'JetBrains Mono', size: 11 } }
      }
    }
  }

  return (
    <div className="dataset-view">
      <div className="dataset-header fade-in-up stagger-1">
        <div>
          <h2 className="section-title">{dataset.filename}</h2>
          <p className="section-desc">
            Uploaded {new Date(dataset.uploaded_at).toLocaleString()} · {dataset.total_count} equipment entries
          </p>
        </div>
        <div className="dataset-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onDownloadReport(dataset.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF Report
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(dataset.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="tab-bar fade-in-up stagger-2">
        {['overview', 'charts', 'table'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="overview-grid fade-in-up stagger-3">
          <div className="stat-card">
            <div className="stat-card-icon orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{dataset.total_count}</span>
              <span className="stat-card-label">Total Equipment</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{dataset.avg_flowrate}</span>
              <span className="stat-card-label">Avg Flowrate</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon cyan">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="16" />
              </svg>
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{dataset.avg_pressure}</span>
              <span className="stat-card-label">Avg Pressure</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{dataset.avg_temperature}</span>
              <span className="stat-card-label">Avg Temperature</span>
            </div>
          </div>

          <div className="chart-card span-2">
            <h3 className="chart-title">Equipment Type Distribution</h3>
            <div className="chart-container doughnut">
              <Doughnut data={distributionData} options={doughnutOptions} />
            </div>
          </div>

          <div className="chart-card span-2">
            <h3 className="chart-title">Parameter Comparison by Type</h3>
            <div className="chart-container">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="charts-grid fade-in-up stagger-3">
          <div className="chart-card full-width">
            <h3 className="chart-title">Equipment Parameter Trends</h3>
            <div className="chart-container wide">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Type Distribution</h3>
            <div className="chart-container doughnut">
              <Doughnut data={distributionData} options={doughnutOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Parameter Radar</h3>
            <div className="chart-container doughnut">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          <div className="chart-card full-width">
            <h3 className="chart-title">Average Parameters by Equipment Type</h3>
            <div className="chart-container wide">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'table' && (
        <div className="table-section fade-in-up stagger-3">
          <div className="table-wrap scrollbar-custom">
            <table className="data-table">
              <thead>
                <tr>
                  {[
                    { key: 'equipment_name', label: 'Equipment Name' },
                    { key: 'equipment_type', label: 'Type' },
                    { key: 'flowrate', label: 'Flowrate' },
                    { key: 'pressure', label: 'Pressure' },
                    { key: 'temperature', label: 'Temperature' },
                  ].map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)} className="sortable">
                      {col.label}
                      {sortField === col.key && (
                        <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedEquipment.map((e) => (
                  <tr key={e.id}>
                    <td className="name-cell">{e.equipment_name}</td>
                    <td>
                      <span className={`type-badge type-${e.equipment_type.toLowerCase()}`}>
                        {e.equipment_type}
                      </span>
                    </td>
                    <td className="mono">{e.flowrate.toFixed(1)}</td>
                    <td className="mono">{e.pressure.toFixed(1)}</td>
                    <td className="mono">{e.temperature.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatasetView
