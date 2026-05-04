import './Sidebar.css'

/* SVG icon paths extracted from Figma design */
const icons = {
  shieldUser: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="M6.376 18.91a6 6 0 0 1 11.249.003" />
      <circle cx="12" cy="11" r="4" />
    </svg>
  ),
  userRoundCog: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 21a8 8 0 0 1 10.434-7.62" />
      <circle cx="10" cy="8" r="5" />
      <circle cx="18" cy="18" r="3" />
      <path d="m19.5 14.3-.4.9" />
      <path d="m16.9 20.8-.4.9" />
      <path d="m21.7 19.5-.9-.4" />
      <path d="m15.2 16.9-.9-.4" />
      <path d="m21.7 16.5-.9.4" />
      <path d="m15.2 19.1-.9.4" />
      <path d="m19.5 21.7-.4-.9" />
      <path d="m16.9 15.2-.4-.9" />
    </svg>
  ),
  book: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  ),
  hub: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="4" r="1" />
      <circle cx="18.5" cy="8" r="1" />
      <circle cx="18.5" cy="16" r="1" />
      <circle cx="12" cy="20" r="1" />
      <circle cx="5.5" cy="16" r="1" />
      <circle cx="5.5" cy="8" r="1" />
      <path d="M12 6v4" />
      <path d="m16.5 9-3 1.7" />
      <path d="m16.5 15-3-1.7" />
      <path d="M12 18v-4" />
      <path d="m7.5 15 3-1.7" />
      <path d="m7.5 9 3 1.7" />
    </svg>
  ),
  barChart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 16h.01" />
      <path d="M11 12h.01" />
      <path d="M15 8h.01" />
      <path d="M19 4h.01" />
    </svg>
  ),
  help: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  panelLeftClose: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  ),
}

const navItems = [
  { id: 'admin', icon: icons.shieldUser },
  { id: 'people', icon: icons.userRoundCog },
  { id: 'courses', icon: icons.book },
  { id: 'hub', icon: icons.hub },
  { id: 'insights', icon: icons.barChart },
]

export default function Sidebar({ onHelp }) {
  return (
    <div className="sidebar-frame">
      <aside className="sidebar-card">
        <nav className="sidebar-nav-group">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${item.id === 'insights' ? 'active' : ''}`}
            >
              <div className="sidebar-nav-icon">
                {item.icon}
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom-controls">
          <button
            className="sidebar-nav-item"
            onClick={onHelp}
            aria-label="Restart onboarding"
            title="Restart onboarding"
          >
            <div className="sidebar-nav-icon">{icons.help}</div>
          </button>
          <button className="sidebar-nav-item">
            <div className="sidebar-nav-icon">{icons.panelLeftClose}</div>
          </button>
        </div>
      </aside>
    </div>
  )
}
