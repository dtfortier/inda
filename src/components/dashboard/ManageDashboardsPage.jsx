import { useState } from 'react'
import './ManageDashboardsPage.css'

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)
const MoreIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" fill="currentColor"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
    <circle cx="12" cy="19" r="1" fill="currentColor"/>
  </svg>
)
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const UserPlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
)
const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const ChevronIcon = ({ up }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
  </svg>
)
const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function scopeCount(d) {
  const scope = d.config?.scope || {}
  return Object.values(scope).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
}

function RenameCell({ value, onSave, onCancel }) {
  const [draft, setDraft] = useState(value)
  return (
    <div className="mdp-rename-row">
      <input
        className="mdp-rename-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && draft.trim()) onSave(draft.trim())
          if (e.key === 'Escape') onCancel()
        }}
        autoFocus
        maxLength={80}
      />
      <button className="mdp-rename-save" onClick={() => draft.trim() && onSave(draft.trim())}>Save</button>
      <button className="mdp-rename-cancel" onClick={onCancel}>Cancel</button>
    </div>
  )
}

function DeleteConfirm({ name, onConfirm, onCancel }) {
  return (
    <div className="mdp-delete-confirm">
      <span>Delete <strong>"{name}"</strong>? This can't be undone.</span>
      <div className="mdp-delete-actions">
        <button className="mdp-delete-btn-cancel" onClick={onCancel}>Cancel</button>
        <button className="mdp-delete-btn-confirm" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  )
}

function DashboardRow({ dashboard, isActive, isOnly, isAssigned, onSwitch, onRename, onPin, onDuplicate, onDelete }) {
  const [renaming, setRenaming]     = useState(false)
  const [confirming, setConfirming] = useState(false)
  const sc = scopeCount(dashboard)

  return (
    <>
      <div className={`mdp-row${isActive ? ' mdp-row--active' : ''}`}>
        <div className={`mdp-row-icon${isAssigned ? ' mdp-row-icon--assigned' : ''}`}>
          {isAssigned ? <UserPlusIcon /> : <GridIcon />}
        </div>
        <button
          className={`mdp-star-btn${dashboard.pinned ? ' mdp-star-btn--on' : ''}`}
          onClick={() => onPin(dashboard.id)}
          aria-label={dashboard.pinned ? 'Unpin' : 'Pin to top'}
        >
          <StarIcon filled={dashboard.pinned} />
        </button>
        <div className="mdp-row-info">
          {renaming ? (
            <RenameCell
              value={dashboard.name}
              onSave={n => { onRename(dashboard.id, n); setRenaming(false) }}
              onCancel={() => setRenaming(false)}
            />
          ) : (
            <button className="mdp-row-name" onClick={() => onSwitch(dashboard.id)}>
              {dashboard.name}
              {isActive && <span className="mdp-active-badge">Active</span>}
            </button>
          )}
          <div className="mdp-row-meta">
            {isAssigned
              ? `Assigned to ${dashboard.audience?.label}${dashboard.audience?.role ? ` · ${dashboard.audience.role}` : ''}`
              : `Created for yourself${sc > 0 ? ` · ${sc} scope filter${sc !== 1 ? 's' : ''}` : ''}`
            }
          </div>
        </div>
        <div className="mdp-row-updated">
          <div className="mdp-row-updated-date">{formatDate(dashboard.updatedAt)}</div>
          <div className="mdp-row-updated-by">by you</div>
        </div>
        <div className="mdp-row-actions">
          <button className="mdp-action-btn" onClick={() => setRenaming(true)} title="Rename"><EditIcon /></button>
          <button className="mdp-action-btn" onClick={() => onDuplicate(dashboard.id)} title="Duplicate"><CopyIcon /></button>
          <button
            className={`mdp-action-btn mdp-action-btn--danger${isOnly ? ' mdp-action-btn--disabled' : ''}`}
            onClick={() => !isOnly && setConfirming(true)}
            disabled={isOnly}
            title={isOnly ? "Can't delete the only dashboard" : 'Delete'}
          >
            <TrashIcon />
          </button>
          <button className="mdp-action-btn" title="More actions"><MoreIcon /></button>
        </div>
      </div>
      {confirming && (
        <DeleteConfirm
          name={dashboard.name}
          onConfirm={() => { onDelete(dashboard.id); setConfirming(false) }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}

function Section({ title, subtitle, count, icon, dashboards, activeDashboardId, isOnly, collapsible, onSwitch, onRename, onPin, onDuplicate, onDelete }) {
  const [collapsed, setCollapsed] = useState(false)
  const isAssigned = title.toLowerCase().includes('assigned')

  return (
    <div className="mdp-section">
      <div className="mdp-section-header">
        <div className={`mdp-section-icon${isAssigned ? ' mdp-section-icon--assigned' : ''}`}>{icon}</div>
        <div className="mdp-section-heading">
          <h2 className="mdp-section-title">{title} <span className="mdp-section-count">({count})</span></h2>
          <p className="mdp-section-subtitle">{subtitle}</p>
        </div>
        {collapsible && (
          <button className="mdp-collapse-btn" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? 'Expand' : 'Collapse'} <ChevronIcon up={!collapsed} />
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="mdp-table">
          <div className="mdp-table-header">
            <div className="mdp-th mdp-th-icon" />
            <div className="mdp-th mdp-th-star" />
            <div className="mdp-th mdp-th-name">Dashboard</div>
            <div className="mdp-th mdp-th-updated">Last updated</div>
            <div className="mdp-th mdp-th-actions">Actions</div>
          </div>
          {dashboards.map(d => (
            <DashboardRow
              key={d.id}
              dashboard={d}
              isActive={d.id === activeDashboardId}
              isOnly={isOnly}
              isAssigned={isAssigned}
              onSwitch={onSwitch}
              onRename={onRename}
              onPin={onPin}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ManageDashboardsPage({
  dashboards, activeDashboardId,
  onBack, onSwitch, onCreate,
  onRename, onPin, onDuplicate, onDelete,
}) {
  const [query,  setQuery]  = useState('')
  const [sortBy, setSortBy] = useState('updatedAt')

  const filterFn = d => d.name.toLowerCase().includes(query.toLowerCase())

  const myDashboards = dashboards
    .filter(d => !d.audience || d.audience.id === 'myself')
    .filter(filterFn)
    .sort((a, b) => sortBy === 'updatedAt' ? (b.updatedAt || 0) - (a.updatedAt || 0) : a.name.localeCompare(b.name))

  const assignedDashboards = dashboards
    .filter(d => d.audience && d.audience.id !== 'myself')
    .filter(filterFn)
    .sort((a, b) => sortBy === 'updatedAt' ? (b.updatedAt || 0) - (a.updatedAt || 0) : a.name.localeCompare(b.name))

  const isOnly = dashboards.length <= 1

  const handleSwitch = (id) => { onSwitch(id); onBack() }

  return (
    <div className="mdp-page">
      <div className="mdp-page-inner">
        <button className="mdp-back" onClick={onBack}>
          <ArrowLeftIcon /> Back to dashboard
        </button>

        <div className="mdp-page-header">
          <div className="mdp-page-header-text">
            <h1 className="mdp-page-title">Manage dashboards</h1>
            <p className="mdp-page-subtitle">View, organize, and manage all dashboards you've created.</p>
          </div>
          <div className="mdp-page-header-actions">
            <button className="mdp-btn mdp-btn--primary" onClick={onCreate}>
              <PlusIcon /> Create new dashboard
            </button>
            <button className="mdp-btn mdp-btn--secondary">
              <MoreIcon /> More actions
            </button>
          </div>
        </div>

        <div className="mdp-toolbar">
          <div className="mdp-search-wrap">
            <span className="mdp-search-icon"><SearchIcon /></span>
            <input
              className="mdp-search-input"
              placeholder="Search dashboards…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="mdp-toolbar-right">
            <select className="mdp-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="updatedAt">Sort by: Last updated</option>
              <option value="name">Sort by: Name</option>
            </select>
          </div>
        </div>

        <div className="mdp-sections">
          {myDashboards.length > 0 && (
            <Section
              title="My dashboards" subtitle="Dashboards created for yourself."
              count={myDashboards.length} icon={<GridIcon />}
              dashboards={myDashboards} activeDashboardId={activeDashboardId}
              isOnly={isOnly} collapsible={false}
              onSwitch={handleSwitch} onRename={onRename} onPin={onPin}
              onDuplicate={onDuplicate} onDelete={onDelete}
            />
          )}
          {assignedDashboards.length > 0 && (
            <Section
              title="Assigned dashboards" subtitle="Dashboards created for other users."
              count={assignedDashboards.length} icon={<UserPlusIcon />}
              dashboards={assignedDashboards} activeDashboardId={activeDashboardId}
              isOnly={isOnly} collapsible={true}
              onSwitch={handleSwitch} onRename={onRename} onPin={onPin}
              onDuplicate={onDuplicate} onDelete={onDelete}
            />
          )}
          {query && myDashboards.length === 0 && assignedDashboards.length === 0 && (
            <div className="mdp-empty">No dashboards match "{query}"</div>
          )}
        </div>

        <div className="mdp-page-footer">
          <InfoIcon />
          Can't find a dashboard? You may not have access to it or it may have been archived.{' '}
          <button className="mdp-learn-more">Learn more</button>
        </div>
      </div>
    </div>
  )
}
