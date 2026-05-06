import { useState, useEffect, useMemo, useRef } from 'react'
import {
  SCOPE_FIELDS,
  SCOPE_OPTIONS,
  AUTO_RECOMMENDATIONS,
} from '../../data/mock/onboardingOptions.js'
import './EditScopeModal.css'

/* Map of which dashboard widgets are touched by which scope category.
   Used to surface a non-blocking warning at the bottom of the modal
   when a user marks an item for removal. Mock for the prototype —
   swap to real data when the dashboard wires through. */
const WIDGET_IMPACTS = {
  subAccounts: ['Sub-Account Health', 'Institution Snapshot'],
  term: ['Course Status', 'Course Readiness'],
  studentGroups: ['Students in Need of Attention', 'Student Overview'],
  courses: ['Course Performance', 'Course Metrics'],
  courseGroups: ['Course Status', 'LTI Adoption'],
  instructors: ['Faculty Engagement'],
  modality: ['Course Status'],
}

/* ── icons ── */
function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="editscope-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

/* ── tag list per category ── */
function ScopePicker({
  field,
  originalValues,
  activeValues,
  removedValues,
  suggestedValues,
  onAdd,
  onRemoveFromActive,
  onMarkForRemoval,
  onRestore,
}) {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef(null)

  const [infoOpen, setInfoOpen] = useState(false)
  const infoRef = useRef(null)

  /* Close the Add popover on outside click. */
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  /* Same pattern for the info popover. */
  useEffect(() => {
    if (!infoOpen) return
    const handler = (e) => {
      if (infoRef.current && !infoRef.current.contains(e.target)) setInfoOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [infoOpen])

  /* Render originals (active or struck-through) in their original
     order, then any session-new additions at the end. Preserves
     visual position so a strikethrough doesn't reshuffle siblings. */
  const orderedChips = []
  for (const value of originalValues) {
    if (activeValues.includes(value)) {
      orderedChips.push({ value, status: 'active', original: true })
    } else if (removedValues.includes(value)) {
      orderedChips.push({ value, status: 'removed', original: true })
    }
  }
  for (const value of activeValues) {
    if (!originalValues.includes(value)) {
      orderedChips.push({ value, status: 'active', original: false })
    }
  }

  const allOptions = SCOPE_OPTIONS[field.key] || []
  const available = allOptions.filter(
    (o) => !activeValues.includes(o.value) && !removedValues.includes(o.value)
  )

  return (
    <div className="editscope-field">
      <div className="editscope-field-label">
        <span>{field.label}</span>
        {field.description && (
          <span className="editscope-info-popover" ref={infoRef}>
            <button
              type="button"
              className="editscope-info-btn"
              onClick={() => setInfoOpen((v) => !v)}
              aria-label={`About ${field.label}`}
              aria-expanded={infoOpen}
            >
              <InfoIcon />
            </button>
            {infoOpen && (
              <div className="editscope-info-tooltip" role="dialog">
                {field.description}
              </div>
            )}
          </span>
        )}
      </div>
      <div className="editscope-chips">
        {orderedChips.map(({ value, status, original }) => {
          const suggested = suggestedValues.includes(value)
          const variant = suggested ? 'suggested' : 'added'
          const removed = status === 'removed'
          /* Click anywhere on a removed chip restores it. The X is just
             a redundant affordance with the same effect. */
          const handleChipClick = removed ? () => onRestore(field.key, value) : undefined
          const handleX = removed
            ? (e) => { e.stopPropagation(); onRestore(field.key, value) }
            : (e) => {
                e.stopPropagation()
                if (original) onMarkForRemoval(field.key, value)
                else onRemoveFromActive(field.key, value)
              }

          return (
            <span
              key={value}
              className={`editscope-chip ${variant}${removed ? ' removed' : ''}`}
              onClick={handleChipClick}
              role={removed ? 'button' : undefined}
              tabIndex={removed ? 0 : undefined}
              onKeyDown={removed ? (e) => { if (e.key === 'Enter') onRestore(field.key, value) } : undefined}
              title={removed ? `Restore ${value}` : undefined}
            >
              <span className="editscope-chip-label">{value}</span>
              <button
                type="button"
                className="editscope-chip-action"
                aria-label={removed ? `Restore ${value}` : `Remove ${value}`}
                onClick={handleX}
              >
                <XIcon />
              </button>
            </span>
          )
        })}

        <div className="editscope-add-popover" ref={popoverRef}>
          <button
            type="button"
            className="editscope-add"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <PlusIcon />
            Add
          </button>
          {open && (
            <div className="editscope-add-menu">
              {available.length === 0 ? (
                <div className="editscope-add-empty">All options added</div>
              ) : (
                available.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="editscope-add-item"
                    onClick={() => {
                      onAdd(field.key, option.value)
                      setOpen(false)
                    }}
                  >
                    <div className="editscope-add-item-name">{option.value}</div>
                    {option.meta && (
                      <div className="editscope-add-item-meta">{option.meta}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── modal ── */
export default function EditScopeModal({ isOpen, currentScope, mode, onApply, onCancel }) {
  /* `originalScope` is the snapshot we opened with — drives the order
     of original chips and the strikethrough logic. Doesn't change. */
  const [originalScope, setOriginalScope] = useState(currentScope)

  /* `scope` is the working copy. Adds/removes happen here. On Apply we
     persist this back to App. */
  const [scope, setScope] = useState(currentScope)

  /* `removedItems[key]` — values from the original scope the user has
     marked for removal but not yet committed. Strikethrough rendering
     uses this. Merging into `scope` happens on Apply. */
  const [removedItems, setRemovedItems] = useState({})

  const [isApplying, setIsApplying] = useState(false)

  /* When the modal opens (or currentScope changes externally), seed
     state from the new value. Done in an effect rather than at render
     so we keep working state across re-renders inside one open session. */
  useEffect(() => {
    if (isOpen) {
      setOriginalScope(currentScope || {})
      setScope(currentScope || {})
      setRemovedItems({})
      setIsApplying(false)
    }
  }, [isOpen, currentScope])

  /* Auto-mode users had Canvas-suggested values applied during
     onboarding; we don't persist that flag, so reconstruct it from
     AUTO_RECOMMENDATIONS at modal mount time. */
  const suggestedScope = useMemo(() => {
    if (mode !== 'auto') return {}
    return AUTO_RECOMMENDATIONS.scope
  }, [mode])

  if (!isOpen) return null

  const handleAdd = (key, value) => {
    setScope((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), value],
    }))
    /* If the value was previously struck through (rare but possible if
       a user removed then re-added via popover) clear that state. */
    setRemovedItems((prev) => {
      const set = prev[key]
      if (!set) return prev
      const next = new Set(set)
      next.delete(value)
      return { ...prev, [key]: next }
    })
  }

  /* Removing an item that was in the original scope marks it for
     deletion (strikethrough). Removing a session-new item just drops it
     from `scope`. */
  const handleMarkForRemoval = (key, value) => {
    setScope((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((v) => v !== value),
    }))
    setRemovedItems((prev) => {
      const next = new Set(prev[key] || [])
      next.add(value)
      return { ...prev, [key]: next }
    })
  }

  const handleRemoveFromActive = (key, value) => {
    setScope((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((v) => v !== value),
    }))
  }

  const handleRestore = (key, value) => {
    setRemovedItems((prev) => {
      const set = prev[key]
      if (!set) return prev
      const next = new Set(set)
      next.delete(value)
      return { ...prev, [key]: next }
    })
    setScope((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), value],
    }))
  }

  /* Compute the deduped set of widgets affected by every category that
     currently has at least one strikethrough item. Order follows the
     scope-field order for stable, predictable reading. */
  const affectedWidgets = (() => {
    const seen = new Set()
    const out = []
    for (const field of SCOPE_FIELDS) {
      const set = removedItems[field.key]
      if (!set || set.size === 0) continue
      for (const widget of WIDGET_IMPACTS[field.key] || []) {
        if (seen.has(widget)) continue
        seen.add(widget)
        out.push(widget)
      }
    }
    return out
  })()

  const handleApply = () => {
    /* `scope` already excludes the strikethrough items (we filtered them
       out when marking for removal), so we can apply it directly. */
    setIsApplying(true)
    setTimeout(() => {
      onApply(scope)
      setIsApplying(false)
    }, 600)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isApplying) onCancel()
  }

  return (
    <div className="editscope-backdrop" onMouseDown={handleBackdropClick} role="presentation">
      <div className="editscope-modal" role="dialog" aria-labelledby="editscope-title" aria-modal="true">
        <header className="editscope-header">
          <h2 id="editscope-title" className="editscope-title">Edit your scope.</h2>
          <p className="editscope-subtitle">
            Changes apply to your entire dashboard. Add or remove selections below.
            More detailed information about each option is available via the
            {' '}
            <span className="editscope-inline-info" aria-hidden="true">
              <InfoIcon />
            </span>
            {' '}icons.
          </p>
        </header>

        <div className="editscope-body">
          <div className="editscope-legend">
            <span className="editscope-legend-item">
              <span className="editscope-legend-dot suggested" />
              Suggested by Canvas
            </span>
            <span className="editscope-legend-item">
              <span className="editscope-legend-dot added" />
              Added manually
            </span>
          </div>

          {SCOPE_FIELDS.map((field) => (
            <ScopePicker
              key={field.key}
              field={field}
              originalValues={originalScope?.[field.key] || []}
              activeValues={scope?.[field.key] || []}
              removedValues={Array.from(removedItems[field.key] || [])}
              suggestedValues={suggestedScope?.[field.key] || []}
              onAdd={handleAdd}
              onRemoveFromActive={handleRemoveFromActive}
              onMarkForRemoval={handleMarkForRemoval}
              onRestore={handleRestore}
            />
          ))}

          {affectedWidgets.length > 0 && (
            <div className="editscope-warning" role="status">
              <WarningIcon />
              <span>
                {affectedWidgets.length === 1
                  ? `Removing this scope item may affect the ${affectedWidgets[0]} widget on your dashboard.`
                  : `Removing these scope items may affect the ${formatWidgetList(affectedWidgets)} widgets on your dashboard.`}
              </span>
            </div>
          )}
        </div>

        <footer className="editscope-footer">
          <span className="editscope-footer-hint">
            Scope applies to all widgets on this dashboard.
          </span>
          <div className="editscope-footer-actions">
            <button
              type="button"
              className="editscope-btn tertiary"
              onClick={onCancel}
              disabled={isApplying}
            >
              Cancel
            </button>
            <button
              type="button"
              className="editscope-btn primary"
              onClick={handleApply}
              disabled={isApplying}
            >
              {isApplying ? 'Updating your dashboard…' : 'Apply Scope Changes'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

/* "Foo, Bar, and Baz" with serial comma. */
function formatWidgetList(items) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}
