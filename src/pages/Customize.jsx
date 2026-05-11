import { useState, useRef, useEffect } from 'react'
import EditScopeModal from '../components/dashboard/EditScopeModal.jsx'
import EditWidgetModal from '../components/widgets/EditWidgetModal.jsx'
import { renderRegistryWidget } from './Dashboard.jsx'
import { WIDGET_REGISTRY, DEFAULT_LAYOUT } from '../data/widgetRegistry.jsx'
import './Customize.css'

function GripIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
    </svg>
  )
}

/* ── Assignee picker ─────────────────────────────────────────── */
const ASSIGNABLE_USERS = [
  { id: 'myself',  label: 'Myself',         role: '' },
  { id: 'sarah',   label: 'Sarah Johnson',  role: 'Advisor · College of Science' },
  { id: 'miller',  label: 'Coach Miller',   role: 'Athletics · Basketball Program' },
  { id: 'wilson',  label: 'Dean Wilson',    role: 'Dean · College of Arts & Letters' },
  { id: 'garcia',  label: 'Maria Garcia',   role: 'Success Coach · First-Year Program' },
  { id: 'priya',   label: 'Priya Nair',     role: 'Faculty · Department of Biology' },
  { id: 'marcus',  label: 'Marcus Webb',    role: 'Dean · College of Business' },
]

const AssignedIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
)

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

function AudienceRow({ audience, onAudienceChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const isAssigned = audience && audience.id !== 'myself'
  const current = ASSIGNABLE_USERS.find(u => u.id === audience?.id) || ASSIGNABLE_USERS[0]

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="customize-audience-row" ref={ref}>
      {isAssigned && (
        <span className="customize-audience-label">
          <AssignedIcon />
          Assigned to <strong>{audience.label}</strong>
          {audience.role && <span className="customize-audience-role"> · {audience.role}</span>}
        </span>
      )}
      {!isAssigned && (
        <span className="customize-audience-label">
          <AssignedIcon />
          <span className="customize-audience-muted">Created for yourself</span>
        </span>
      )}
      <button
        className="customize-audience-edit-btn"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        Edit assignment <ChevronIcon />
      </button>

      {open && (
        <div className="customize-audience-dropdown">
          <div className="customize-audience-dropdown-label">Assign dashboard to</div>
          {ASSIGNABLE_USERS.map(u => (
            <button
              key={u.id}
              className={`customize-audience-option${u.id === current.id ? ' active' : ''}`}
              onClick={() => {
                onAudienceChange(u.id === 'myself'
                  ? { id: 'myself', label: 'Myself' }
                  : { id: u.id, label: u.label, role: u.role }
                )
                setOpen(false)
              }}
              type="button"
            >
              <span className="customize-audience-option-text">
                <span className="customize-audience-option-name">
                  {u.id === 'myself' ? 'Myself' : u.label}
                </span>
                {u.role && <span className="customize-audience-option-role">{u.role}</span>}
              </span>
              {u.id === current.id && <span className="customize-audience-option-check"><CheckIcon /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── CustomizeBoard ──────────────────────────────────────────── */
export function CustomizeBoard({ layout, onLayoutChange, onEditWidget, monitoring, display }) {
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(null)

  const startDrag = (source, id, index) => (e) => {
    setDrag({ source, id, index })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const endDrag = () => { setDrag(null); setOver(null) }

  const onCardDragOver = (column, index) => (e) => {
    if (!drag) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    const position = e.clientY - rect.top < rect.height / 2 ? 'before' : 'after'
    setOver({ column, index, position })
  }

  const onColumnDragOver = (column) => (e) => {
    if (!drag) return
    if (e.target.closest('.widget-card')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOver({ column, index: layout[column].length, position: 'before' })
  }

  const performDrop = () => {
    if (!drag || !over) return endDrag()
    const { source, id, index: srcIdx } = drag
    const { column: dstCol, index: dstIdx, position } = over
    let insertAt = position === 'before' ? dstIdx : dstIdx + 1
    const next = { large: [...layout.large], medium: [...layout.medium] }
    const entryFor = (wid) => {
      const def = WIDGET_REGISTRY[wid]
      if (dstCol === 'large') return { id: wid, size: def?.defaultSize || 'full' }
      return { id: wid }
    }
    if (source === 'library') {
      next[dstCol].splice(insertAt, 0, entryFor(id))
    } else {
      if (source === dstCol) {
        const [moved] = next[source].splice(srcIdx, 1)
        if (srcIdx < insertAt) insertAt -= 1
        const normalized = dstCol === 'large' && !moved.size ? { ...moved, size: 'full' } : moved
        next[dstCol].splice(insertAt, 0, normalized)
      } else {
        const [moved] = next[source].splice(srcIdx, 1)
        next[dstCol].splice(insertAt, 0, entryFor(moved.id))
      }
    }
    const healed = []
    for (let i = 0; i < next.large.length; i++) {
      const cur = next.large[i]
      const nxt = next.large[i + 1]
      if (cur.size === 'half' && (!nxt || nxt.size !== 'half')) {
        healed.push({ ...cur, size: 'full' })
      } else {
        healed.push(cur)
      }
    }
    next.large = healed
    onLayoutChange(next)
    endDrag()
  }

  const removeFromColumn = (column, index) => () => {
    const next = { large: [...layout.large], medium: [...layout.medium] }
    next[column].splice(index, 1)
    onLayoutChange(next)
  }

  const renderEditableWidget = (column, item, index, sizeClass) => {
    const dragging = drag?.source === column && drag?.index === index
    const dropBefore = over?.column === column && over?.index === index && over?.position === 'before'
    const dropAfter  = over?.column === column && over?.index === index && over?.position === 'after'
    return (
      <div className={sizeClass} key={`${item.id}-${index}`}>
        {renderRegistryWidget(item.id, {
          monitoring, display,
          editMode: true,
          onEdit: () => onEditWidget?.(item.id),
          onRemove: removeFromColumn(column, index),
          draggable: true,
          onDragStart: startDrag(column, item.id, index),
          onDragOver: onCardDragOver(column, index),
          onDrop: performDrop,
          onDragEnd: endDrag,
          isDragging: dragging,
          dropBefore, dropAfter,
        })}
      </div>
    )
  }

  const renderLargeColumn = () => {
    const out = []
    let i = 0
    while (i < layout.large.length) {
      const cur = layout.large[i]
      const nxt = layout.large[i + 1]
      if (cur.size === 'half' && nxt && nxt.size === 'half') {
        const iA = i, iB = i + 1
        out.push(
          <div className="widget-pair" key={`pair-${cur.id}-${nxt.id}-${iA}`}>
            {renderEditableWidget('large', cur, iA, 'customize-half')}
            {renderEditableWidget('large', nxt, iB, 'customize-half')}
          </div>
        )
        i += 2
      } else {
        out.push(renderEditableWidget('large', cur, i, 'customize-full'))
        i++
      }
    }
    return out
  }

  return (
    <div className="customize-body">
      <div className="customize-canvas">
        <div className="dashboard-content">
          <div className="dashboard-col-large" onDragOver={onColumnDragOver('large')} onDrop={performDrop}>
            {renderLargeColumn()}
          </div>
          <div className="dashboard-col-medium" onDragOver={onColumnDragOver('medium')} onDrop={performDrop}>
            {layout.medium.map((w, i) => renderEditableWidget('medium', w, i, 'customize-medium'))}
          </div>
        </div>
      </div>

      <aside className="customize-library">
        <div className="customize-library-header">
          <div className="customize-library-title">Widget library</div>
          <div className="customize-library-hint">Drag onto the dashboard to add</div>
        </div>
        <div className="customize-library-list">
          {(() => {
            const placed = new Set([...layout.large.map(w => w.id), ...layout.medium.map(w => w.id)])
            const available = Object.entries(WIDGET_REGISTRY).filter(([id]) => !placed.has(id))
            if (available.length === 0) return <div className="customize-library-empty">All widgets placed on the dashboard.</div>
            return available.map(([id, spec]) => (
              <div key={id} className="library-item" draggable onDragStart={startDrag('library', id, null)} onDragEnd={endDrag}>
                <div className="library-item-icon"><GripIcon /></div>
                <div className="library-item-body">
                  <div className="library-item-title">{spec.title}</div>
                  <div className="library-item-type">{spec.type}</div>
                  {spec.description && <div className="library-item-desc">{spec.description}</div>}
                </div>
              </div>
            ))
          })()}
        </div>
      </aside>
    </div>
  )
}

/* ── Main Customize view ─────────────────────────────────────── */
export default function Customize({
  onClose, config, audience, onScopeChange,
  onMonitoringChange, onLayoutChange, onDisplayChange, onAudienceChange,
}) {
  const [isEditScopeOpen, setEditScopeOpen] = useState(false)
  const [editingWidgetId, setEditingWidgetId] = useState(null)
  const [layout, setLayout] = useState(() => config?.layout || DEFAULT_LAYOUT)

  const isAssigned = audience && audience.id !== 'myself'

  const handleApplyScope = (newScope) => {
    if (onScopeChange) onScopeChange(newScope)
    setEditScopeOpen(false)
  }

  const handleSaveWidgetEdits = (widgetId, payload) => {
    const { rules, displayMode } = payload || {}
    if (rules !== undefined && onMonitoringChange) onMonitoringChange(widgetId, rules)
    if (displayMode !== undefined && onDisplayChange) onDisplayChange(widgetId, displayMode)
    setEditingWidgetId(null)
  }

  const handleSaveChanges = () => {
    if (onLayoutChange) onLayoutChange(layout)
    onClose()
  }

  return (
    <div className="customize-frame">
      <div className="customize-header">
        <div className="customize-header-text">
          <h1 className="customize-heading">Edit dashboard</h1>
          <p className="customize-subheading">
            Rearrange, add, and customize widgets. Changes are not saved until you click Save changes.
          </p>
          {/* Audience context + edit assignment — only shown when relevant */}
          <AudienceRow
            audience={audience || { id: 'myself', label: 'Myself' }}
            onAudienceChange={onAudienceChange || (() => {})}
          />
        </div>
        <div className="customize-actions">
          <button type="button" className="customize-btn tertiary" onClick={onClose}>Cancel</button>
          <button type="button" className="customize-btn secondary" onClick={() => setEditScopeOpen(true)}>
            Edit Scope
          </button>
          <button type="button" className="customize-btn primary" onClick={handleSaveChanges}>
            Save changes
          </button>
        </div>
      </div>

      <CustomizeBoard
        layout={layout}
        onLayoutChange={setLayout}
        onEditWidget={setEditingWidgetId}
        monitoring={config?.monitoring}
        display={config?.display}
      />

      <EditScopeModal
        isOpen={isEditScopeOpen}
        currentScope={config?.scope}
        mode={config?.mode}
        onApply={handleApplyScope}
        onCancel={() => setEditScopeOpen(false)}
      />

      <EditWidgetModal
        widgetId={editingWidgetId}
        currentRules={editingWidgetId ? config?.monitoring?.[editingWidgetId] : undefined}
        currentDisplayMode={editingWidgetId ? config?.display?.[editingWidgetId] : undefined}
        onSave={(payload) => handleSaveWidgetEdits(editingWidgetId, payload)}
        onClose={() => setEditingWidgetId(null)}
        onRemove={() => setEditingWidgetId(null)}
      />
    </div>
  )
}
