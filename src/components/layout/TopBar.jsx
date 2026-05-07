import DashboardSwitcher from './DashboardSwitcher.jsx'
import './TopBar.css'

export default function TopBar({
  view,
  onCustomize,
  dashboards,
  activeDashboardId,
  onSwitchDashboard,
  onCreateDashboard,
  onManageDashboards,
}) {
  /* Edit Dashboard belongs to the saved-dashboard experience. Hide it
     during onboarding so the only edit affordance shown there is the
     "Edit Dashboard" button on the review step. */
  const showEditDashboard = view !== 'onboarding'

  return (
    <div className="topbar-frame">
      <header className="topbar-bar">
        <div className="topbar-left">
          <div className="topbar-controls">
            <button className="icon-btn primary" aria-label="Go back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </button>
            <button className="icon-btn primary" aria-label="Canvas">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0z" />
              </svg>
            </button>
          </div>

          {/* Dashboard switcher replaces the static h1 title */}
          {view === 'onboarding' ? (
            <h1 className="topbar-title">Insights Dashboard</h1>
          ) : (
            <DashboardSwitcher
              dashboards={dashboards || DEFAULT_DASHBOARDS}
              activeDashboardId={activeDashboardId}
              onSwitch={onSwitchDashboard || (() => {})}
              onCreate={onCreateDashboard || (() => {})}
              onManage={onManageDashboards || (() => {})}
            />
          )}
        </div>

        <div className="topbar-right">
          <div className="icon-btn primary" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0z" />
            </svg>
          </div>
          {showEditDashboard && (
            <button className="icon-btn primary with-label" aria-label="Edit Dashboard" onClick={onCustomize}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="icon-btn-label">Edit Dashboard</span>
            </button>
          )}
          <button className="icon-btn ai-gradient" aria-label="IgniteAI">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 2 12l10 9 10-9z" />
              <path d="m12 7.5-5 4.5 5 4.5 5-4.5z" />
            </svg>
          </button>
        </div>
      </header>
    </div>
  )
}

/* Fallback dashboard list — used when App hasn't seeded dashboards yet */
const DEFAULT_DASHBOARDS = [
  { id: 'insights', name: 'Insights Dashboard' },
]
