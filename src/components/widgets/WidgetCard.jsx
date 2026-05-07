import { useState } from 'react'
import WidgetModal from './WidgetModal.jsx'
import './WidgetCard.css'

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

/* WidgetCard — used on both the saved dashboard (read-only with a
   "Dive deeper" footer) and inside Customize (edit mode: drag handle,
   remove X, "Edit widget" footer, drag-and-drop hooks). */
export default function WidgetCard({
  title,
  source,
  insight,
  children,
  modalContent,
  modalFilters,
  modalMethodology,
  modalAiSummary,
  modalTableData,
  /* Edit mode */
  editMode = false,
  onEdit,
  onRemove,
  /* Drag (only meaningful in edit mode) */
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  dropBefore = false,
  dropAfter = false,
}) {
  const [modalOpen, setModalOpen] = useState(false)

  const className = [
    'widget-card',
    editMode ? 'edit-mode' : '',
    isDragging ? 'is-dragging' : '',
    dropBefore ? 'drop-before' : '',
    dropAfter ? 'drop-after' : '',
  ].filter(Boolean).join(' ')

  /* When in edit mode, the dragging happens on the whole card; the
     `draggable` attribute and DnD listeners are passed through. */
  const dragProps = editMode
    ? {
        draggable,
        onDragStart,
        onDragOver,
        onDrop,
        onDragEnd,
      }
    : {}

  return (
    <>
      <div className={className} {...dragProps}>
        <div className="widget-inner">
          <div className="widget-title-row">
            {editMode && (
              <span className="widget-grip" aria-hidden="true">
                <GripIcon />
              </span>
            )}
            <div className="widget-title-text">
              <h2 className="widget-title">{title}</h2>
              <p className="widget-source">Source: {source || 'Canvas Admin Analytics'}</p>
            </div>
            {editMode ? (
              <button
                type="button"
                className="widget-remove-btn"
                aria-label={`Remove ${title}`}
                onClick={onRemove}
                /* Stop drag from initiating when clicking the X. */
                onMouseDown={(e) => e.stopPropagation()}
                draggable={false}
              >
                <XIcon />
              </button>
            ) : (
              <button className="widget-menu-btn" aria-label="More options">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            )}
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
            {editMode ? (
              <button
                type="button"
                className="widget-edit-btn"
                onClick={onEdit}
                onMouseDown={(e) => e.stopPropagation()}
                draggable={false}
              >
                <PencilIcon />
                Edit widget
              </button>
            ) : (
              <button className="widget-view-details" onClick={() => setModalOpen(true)}>
                Dive deeper
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {modalOpen && !editMode && (
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
