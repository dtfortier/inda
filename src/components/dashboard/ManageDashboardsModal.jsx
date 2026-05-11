import { useState, useRef, useEffect } from 'react'
import './ManageDashboardsModal.css'

/* ── Icons ─────────────────────────────────────────────────── */

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)

/* ── Inline rename input ───────────────────────────────────── */

function RenameInput({ value, onSave, onCancel }) {
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select() }, [])

  const handleKey = (e) => {
    if (e.key === 'Enter') { if (draft.trim()) onSave(draft.trim()); else onCancel() }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="mdm-rename-row">
      <input
        ref={inputRef}
        className="mdm-rename-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKey}
        maxLength={80}
      />
      <button
        className="mdm-rename-save"
        onClick={() => { if (draft.trim()) onSave(draft.trim()) }}
        disabled={!draft.trim()}
        aria-label="Save name"
      >
        <CheckIcon />
      </button>
      <button className="mdm-rename-cancel" onClick={onCancel} aria-label="Cancel rename">
        <CloseIcon />
      </button>
    </div>
  )
}

/* ── Single dashboard row ──────────────────────────────────── */

function DashboardRow({ dashboard, isActive, isOnly, onSwitch, onRename, onDuplicate, onDelete }) {
  const [renaming, setRenaming]     = useState(false)
  const [confirming, setConfirming] = useState(false)

  const handleSaveRename = (newName) => {
    onRename(dashboard.id, newName)
    setRenaming(false)
  }

  const handleDelete = () => {
    onDelete(dashboard.id)
    setConfirming(false)
  }

  const scopeCount = Object.values(dashboard.config?.scope || {}).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0
  )

  return (
    <div className={`mdm-row${isActive ? ' mdm-row--active' : ''}`}>
      <div className="mdm-row-main">
        {/* Icon + name */}
        <div className="mdm-row-icon"><GridIcon /></div>

        <div className="mdm-row-info">
          {renaming ? (
            <RenameInput
              value={dashboard.name}
              onSave={handleSaveRename}
              onCancel={() => setRenaming(false)}
            />
          ) : (
            <div className="mdm-row-name-line">
              <button
                className="mdm-row-name"
                onClick={() => onSwitch(dashboard.id)}
                title="Switch to this dashboard"
              >
                {dashboard.name}
              </button>
              {isActive && <span className="mdm-active-badge">Active</span>}
            </div>
          )}
          {scopeCount > 0 && !renaming && (
            <div className="mdm-row-meta">{scopeCount} scope filter{scopeCount !== 1 ? 's' : ''} applied</div>
          )}
        </div>

        {/* Actions */}
        {!renaming && !confirming && (
          <div className="mdm-row-actions">
            <button
              className="mdm-action-btn"
              onClick={() => setRenaming(true)}
              aria-label="Rename dashboard"
              title="Rename"
            >
              <EditIcon />
            </button>
            <button
              className="mdm-action-btn"
              onClick={() => onDuplicate(dashboard.id)}
              aria-label="Duplicate dashboard"
              title="Duplicate"
            >
              <CopyIcon />
            </button>
            <button
              className={`mdm-action-btn mdm-action-btn--danger${isOnly ? ' mdm-action-btn--disabled' : ''}`}
              onClick={() => !isOnly && setConfirming(true)}
              aria-label="Delete dashboard"
              title={isOnly ? "Can't delete the only dashboard" : "Delete"}
              disabled={isOnly}
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>

      {/* Inline delete confirmation */}
      {confirming && (
        <div className="mdm-confirm">
          <span className="mdm-confirm-text">Delete "{dashboard.name}"? This can't be undone.</span>
          <div className="mdm-confirm-actions">
            <button className="mdm-confirm-btn mdm-confirm-btn--cancel" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button className="mdm-confirm-btn mdm-confirm-btn--delete" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main modal ────────────────────────────────────────────── */

export default function ManageDashboardsModal({
  isOpen, onClose,
  dashboards, activeDashboardId,
  onRename, onDuplicate, onDelete, onSwitch,
}) {
  if (!isOpen) return null

  const handleSwitch = (id) => {
    onSwitch(id)
    onClose()
  }

  return (
    <div className="mdm-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="mdm-modal" role="dialog" aria-modal="true" aria-label="Manage dashboards">

        <div className="mdm-header">
          <div className="mdm-header-text">
            <h1 className="mdm-header-title">Manage dashboards</h1>
            <p className="mdm-header-subtitle">Rename, duplicate, or delete your dashboards.</p>
          </div>
          <button className="mdm-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>

        <div className="mdm-body">
          {dashboards.length === 0 ? (
            <p className="mdm-empty">No dashboards yet.</p>
          ) : (
            <ul className="mdm-list">
              {dashboards.map(d => (
                <li key={d.id}>
                  <DashboardRow
                    dashboard={d}
                    isActive={d.id === activeDashboardId}
                    isOnly={dashboards.length === 1}
                    onSwitch={handleSwitch}
                    onRename={onRename}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mdm-footer">
          <button className="mdm-btn mdm-btn--primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
