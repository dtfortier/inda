import { useState } from 'react'
import EditScopeModal from '../components/dashboard/EditScopeModal.jsx'
import './Customize.css'

const WIDGET_CATALOG = {
  'inst-snap':         { title: 'Institution Snapshot',          type: 'KPI metrics',    desc: 'Top-line institutional KPIs: enrollment, activity rate, and overall health.' },
  'sub-health':        { title: 'Sub-Account Health',            type: 'Bar chart',      desc: 'Low-engagement percentage for each sub-account, ranked worst to best.' },
  'course-status':     { title: 'Course Status',                 type: 'Stacked bar',    desc: 'Published vs. unpublished vs. concluded courses across the term.' },
  'lti-adoption-lg':   { title: 'LTI Adoption',                  type: 'Horizontal bar', desc: 'Which external tools are used most — total launches and unique users.' },
  'course-perf':       { title: 'Course Performance',            type: 'Line chart',     desc: 'Weekly participation trend across all courses — spot dips early.' },
  'interaction':       { title: 'Interaction Over Time',         type: 'Line chart',     desc: 'Weekly participation rate alongside total page-view volume.' },
  'course-readiness':  { title: 'Course Readiness',              type: 'Stacked bar',    desc: 'Share of courses ready to launch vs. missing setup essentials.' },
  'students-need':     { title: 'Students in Need of Attention', type: 'Donut chart',    desc: 'Count of flagged students, surfacing who needs intervention now.' },
  'student-overview':  { title: 'Student Overview',              type: 'KPI metrics',    desc: 'High-level student stats: active, at-risk, and inactive counts.' },
  'faculty':           { title: 'Faculty Engagement',            type: 'Scored bars',    desc: 'Faculty activity score by department — coursework, grading, feedback.' },
  'course-metrics':    { title: 'Course Metrics',                type: 'KPI metrics',    desc: 'Quick course-level stats: size, pacing, completion, and grade spread.' },
  'grade-dist':        { title: 'Grade Distribution',            type: 'Bar chart',      desc: 'Distribution of final grades across all active courses.' },
  'assign-completion': { title: 'Assignment Completion',         type: 'Donut chart',    desc: 'Ratio of assignments submitted on time vs. late vs. missing.' },
  'login-activity':    { title: 'Login Activity',                type: 'Line chart',     desc: 'Daily login counts — track engagement patterns over the term.' },
  'discussion':        { title: 'Discussion Engagement',         type: 'KPI metrics',    desc: 'Posts, replies, and unique participants in course discussions.' },
}

const INITIAL_LAYOUT = {
  left: [
    { id: 'inst-snap',        size: 'full' },
    { id: 'sub-health',       size: 'full' },
    { id: 'course-status',    size: 'full' },
    { id: 'lti-adoption-lg',  size: 'half' },
    { id: 'course-perf',      size: 'half' },
    { id: 'interaction',      size: 'full' },
    { id: 'course-readiness', size: 'full' },
  ],
  right: [
    { id: 'students-need' },
    { id: 'student-overview' },
    { id: 'faculty' },
    { id: 'course-metrics' },
  ],
}

/* ── skeleton sparklines (re-used as the "chart" placeholder) ── */
const SKEL = {
  'KPI metrics': (
    <svg viewBox="0 0 400 120" fill="none">
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={20 + i * 95} y="24" width="70" height="12" rx="3" fill="currentColor" opacity="0.18" />
          <rect x={20 + i * 95} y="44" width="55" height="28" rx="4" fill="currentColor" opacity="0.35" />
          <rect x={20 + i * 95} y="82" width="75" height="8" rx="2" fill="currentColor" opacity="0.15" />
        </g>
      ))}
    </svg>
  ),
  'Bar chart': (
    <svg viewBox="0 0 400 160" fill="none">
      {Array.from({ length: 10 }, (_, i) => {
        const h = [70, 90, 60, 110, 80, 125, 55, 95, 70, 105][i]
        return <rect key={i} x={20 + i * 38} y={140 - h} width="24" height={h} rx="2" fill="currentColor" opacity="0.4" />
      })}
    </svg>
  ),
  'Stacked bar': (
    <svg viewBox="0 0 400 160" fill="none">
      {Array.from({ length: 8 }, (_, i) => {
        const a = [40, 60, 30, 70, 50, 55, 45, 65][i]
        const b = [50, 40, 55, 35, 45, 60, 50, 40][i]
        return (
          <g key={i}>
            <rect x={30 + i * 46} y={140 - a - b} width="28" height={b} fill="currentColor" opacity="0.5" />
            <rect x={30 + i * 46} y={140 - a} width="28" height={a} fill="currentColor" opacity="0.25" />
          </g>
        )
      })}
    </svg>
  ),
  'Horizontal bar': (
    <svg viewBox="0 0 400 160" fill="none">
      {Array.from({ length: 6 }, (_, i) => {
        const w = [260, 200, 310, 160, 240, 190][i]
        return <rect key={i} x="20" y={18 + i * 22} width={w} height="12" rx="3" fill="currentColor" opacity="0.4" />
      })}
    </svg>
  ),
  'Line chart': (
    <svg viewBox="0 0 400 160" fill="none">
      <polyline
        points="10,120 50,95 90,110 130,70 170,85 210,45 250,60 290,30 330,55 370,25"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        opacity="0.55"
      />
      <polyline
        points="10,135 50,125 90,130 130,100 170,110 210,85 250,90 290,75 330,70 370,60"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
    </svg>
  ),
  'Donut chart': (
    <svg viewBox="0 0 400 180" fill="none">
      <circle cx="200" cy="90" r="60" stroke="currentColor" strokeWidth="18" fill="none" opacity="0.18" />
      <path d="M 200 30 A 60 60 0 0 1 252 108" stroke="currentColor" strokeWidth="18" fill="none" opacity="0.55" />
    </svg>
  ),
  'Scored bars': (
    <svg viewBox="0 0 400 180" fill="none">
      {Array.from({ length: 5 }, (_, i) => {
        const w = [280, 220, 310, 180, 250][i]
        return (
          <g key={i}>
            <rect x="20" y={16 + i * 30} width="360" height="10" rx="3" fill="currentColor" opacity="0.12" />
            <rect x="20" y={16 + i * 30} width={w} height="10" rx="3" fill="currentColor" opacity="0.5" />
          </g>
        )
      })}
    </svg>
  ),
}

function GripIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function WidgetSkeleton({ id, sizeClass, dragging, dropBefore, dropAfter, onRemove, draggableProps }) {
  const spec = WIDGET_CATALOG[id]
  if (!spec) return null
  return (
    <div
      className={`skel-card ${sizeClass}${dragging ? ' is-dragging' : ''}${dropBefore ? ' drop-before' : ''}${dropAfter ? ' drop-after' : ''}`}
      {...draggableProps}
    >
      <div className="skel-head">
        <div className="skel-title-block">
          <div className="skel-grip"><GripIcon /></div>
          <div className="skel-title-text">
            <h3 className="skel-title">{spec.title}</h3>
            <div className="skel-type">{spec.type}</div>
            {spec.desc && <div className="skel-desc">{spec.desc}</div>}
          </div>
        </div>
        {onRemove && (
          <button type="button" className="skel-remove" onClick={onRemove} aria-label="Remove widget">
            <XIcon />
          </button>
        )}
      </div>
      <div className="skel-body">{SKEL[spec.type] || SKEL['KPI metrics']}</div>
    </div>
  )
}

export function CustomizeBoard({ initialLayout }) {
  const [layout, setLayout] = useState(initialLayout || INITIAL_LAYOUT)
  const [drag, setDrag] = useState(null) // { source, id, index, position }
  const [over, setOver] = useState(null) // { column, index, position: 'before'|'after' }

  const startDrag = (source, id, index) => (e) => {
    setDrag({ source, id, index })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const endDrag = () => {
    setDrag(null)
    setOver(null)
  }

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
    // only engage if not over a specific card already
    if (e.target.closest('.skel-card')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOver({ column, index: layout[column].length, position: 'before' })
  }

  const performDrop = () => {
    if (!drag || !over) return endDrag()

    const { source, id, index: srcIdx } = drag
    const { column: dstCol, index: dstIdx, position } = over
    let insertAt = position === 'before' ? dstIdx : dstIdx + 1

    const next = { left: [...layout.left], right: [...layout.right] }
    const entryFor = (wid) => (dstCol === 'left' ? { id: wid, size: 'full' } : { id: wid })

    if (source === 'library') {
      next[dstCol].splice(insertAt, 0, entryFor(id))
    } else {
      if (source === dstCol) {
        const [moved] = next[source].splice(srcIdx, 1)
        if (srcIdx < insertAt) insertAt -= 1
        const normalized = dstCol === 'left' && !moved.size ? { ...moved, size: 'full' } : moved
        next[dstCol].splice(insertAt, 0, normalized)
      } else {
        const [moved] = next[source].splice(srcIdx, 1)
        next[dstCol].splice(insertAt, 0, entryFor(moved.id))
      }
    }

    // heal orphaned half-widgets in the left column
    const healed = []
    for (let i = 0; i < next.left.length; i++) {
      const cur = next.left[i]
      const nxt = next.left[i + 1]
      if (cur.size === 'half' && (!nxt || nxt.size !== 'half')) {
        healed.push({ ...cur, size: 'full' })
      } else {
        healed.push(cur)
      }
    }
    next.left = healed

    setLayout(next)
    endDrag()
  }

  const removeFromColumn = (column, index) => () => {
    const next = { left: [...layout.left], right: [...layout.right] }
    next[column].splice(index, 1)
    setLayout(next)
  }

  /* ── render left column with pair awareness ── */
  const renderLeftColumn = () => {
    const out = []
    let i = 0
    while (i < layout.left.length) {
      const cur = layout.left[i]
      const nxt = layout.left[i + 1]
      if (cur.size === 'half' && nxt && nxt.size === 'half') {
        const iA = i
        const iB = i + 1
        out.push(
          <div className="widget-pair" key={`pair-${cur.id}-${nxt.id}-${iA}`}>
            <WidgetSkeleton
              id={cur.id}
              sizeClass="skel-half"
              dragging={drag?.source === 'left' && drag?.index === iA}
              dropBefore={over?.column === 'left' && over?.index === iA && over?.position === 'before'}
              dropAfter={over?.column === 'left' && over?.index === iA && over?.position === 'after'}
              onRemove={removeFromColumn('left', iA)}
              draggableProps={{
                draggable: true,
                onDragStart: startDrag('left', cur.id, iA),
                onDragOver: onCardDragOver('left', iA),
                onDrop: performDrop,
                onDragEnd: endDrag,
              }}
            />
            <WidgetSkeleton
              id={nxt.id}
              sizeClass="skel-half"
              dragging={drag?.source === 'left' && drag?.index === iB}
              dropBefore={over?.column === 'left' && over?.index === iB && over?.position === 'before'}
              dropAfter={over?.column === 'left' && over?.index === iB && over?.position === 'after'}
              onRemove={removeFromColumn('left', iB)}
              draggableProps={{
                draggable: true,
                onDragStart: startDrag('left', nxt.id, iB),
                onDragOver: onCardDragOver('left', iB),
                onDrop: performDrop,
                onDragEnd: endDrag,
              }}
            />
          </div>
        )
        i += 2
      } else {
        out.push(
          <WidgetSkeleton
            key={`${cur.id}-${i}`}
            id={cur.id}
            sizeClass="skel-full"
            dragging={drag?.source === 'left' && drag?.index === i}
            dropBefore={over?.column === 'left' && over?.index === i && over?.position === 'before'}
            dropAfter={over?.column === 'left' && over?.index === i && over?.position === 'after'}
            onRemove={removeFromColumn('left', i)}
            draggableProps={{
              draggable: true,
              onDragStart: startDrag('left', cur.id, i),
              onDragOver: onCardDragOver('left', i),
              onDrop: performDrop,
              onDragEnd: endDrag,
            }}
          />
        )
        i += 1
      }
    }
    return out
  }

  return (
    <div className="customize-body">
        <div className="customize-canvas">
          <div className="dashboard-content">
            <div
              className="dashboard-col-large"
              onDragOver={onColumnDragOver('left')}
              onDrop={performDrop}
            >
              {renderLeftColumn()}
            </div>
            <div
              className="dashboard-col-medium"
              onDragOver={onColumnDragOver('right')}
              onDrop={performDrop}
            >
              {layout.right.map((w, i) => (
                <WidgetSkeleton
                  key={`${w.id}-${i}`}
                  id={w.id}
                  sizeClass="skel-medium"
                  dragging={drag?.source === 'right' && drag?.index === i}
                  dropBefore={over?.column === 'right' && over?.index === i && over?.position === 'before'}
                  dropAfter={over?.column === 'right' && over?.index === i && over?.position === 'after'}
                  onRemove={removeFromColumn('right', i)}
                  draggableProps={{
                    draggable: true,
                    onDragStart: startDrag('right', w.id, i),
                    onDragOver: onCardDragOver('right', i),
                    onDrop: performDrop,
                    onDragEnd: endDrag,
                  }}
                />
              ))}
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
              const placed = new Set([
                ...layout.left.map((w) => w.id),
                ...layout.right.map((w) => w.id),
              ])
              const available = Object.entries(WIDGET_CATALOG).filter(([id]) => !placed.has(id))
              if (available.length === 0) {
                return <div className="customize-library-empty">All widgets placed on the dashboard.</div>
              }
              return available.map(([id, spec]) => (
                <div
                  key={id}
                  className="library-item"
                  draggable
                  onDragStart={startDrag('library', id, null)}
                  onDragEnd={endDrag}
                >
                  <div className="library-item-icon"><GripIcon /></div>
                  <div className="library-item-body">
                    <div className="library-item-title">{spec.title}</div>
                    <div className="library-item-type">{spec.type}</div>
                    {spec.desc && <div className="library-item-desc">{spec.desc}</div>}
                  </div>
                </div>
              ))
            })()}
          </div>
        </aside>
      </div>
  )
}

export default function Customize({ onClose, config, onScopeChange }) {
  const [isEditScopeOpen, setEditScopeOpen] = useState(false)

  const handleApplyScope = (newScope) => {
    if (onScopeChange) onScopeChange(newScope)
    setEditScopeOpen(false)
  }

  return (
    <div className="customize-frame">
      <div className="customize-header">
        <div>
          <h1 className="customize-heading">Customize your dashboard</h1>
          <p className="customize-subheading">
            Drag widgets from the library onto the dashboard, or drag existing widgets to rearrange them.
          </p>
        </div>
        <div className="customize-actions">
          <button type="button" className="customize-btn tertiary" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="customize-btn secondary"
            onClick={() => setEditScopeOpen(true)}
          >
            Edit Scope
          </button>
          <button type="button" className="customize-btn primary" onClick={onClose}>Save changes</button>
        </div>
      </div>
      <CustomizeBoard />

      <EditScopeModal
        isOpen={isEditScopeOpen}
        currentScope={config?.scope}
        mode={config?.mode}
        onApply={handleApplyScope}
        onCancel={() => setEditScopeOpen(false)}
      />
    </div>
  )
}
