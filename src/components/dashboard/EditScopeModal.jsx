import { useState, useEffect, useMemo, useRef } from 'react'
import {
  SCOPE_FIELDS,
  SCOPE_OPTIONS,
  AUTO_RECOMMENDATIONS,
} from '../../data/mock/onboardingOptions.js'
import './EditScopeModal.css'

/* Map of which dashboard widgets are touched by which scope category.
   Used to surface a non-blocking warning at the bottom of the editor
   panel when a user marks an item for removal. Mock for the prototype. */
const WIDGET_IMPACTS = {
  subAccounts: ['Sub-Account Health', 'Institution Snapshot'],
  term: ['Course Status', 'Course Readiness'],
  studentGroups: ['Students in Need of Attention', 'Student Overview'],
  courses: ['Course Performance', 'Course Metrics'],
  courseGroups: ['Course Status', 'LTI Adoption'],
  instructors: ['Faculty Engagement'],
  modality: ['Course Status'],
}

/* ── Inspector member data (mock) ─────────────────────────────────────
   The inspector panel needs a "members" list per chip — students for a
   student group, courses for a sub-account, etc. We don't ship real
   data with the prototype, so we generate names deterministically from
   the chip's value. The same chip always shows the same members. */

const FIRST_NAMES = [
  'Ava', 'Jordan', 'Marcus', 'Taylor', 'Riley', 'Casey', 'Morgan', 'Alex',
  'Jamie', 'Drew', 'Sam', 'Robin', 'Cameron', 'Skyler', 'Quinn', 'Reese',
  'Phoenix', 'Sage', 'Avery', 'Logan', 'Hayden', 'Emerson', 'Finley', 'Rowan',
  'Dakota', 'Parker', 'Sawyer', 'River', 'Indigo', 'Wren', 'Ellis', 'Harper',
]
const LAST_NAMES = [
  'Martinez', 'Lee', 'Chen', 'Johnson', 'Patel', 'Wilson', 'Davis', 'Nguyen',
  'Smith', 'Anderson', 'Garcia', 'Brown', 'Rodriguez', 'Park', 'Kim', 'Thompson',
  'Moore', 'Taylor', 'Jackson', 'White', 'Williams', 'Wright', 'Liu', 'Singh',
  'Khan', 'Hernandez', 'Carter', 'Reed', 'Bailey', 'Cooper', 'Murphy', 'Rivera',
]
const COURSE_PREFIXES = [
  'BIO', 'CHEM', 'CS', 'ENG', 'HIST', 'MATH', 'PSY', 'PHYS', 'ART', 'MUS',
  'ECON', 'PHIL', 'SOC', 'POLS', 'COMM', 'ANTH',
]
const COURSE_TITLES = [
  'Intro to Biology', 'Organic Chemistry', 'Data Structures', 'Composition',
  'World History', 'Calculus I', 'Intro to Psychology', 'Mechanics',
  'Drawing', 'Music Theory', 'Microeconomics', 'Ethics', 'Sociology',
  'American Government', 'Public Speaking', 'Cultural Anthropology',
]

function hashSeed(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function generateStudents(seed, count) {
  const hash = hashSeed(seed)
  const out = []
  for (let i = 0; i < count; i++) {
    const f = FIRST_NAMES[(hash + i * 13) % FIRST_NAMES.length]
    const l = LAST_NAMES[(hash + i * 7) % LAST_NAMES.length]
    out.push({ id: `s-${i}`, name: `${f} ${l}` })
  }
  return out
}

function generateCourses(seed, count) {
  const hash = hashSeed(seed)
  const out = []
  for (let i = 0; i < count; i++) {
    const prefix = COURSE_PREFIXES[(hash + i * 11) % COURSE_PREFIXES.length]
    const num = 100 + ((hash + i * 17) % 400)
    const title = COURSE_TITLES[(hash + i * 5) % COURSE_TITLES.length]
    out.push({ id: `c-${i}`, name: `${prefix} ${num} — ${title}` })
  }
  return out
}

function parseCount(meta) {
  if (!meta) return 0
  const match = meta.match(/[\d,]+/)
  if (!match) return 0
  return parseInt(match[0].replace(/,/g, ''), 10)
}

/* Per-category configuration: how members are described, how the
   count label reads when SCOPE_OPTIONS doesn't have a meta string,
   and what kind of member to generate. */
const CATEGORY_CONFIG = {
  subAccounts: {
    memberKind: 'courses',
    countNoun: 'courses',
    description: (name) => `Courses and activity within the ${name} sub-account at your institution.`,
  },
  term: {
    memberKind: 'courses',
    countNoun: 'courses',
    description: (name) => `Courses and activity scoped to the ${name} academic term.`,
  },
  studentGroups: {
    memberKind: 'students',
    countNoun: 'students',
    description: (name) => `Students currently included in the "${name}" group at your institution.`,
  },
  courses: {
    memberKind: 'students',
    countNoun: 'students',
    description: (name) => `Students enrolled in ${name} for the current term.`,
  },
  courseGroups: {
    memberKind: 'courses',
    countNoun: 'courses',
    description: (name) => `Courses included in the ${name} group at your institution.`,
  },
  instructors: {
    memberKind: 'courses',
    countNoun: 'courses',
    description: (name) => `Courses currently being taught by ${name}.`,
  },
  modality: {
    memberKind: 'courses',
    countNoun: 'courses',
    description: (name) => `Courses delivered in ${name} format across your institution.`,
  },
}

/* Specific overrides for descriptions where the generic template reads
   awkwardly with a particular chip name. Add more here as you find them. */
const CUSTOM_DESCRIPTIONS = {
  studentGroups: {
    'Students on Probation': 'Students currently flagged with a probation status by your institution.',
    'Undecided/Exploratory Students': 'Students who have not yet declared a major or are exploring options.',
    'International Students': 'Students enrolled from outside the country.',
    'Student Athletes': 'Students participating in varsity athletics or NCAA-sanctioned programs.',
    'Biology Majors': 'Students currently declared as Biology majors.',
    'First-generation Students': 'Students who are the first in their family to attend college.',
    'Transfer Students': 'Students who transferred from another institution.',
    'Honors Program': 'Students enrolled in the institutional honors program.',
    'Veterans': 'Students who are current or former members of the armed forces.',
    'Online-only Students': 'Students enrolled exclusively in online or remote courses.',
    'Graduating Seniors': 'Students on track to graduate at the end of the current term.',
  },
}

/* For categories without a meta count (Term, Modality, Instructors),
   pick a reasonable mock count derived from the chip's name so it's
   consistent across renders. */
function fallbackCount(seed) {
  return 60 + (hashSeed(seed) % 200)
}

function inspectorDataFor(field, value) {
  const config = CATEGORY_CONFIG[field.key]
  if (!config) return null

  /* Pull the count from SCOPE_OPTIONS' meta if present, otherwise fall
     back to a generated count. */
  const optionMeta = SCOPE_OPTIONS[field.key]?.find((o) => o.value === value)?.meta
  const count = parseCount(optionMeta) || fallbackCount(value)
  const countLabel = optionMeta || `${count.toLocaleString()} ${config.countNoun}`

  const description =
    CUSTOM_DESCRIPTIONS[field.key]?.[value] || config.description(value)

  /* Cap actual generation at 300 — the displayed count can be larger,
     but we don't need to materialize 5,000 mock students. */
  const generationCount = Math.min(count, 300)
  const members = config.memberKind === 'students'
    ? generateStudents(value, generationCount)
    : generateCourses(value, generationCount)

  return {
    title: value,
    countLabel,
    countTotal: count,
    description,
    memberKind: config.memberKind,
    members,
  }
}

/* ── icons ───────────────────────────────────────────────────────────── */
function XIcon({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

function MemberAvatar() {
  return (
    <span className="editscope-member-avatar" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.31 0-10 1.66-10 5v3h20v-3c0-3.34-6.69-5-10-5Z" />
      </svg>
    </span>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

/* ── Field row (left pane) ───────────────────────────────────────────── */
function ScopePicker({
  field,
  originalValues,
  activeValues,
  removedValues,
  suggestedValues,
  inspectedValue,
  onAdd,
  onRemoveFromActive,
  onMarkForRemoval,
  onRestore,
  onInspect,
}) {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const infoRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!infoOpen) return
    const handler = (e) => {
      if (infoRef.current && !infoRef.current.contains(e.target)) setInfoOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [infoOpen])

  /* Originals first (active or struck-through, in original order),
     then session-new additions at the end. Position-stable. */
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

  const selectedCount = activeValues.length

  return (
    <div className="editscope-field">
      <div className="editscope-field-header">
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
        <span className="editscope-field-count">{selectedCount} selected</span>
      </div>

      <div className="editscope-chips">
        {orderedChips.map(({ value, status, original }) => {
          const suggested = suggestedValues.includes(value)
          const variant = suggested ? 'suggested' : 'added'
          const removed = status === 'removed'
          const inspected = !removed && inspectedValue === value

          /* Click body → inspect (when active). Click body of removed →
             restore. The X has its own handler with stopPropagation. */
          const handleChipClick = removed
            ? () => onRestore(field.key, value)
            : () => onInspect(field.key, value)

          const handleX = removed
            ? (e) => { e.stopPropagation(); onRestore(field.key, value) }
            : (e) => {
                e.stopPropagation()
                if (original) onMarkForRemoval(field.key, value)
                else onRemoveFromActive(field.key, value)
              }

          const className = [
            'editscope-chip',
            variant,
            removed ? 'removed' : '',
            inspected ? 'inspected' : '',
          ].filter(Boolean).join(' ')

          return (
            <span
              key={value}
              className={className}
              onClick={handleChipClick}
              role="button"
              tabIndex={0}
              aria-pressed={inspected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleChipClick()
                }
              }}
              title={removed ? `Restore ${value}` : `Inspect ${value}`}
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

/* ── Inspector panel (right pane) ────────────────────────────────────── */
function InspectorPanel({ field, value, onClear }) {
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(50)
  const listRef = useRef(null)

  /* Reset chunk + search whenever the inspected item changes — feels
     wrong to land mid-scroll on a different chip. */
  useEffect(() => {
    setSearch('')
    setVisibleCount(50)
    if (listRef.current) listRef.current.scrollTop = 0
  }, [field?.key, value])

  if (!field || !value) {
    return (
      <div className="editscope-inspector empty">
        <div className="editscope-inspector-empty-state">
          <div className="editscope-inspector-empty-title">No selection inspected</div>
          <p className="editscope-inspector-empty-body">
            Click any chip on the left to see what's inside.
          </p>
        </div>
      </div>
    )
  }

  const data = inspectorDataFor(field, value)
  if (!data) return null

  const filtered = search
    ? data.members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    : data.members
  const visible = filtered.slice(0, visibleCount)
  const totalShownLabel = `Showing 1–${Math.min(visible.length, filtered.length)} of ${filtered.length === data.members.length ? data.countTotal.toLocaleString() : filtered.length.toLocaleString()}`

  const handleScroll = (e) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
      setVisibleCount((c) => Math.min(c + 50, filtered.length))
    }
  }

  return (
    <div className="editscope-inspector">
      <header className="editscope-inspector-header">
        <div className="editscope-inspector-icon" aria-hidden="true">
          <MemberAvatar />
        </div>
        <div className="editscope-inspector-headings">
          <h3 className="editscope-inspector-title">{data.title}</h3>
          <div className="editscope-inspector-count">{data.countLabel}</div>
        </div>
        <button
          type="button"
          className="editscope-inspector-close"
          aria-label="Clear inspection"
          onClick={onClear}
        >
          <XIcon size={14} />
        </button>
      </header>

      <p className="editscope-inspector-description">{data.description}</p>

      <div className="editscope-search">
        <SearchIcon />
        <input
          type="search"
          className="editscope-search-input"
          placeholder={`Search ${data.memberKind}`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setVisibleCount(50)
          }}
        />
      </div>

      <div className="editscope-inspector-meta">
        <span>{totalShownLabel}</span>
        {visible.length < filtered.length && (
          <span className="editscope-inspector-hint">Scroll to view all</span>
        )}
      </div>

      <div
        className="editscope-member-list"
        ref={listRef}
        onScroll={handleScroll}
      >
        {visible.length === 0 ? (
          <div className="editscope-member-empty">No matches.</div>
        ) : (
          visible.map((m) => (
            <div key={m.id} className="editscope-member-row">
              <MemberAvatar />
              <span className="editscope-member-name">{m.name}</span>
            </div>
          ))
        )}
      </div>

      <div className="editscope-inspector-footer-note" role="note">
        <InfoIcon />
        <span>
          This panel is read-only. Make changes to your scope selections using
          the options on the left.
        </span>
      </div>
    </div>
  )
}

/* ── Main modal ──────────────────────────────────────────────────────── */
export default function EditScopeModal({ isOpen, currentScope, mode, onApply, onCancel }) {
  const [originalScope, setOriginalScope] = useState(currentScope)
  const [scope, setScope] = useState(currentScope)
  const [removedItems, setRemovedItems] = useState({})
  const [isApplying, setIsApplying] = useState(false)
  const [inspectedItem, setInspectedItem] = useState(null) // { key, value }

  /* Seed state on open. Auto-inspect the first chip from the first
     non-empty category so the inspector has something to show. */
  useEffect(() => {
    if (isOpen) {
      setOriginalScope(currentScope || {})
      setScope(currentScope || {})
      setRemovedItems({})
      setIsApplying(false)
      let seeded = null
      for (const field of SCOPE_FIELDS) {
        const items = currentScope?.[field.key] || []
        if (items.length > 0) {
          seeded = { key: field.key, value: items[0] }
          break
        }
      }
      setInspectedItem(seeded)
    }
  }, [isOpen, currentScope])

  const suggestedScope = useMemo(() => {
    if (mode !== 'auto') return {}
    return AUTO_RECOMMENDATIONS.scope
  }, [mode])

  if (!isOpen) return null

  const handleAdd = (key, value) => {
    setScope((prev) => ({ ...prev, [key]: [...(prev[key] || []), value] }))
    setRemovedItems((prev) => {
      const set = prev[key]
      if (!set) return prev
      const next = new Set(set)
      next.delete(value)
      return { ...prev, [key]: next }
    })
    setInspectedItem({ key, value })
  }

  const handleMarkForRemoval = (key, value) => {
    setScope((prev) => ({ ...prev, [key]: (prev[key] || []).filter((v) => v !== value) }))
    setRemovedItems((prev) => {
      const next = new Set(prev[key] || [])
      next.add(value)
      return { ...prev, [key]: next }
    })
    /* If the inspected chip is the one being removed, point the
       inspector at the next available active chip in any category. */
    if (inspectedItem?.key === key && inspectedItem?.value === value) {
      reseedInspector(key, value)
    }
  }

  const handleRemoveFromActive = (key, value) => {
    setScope((prev) => ({ ...prev, [key]: (prev[key] || []).filter((v) => v !== value) }))
    if (inspectedItem?.key === key && inspectedItem?.value === value) {
      reseedInspector(key, value)
    }
  }

  const handleRestore = (key, value) => {
    setRemovedItems((prev) => {
      const set = prev[key]
      if (!set) return prev
      const next = new Set(set)
      next.delete(value)
      return { ...prev, [key]: next }
    })
    setScope((prev) => ({ ...prev, [key]: [...(prev[key] || []), value] }))
  }

  /* When the inspected chip disappears, find the next reasonable thing
     to inspect: another active item in the same category first, then
     the first active item in any category. */
  const reseedInspector = (removedKey, removedValue) => {
    const sameCat = (scope[removedKey] || []).filter((v) => v !== removedValue)
    if (sameCat.length > 0) {
      setInspectedItem({ key: removedKey, value: sameCat[0] })
      return
    }
    for (const field of SCOPE_FIELDS) {
      if (field.key === removedKey) continue
      const items = scope[field.key] || []
      if (items.length > 0) {
        setInspectedItem({ key: field.key, value: items[0] })
        return
      }
    }
    setInspectedItem(null)
  }

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
    setIsApplying(true)
    setTimeout(() => {
      onApply(scope)
      setIsApplying(false)
    }, 600)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isApplying) onCancel()
  }

  const inspectedField =
    SCOPE_FIELDS.find((f) => f.key === inspectedItem?.key) || null

  return (
    <div className="editscope-backdrop" onMouseDown={handleBackdropClick} role="presentation">
      <div className="editscope-modal" role="dialog" aria-labelledby="editscope-title" aria-modal="true">
        <header className="editscope-header">
          <div className="editscope-header-text">
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
          </div>
          <button
            type="button"
            className="editscope-close"
            aria-label="Close"
            onClick={onCancel}
            disabled={isApplying}
          >
            <XIcon size={14} />
          </button>
        </header>

        <div className="editscope-panes">
          {/* Editor pane */}
          <div className="editscope-editor">
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
                inspectedValue={
                  inspectedItem?.key === field.key ? inspectedItem.value : null
                }
                onAdd={handleAdd}
                onRemoveFromActive={handleRemoveFromActive}
                onMarkForRemoval={handleMarkForRemoval}
                onRestore={handleRestore}
                onInspect={(key, value) => setInspectedItem({ key, value })}
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

          {/* Vertical divider between panes */}
          <div className="editscope-pane-divider" aria-hidden="true" />

          {/* Inspector pane */}
          <InspectorPanel
            field={inspectedField}
            value={inspectedItem?.value}
            onClear={() => setInspectedItem(null)}
          />
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

function formatWidgetList(items) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}
