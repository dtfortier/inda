import { useState } from 'react'
import { createPortal } from 'react-dom'
import DataTable from './DataTable.jsx'
import './WidgetModal.css'

export default function WidgetModal({ title, onClose, children, filters, methodology, aiSummary, tableData }) {
  const [activeTab, setActiveTab] = useState('chart')
  const [methodologyOpen, setMethodologyOpen] = useState(false)

  const summaryText = aiSummary || 'This summary is powered by IgniteAI and reflects the latest state of this widget. Please note that the output may not always be accurate.'

  function handleDownload() {
    if (!tableData) return
    const { columns, rows } = tableData
    const csv = [
      columns.join(','),
      ...rows.map(row => columns.map(col => `"${row[col]}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_export.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-content-area">
          {filters && (
            <div className="modal-filters-row">
              {[...filters].sort((a, b) => (a.type === 'toggle' ? -1 : 0) - (b.type === 'toggle' ? -1 : 0)).map((f, i) => (
                f.type === 'toggle' ? (
                  <label key={i} className="modal-filter modal-filter-toggle">
                    <span className="modal-filter-label">{f.label}</span>
                    <span className="modal-toggle">
                      <input type="checkbox" defaultChecked={f.defaultChecked ?? false} />
                      <span className="modal-toggle-track"><span className="modal-toggle-thumb" /></span>
                    </span>
                  </label>
                ) : (
                  <div key={i} className="modal-filter">
                    <label className="modal-filter-label">{f.label}</label>
                    <select className="modal-filter-select">
                      {f.options.map((opt, j) => (
                        <option key={j}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )
              ))}
            </div>
          )}

          <div className="modal-tabs">
            <button
              className={`modal-tab ${activeTab === 'chart' ? 'active' : ''}`}
              onClick={() => setActiveTab('chart')}
            >
              Chart
            </button>
            <button
              className={`modal-tab ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => setActiveTab('table')}
            >
              Data Table
            </button>
            <div className="modal-tab-border" />
          </div>

          <div className={`modal-body ${activeTab === 'chart' ? 'is-chart' : 'is-table'}`}>
            {activeTab === 'chart' ? (
              children
            ) : tableData ? (
              <DataTable columns={tableData.columns} rows={tableData.rows} />
            ) : (
              <div className="modal-table-placeholder">No data available</div>
            )}
          </div>

          <div className="modal-insight">
            <div className="modal-insight-icon">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                <path d="M10 0L12.7009 7.29909L20 10L12.7009 12.7009L10 20L7.29909 12.7009L0 10L7.29909 7.29909L10 0Z" fill="url(#ai-star-grad-modal)" />
                <defs>
                  <linearGradient id="ai-star-grad-modal" x1="-4.96" y1="-4.09" x2="-0.08" y2="32.07" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9E58BD" />
                    <stop offset="1" stopColor="#37A1AA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className="modal-insight-text">{summaryText}</p>
          </div>

          {methodology && (
            <div className={`modal-methodology${methodologyOpen ? ' open' : ''}`}>
              <button
                type="button"
                className="modal-methodology-toggle"
                aria-expanded={methodologyOpen}
                onClick={() => setMethodologyOpen(v => !v)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span>How this data is calculated</span>
                <svg className="modal-methodology-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="modal-methodology-body">
                <p className="modal-methodology-text">{methodology}</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-btn secondary" onClick={handleDownload}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download CSV
          </button>
          <button className="modal-btn primary">Go To Dashboard</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
