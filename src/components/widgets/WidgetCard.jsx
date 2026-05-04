import { useState } from 'react'
import WidgetModal from './WidgetModal.jsx'
import './WidgetCard.css'

export default function WidgetCard({ title, source, insight, children, modalContent, modalFilters, modalMethodology, modalAiSummary, modalTableData }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="widget-card">
        <div className="widget-inner">
          <div className="widget-title-row">
            <div className="widget-title-text">
              <h2 className="widget-title">{title}</h2>
              <p className="widget-source">Source: {source || 'Canvas Admin Analytics'}</p>
            </div>
            <button className="widget-menu-btn" aria-label="More options">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>

          <div className="widget-body">
            {children}
          </div>

          {insight && (
            <div className="widget-insight">
              <div className="widget-insight-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 0L12.7009 7.29909L20 10L12.7009 12.7009L10 20L7.29909 12.7009L0 10L7.29909 7.29909L10 0Z" fill="url(#ai-star-grad)" />
                  <defs>
                    <linearGradient id="ai-star-grad" x1="-4.96" y1="-4.09" x2="-0.08" y2="32.07" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#9E58BD" />
                      <stop offset="1" stopColor="#37A1AA" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <p className="widget-insight-text">{insight}</p>
            </div>
          )}

          <div className="widget-footer">
            <span className="widget-updated">Updated 2h ago</span>
            <button className="widget-view-details" onClick={() => setModalOpen(true)}>
              Dive deeper
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <WidgetModal
          title={title}
          onClose={() => setModalOpen(false)}
          filters={modalFilters}
          methodology={modalMethodology}
          aiSummary={modalAiSummary}
          tableData={modalTableData}
        >
          {modalContent || children}
        </WidgetModal>
      )}
    </>
  )
}
