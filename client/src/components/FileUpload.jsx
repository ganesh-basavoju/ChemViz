import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import '../styles/FileUpload.css'

function FileUpload({ onUpload, uploading }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    disabled: uploading
  })

  return (
    <div className="upload-view fade-in-up stagger-3">
      <div className="upload-header">
        <h2 className="section-title">Upload Dataset</h2>
        <p className="section-desc">
          Upload a CSV file with columns: Equipment Name, Type, Flowrate, Pressure, Temperature
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          {uploading ? (
            <>
              <div className="upload-spinner">
                <div className="reactor-core small"></div>
                <div className="reactor-ring ring-1 small"></div>
              </div>
              <p className="dropzone-title">Processing...</p>
              <p className="dropzone-sub">Analyzing equipment data</p>
            </>
          ) : isDragActive ? (
            <>
              <div className="drop-icon active">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="dropzone-title">Drop it here!</p>
            </>
          ) : (
            <>
              <div className="drop-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <p className="dropzone-title">Drag & drop your CSV file</p>
              <p className="dropzone-sub">or click to browse files</p>
              <div className="dropzone-hint">
                <span className="hint-tag">.csv</span>
                <span>Supports standard CSV format</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="upload-format-info">
        <h3 className="format-title">Expected CSV Format</h3>
        <div className="format-table-wrap">
          <table className="format-table">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Type</th>
                <th>Flowrate</th>
                <th>Pressure</th>
                <th>Temperature</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pump-1</td>
                <td>Pump</td>
                <td>120</td>
                <td>5.2</td>
                <td>110</td>
              </tr>
              <tr>
                <td>Compressor-1</td>
                <td>Compressor</td>
                <td>95</td>
                <td>8.4</td>
                <td>95</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FileUpload
