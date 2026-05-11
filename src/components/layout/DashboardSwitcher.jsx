import { useState, useRef, useEffect } from 'react'
import './DashboardSwitcher.css'

/* ── Icons ─────────────────────────────────────────────────── */
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const UserPlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
)
const PinIcon = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9 9H2l5.5 4-2 7L12 16l6.5 4-2-7L22 9h-7z"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const ManageIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0z"/>
  </svg>
)

/* Scope filter count derived from config */
function scopeCount(dashboard) {
  const scope = dashboard.config?.scope || {}
  return Object.values(scope).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
}

/* ── Single-dashboard state ─────────────────────────────────── */
function SingleDashboard({ name, onCreate }) {
  return (
    <div className="ds-root ds-root--single">
      <span className="ds-title-static">{name}</span>
      <button className="ds-create-text-btn" onClick={onCreate} aria-label="Create new dashboard">
        <PlusIcon /> Create new dashboard
      </button>
    </div>
  )
}

/* ── Multi-dashboard dropdown ───────────────────────────────── */
function MultiDashboard({ dashboards, activeDashboardId, onSwitch, onCreate, onManage }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const ref     = useRef(null)
  const inputRef = useRef(null)

  const active = dashboards.find(d => d.id === activeDashboardId) || dashboards[0]

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery('') }
    }
    if (open) { document.addEventListener('mousedown', handler); inputRef.current?.focus() }
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const myDashboards = dashboards.filter(d => !d.audience || d.audience.id === 'myself')
  const assignedDashboards = dashboards.filter(d => d.audience && d.audience.id !== 'myself')

  const filterFn = (d) => d.name.toLowerCase().includes(query.toLowerCase())
  const filteredMy       = myDashboards.filter(filterFn)
  const filteredAssigned = assignedDashboards.filter(filterFn)

  const handleSwitch = (id) => { onSwitch(id); setOpen(false); setQuery('') }
  const handleCreate = () => { setOpen(false); setQuery(''); onCreate() }
  const handleManage = () => { setOpen(false); setQuery(''); onManage() }

  return (
    <div className="ds-root ds-root--multi" ref={ref}>
      <button
        className={`ds-trigger${open ? ' ds-trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ds-trigger-label">{active?.name || 'Insights Dashboard'}</span>
        <span className={`ds-chevron${open ? ' open' : ''}`}><ChevronDown /></span>
      </button>

      {open && (
        <div className="ds-dropdown" role="dialog" aria-label="Dashboard switcher">

          {/* Search + manage dashboards link */}
          <div className="ds-search-bar">
            <span className="ds-search-icon"><SearchIcon /></span>
            <input
              ref={inputRef}
              className="ds-search-input"
              placeholder="Search dashboards…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="ds-manage-link" onClick={handleManage}>
              <ManageIcon /> Manage dashboards
            </button>
          </div>

          <div className="ds-scroll">
            {/* My Dashboards */}
            {filteredMy.length > 0 && (
              <div className="ds-group">
                <div className="ds-group-label">My Dashboards</div>
                {filteredMy.map(d => {
                  const isActive = d.id === activeDashboardId
                  const sc = scopeCount(d)
                  return (
                    <button
                      key={d.id}
                      className={`ds-item${isActive ? ' ds-item--active' : ''}`}
                      onClick={() => handleSwitch(d.id)}
                    >
                      <span className="ds-item-pin" aria-hidden="true">
                        {d.pinned ? <PinIcon filled /> : <PinIcon />}
                      </span>
                      <span className="ds-item-icon"><GridIcon /></span>
                      <span className="ds-item-text">
                        <span className="ds-item-name">
                          {d.name}
                          {isActive && <span className="ds-active-badge">Active</span>}
                        </span>
                        <span className="ds-item-meta">
                          Created for yourself{sc > 0 ? ` · ${sc} scope filter${sc !== 1 ? 's' : ''}` : ''}
                        </span>
                      </span>
                      {isActive && <span className="ds-item-check"><CheckIcon /></span>}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Assigned Dashboards */}
            {filteredAssigned.length > 0 && (
              <div className="ds-group">
                <div className="ds-group-label ds-group-label--assigned">
                  <UserPlusIcon /> Assigned Dashboards
                </div>
                {filteredAssigned.map(d => {
                  const isActive = d.id === activeDashboardId
                  return (
                    <button
                      key={d.id}
                      className={`ds-item ds-item--assigned${isActive ? ' ds-item--active' : ''}`}
                      onClick={() => handleSwitch(d.id)}
                    >
                      <span className="ds-item-icon ds-item-icon--assigned"><UserPlusIcon /></span>
                      <span className="ds-item-text">
                        <span className="ds-item-name">
                          {d.name}
                          {isActive && <span className="ds-active-badge">Active</span>}
                        </span>
                        <span className="ds-item-meta">
                          Assigned to {d.audience?.label}
                          {d.audience?.role ? ` · ${d.audience.role}` : ''}
                        </span>
                      </span>
                      {isActive && <span className="ds-item-check"><CheckIcon /></span>}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Empty search state */}
            {query && filteredMy.length === 0 && filteredAssigned.length === 0 && (
              <div className="ds-empty">No dashboards match "{query}"</div>
            )}
          </div>

          {/* Footer */}
          <div className="ds-footer">
            <button className="ds-footer-link" onClick={() => {}}>
              <ClockIcon /> View recently opened
            </button>
            <button className="ds-footer-create" onClick={handleCreate}>
              <PlusIcon /> Create new dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Public export ─────────────────────────────────────────── */
export default function DashboardSwitcher(props) {
  const { dashboards } = props
  const isSingle = !dashboards || dashboards.length <= 1
  return isSingle
    ? <SingleDashboard name={dashboards?.[0]?.name || 'Insights Dashboard'} onCreate={props.onCreate} />
    : <MultiDashboard {...props} />
}
