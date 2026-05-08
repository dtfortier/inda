import { useState, useEffect, useRef } from 'react'
import './ManageDashboardsModal.css'

/* ── icons ─────────────────────────────────────────────────── */
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

/* ── single row ──────────────────────────────────────────── */
function DashboardRow({
  dashboard,
  isActive,
  isOnly,
  onRename,
  onDuplicate,
  onDelete,
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(dashboard.name)
  const [confirming, setConfirming] = useState(false)
  const inputRef = useRef(null)

  /* When editing flips on, focus + select the input so the user can
     immediately type or overwrite. */
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const startEditing = () => {
    setDraft(dashboard.name)
    setEditing(true)
  }

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== dashboard.name) {
      onRename(dashboard.id, trimmed)
    }
    setEditing(false)
  }

  const cancel = () => {
    setDraft(dashboard.name)
    setEditing(false)
  }

  return (
    <div className={`mdm-row${isActive ? ' active' : ''}`}>
      <span className="mdm-row-icon" aria-hidden="true"><GridIcon /></span>

      <div className="mdm-row-name">
        {editing ? (
          <input
            ref={inputRef}
            className="mdm-row-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') cancel()
            }}
            maxLength={80}
            aria-label={`Rename ${dashboard.name}`}
          />
        ) : (
          <button
            type="button"
            className="mdm-row-name-btn"
            onClick={startEditing}
            title="Click to rename"
          >
            {dashboard.name}
          </button>
        )}
        {isActive && <span className="mdm-row-tag">Active</span>}
      </div>

      {confirming ? (
        <div className="mdm-row-confirm" role="alertdialog">
          <span className="mdm-row-confirm-text">Delete this dashboard?</span>
          <button
            type="button"
            className="mdm-confirm-btn danger"
            onClick={() => {
              onDelete(dashboard.id)
              setConfirming(false)
            }}
          >
            Delete
          </button>
          <button
            type="button"
            className="mdm-confirm-btn ghost"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="mdm-row-actions">
          <button
            type="button"
            className="mdm-icon-btn"
            onClick={startEditing}
            aria-label={`Rename ${dashboard.name}`}
            title="Rename"
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            className="mdm-icon-btn"
            onClick={() => onDuplicate(dashboard.id)}
            aria-label={`Duplicate ${dashboard.name}`}
            title="Duplicate"
          >
            <CopyIcon />
          </button>
          <button
            type="button"
            className="mdm-icon-btn danger"
            onClick={() => setConfirming(true)}
            disabled={isOnly}
            aria-label={`Delete ${dashboard.name}`}
            title={isOnly ? 'You need at least one dashboard' : 'Delete'}
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── modal ─────────────────────────────────────────────────── */
export default function ManageDashboardsModal({
  isOpen,
  dashboards,
  activeDashboardId,
  onRename,
  onDuplicate,
  onDelete,
  onClose,
}) {
  if (!isOpen) return null

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const isOnly = dashboards.length <= 1

  return (
    <div className="mdm-backdrop" onMouseDown={handleBackdrop} role="presentation">
      <div className="mdm-modal" role="dialog" aria-modal="true" aria-labelledby="mdm-title">
        <header className="mdm-header">
          <div className="mdm-header-text">
            <h2 id="mdm-title" className="mdm-title">Manage dashboards</h2>
            <p className="mdm-subtitle">
              Rename, duplicate, or delete the dashboards in your workspace.
            </p>
          </div>
          <button type="button" className="mdm-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <div className="mdm-body">
          <div className="mdm-list" role="list">
            {dashboards.map((d) => (
              <DashboardRow
                key={d.id}
                dashboard={d}
                isActive={d.id === activeDashboardId}
                isOnly={isOnly}
                onRename={onRename}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            ))}
          </div>
          {isOnly && (
            <p className="mdm-hint">
              You always need at least one dashboard. Duplicate this one before deleting.
            </p>
          )}
        </div>

        <footer className="mdm-footer">
          <button type="button" className="mdm-btn primary" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}
