import { useState, useRef, useEffect } from 'react'
import './DashboardSwitcher.css'

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const GridIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
)

/* ── Single-dashboard state ──────────────────────────────────── */
function SingleDashboard({ name, onCreate }) {
  return (
    <div className="ds-root ds-root--single">
      <span className="ds-title-static">{name}</span>
      <button
        className="ds-create-text-btn"
        onClick={onCreate}
        aria-label="Create new dashboard"
      >
        <PlusIcon />
        Create new dashboard
      </button>
    </div>
  )
}

/* ── Multi-dashboard switcher ────────────────────────────────── */
function MultiDashboard({ dashboards, activeDashboardId, onSwitch, onCreate, onManage }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const active = dashboards.find(d => d.id === activeDashboardId) || dashboards[0]

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleSwitch = (id) => { onSwitch(id); setOpen(false) }
  const handleCreate = () => { setOpen(false); onCreate() }
  const handleManage = () => { setOpen(false); onManage() }

  return (
    <div className="ds-root ds-root--multi" ref={ref}>
      <button
        className="ds-trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch dashboard"
      >
        <span className="ds-trigger-label">{active?.name || 'Insights Dashboard'}</span>
        <span className={`ds-chevron${open ? ' open' : ''}`}>
          <ChevronDown />
        </span>
      </button>

      {open && (
        <div className="ds-dropdown" role="listbox" aria-label="My Dashboards">
          <div className="ds-section-label">My Dashboards</div>
          <ul className="ds-list">
            {dashboards.map(d => (
              <li key={d.id}>
                <button
                  className={`ds-item${d.id === activeDashboardId ? ' active' : ''}`}
                  role="option"
                  aria-selected={d.id === activeDashboardId}
                  onClick={() => handleSwitch(d.id)}
                >
                  <span className="ds-item-name">{d.name}</span>
                  {d.id === activeDashboardId && (
                    <span className="ds-item-check"><CheckIcon /></span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="ds-divider" />
          <div className="ds-actions">
            <button className="ds-action-btn" onClick={handleCreate}>
              <span className="ds-action-icon"><PlusIcon /></span>
              Create new dashboard
            </button>
            <button className="ds-action-btn" onClick={handleManage}>
              <span className="ds-action-icon"><GridIcon /></span>
              Manage dashboards
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Public export — picks the right mode automatically ──────── */
export default function DashboardSwitcher(props) {
  const { dashboards } = props
  const isSingle = !dashboards || dashboards.length <= 1

  return isSingle
    ? <SingleDashboard name={dashboards?.[0]?.name || 'Insights Dashboard'} onCreate={props.onCreate} />
    : <MultiDashboard {...props} />
}
