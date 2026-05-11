import { useState } from 'react'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Customize from './pages/Customize.jsx'
import CreateDashboardModal from './components/dashboard/CreateDashboardModal.jsx'
import ManageDashboardsPage from './components/dashboard/ManageDashboardsPage.jsx'
import { Login } from './Login.jsx'
import './App.css'

const DASHBOARDS_KEY = 'insights_dashboards_v2'
const STORAGE_KEY    = 'insights_onboarding_config'

function loadLegacyConfig() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null } catch { return null }
}

/* A dashboard is "ready" (goes to dashboard view) when it has a config
   with at least one meaningful key beyond an empty scope object.
   Assigned dashboards always go to dashboard — they have seeded configs.
   Personal dashboards with no config at all go to onboarding. */
function dashboardIsReady(d) {
  if (!d) return false
  // Assigned dashboards always have a seeded config — always ready
  if (d.audience && d.audience.id !== 'myself') return true
  const c = d.config || {}
  // Ready if mode is set, or scope has any selections, or monitoring exists
  if (c.mode) return true
  if (c.monitoring && Object.keys(c.monitoring).length > 0) return true
  const scope = c.scope || {}
  return Object.values(scope).some(v => Array.isArray(v) ? v.length > 0 : !!v)
}

function seedDashboards() {
  const now = Date.now()
  const legacy = loadLegacyConfig()
  return [
    /* ── Personal dashboards ──────────────────────────────── */
    {
      id: 'insights', name: 'Insights Dashboard', pinned: true,
      audience: { id: 'myself', label: 'Myself' },
      // Use the user's real onboarding config if it exists
      config: legacy || { mode: 'auto', scope: {} },
      updatedAt: now - 1000 * 60 * 60 * 2,
    },
    {
      id: 'exec-summary', name: 'Executive Summary', pinned: false,
      audience: { id: 'myself', label: 'Myself' },
      config: {
        mode: 'auto',
        scope: { term: ['Spring 2025'], subAccounts: ['College of Science'] },
      },
      updatedAt: now - 1000 * 60 * 60 * 48,
    },
    {
      id: 'enrollment-risk', name: 'Enrollment Risk Overview', pinned: false,
      audience: { id: 'myself', label: 'Myself' },
      config: {
        mode: 'manual',
        scope: {
          term: ['Fall 2024'],
          studentGroups: ['Students on Probation'],
          subAccounts: ['College of Arts'],
        },
      },
      updatedAt: now - 1000 * 60 * 60 * 96,
    },

    /* ── Assigned dashboards — each has a real config ──────── */
    {
      id: 'advisor-db', name: 'Advisor Dashboard', pinned: false,
      audience: { id: 'sarah', label: 'Sarah Johnson', role: 'Advisor · College of Science' },
      config: {
        mode: 'auto',
        scope: {
          subAccounts: ['College of Science'],
          term: ['Spring 2025'],
          studentGroups: ['First-generation Students', 'Transfer Students'],
          courses: ['BIO 101', 'CHEM 201'],
        },
      },
      updatedAt: now - 1000 * 60 * 60 * 24,
    },
    {
      id: 'athletics-db', name: 'Athletics Dashboard', pinned: false,
      audience: { id: 'miller', label: 'Coach Miller', role: 'Athletics · Basketball Program' },
      config: {
        mode: 'manual',
        scope: {
          studentGroups: ['Student Athletes'],
          term: ['Spring 2025'],
          subAccounts: ['College of Science', 'College of Business'],
        },
      },
      updatedAt: now - 1000 * 60 * 60 * 72,
    },
    {
      id: 'retention-db', name: 'Retention Dashboard', pinned: false,
      audience: { id: 'wilson', label: 'Dean Wilson', role: 'Dean · College of Arts & Letters' },
      config: {
        mode: 'auto',
        scope: {
          subAccounts: ['College of Arts'],
          term: ['Spring 2025', 'Fall 2024'],
          studentGroups: ['Students on Probation', 'Undecided/Exploratory'],
        },
      },
      updatedAt: now - 1000 * 60 * 60 * 120,
    },
    {
      id: 'student-success', name: 'Student Success Overview', pinned: false,
      audience: { id: 'garcia', label: 'Maria Garcia', role: 'Success Coach · First-Year Program' },
      config: {
        mode: 'auto',
        scope: {
          studentGroups: ['First-generation Students', 'Undecided/Exploratory', 'Transfer Students'],
          term: ['Spring 2025'],
          subAccounts: ['College of Education'],
        },
      },
      updatedAt: now - 1000 * 60 * 60 * 240,
    },
  ]
}

function loadDashboards() {
  try {
    const raw = localStorage.getItem(DASHBOARDS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate: if any assigned dashboard has an empty config, backfill from seed
      const seed = seedDashboards()
      const seedMap = Object.fromEntries(seed.map(d => [d.id, d]))
      return parsed.map(d => {
        if (d.audience?.id !== 'myself' && (!d.config || Object.keys(d.config).length === 0)) {
          return { ...d, config: seedMap[d.id]?.config || { mode: 'auto', scope: {} } }
        }
        return d
      })
    }
  } catch { /* ignore */ }
  return seedDashboards()
}

function saveDashboards(list) {
  try { localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

const BYPASS_LOGIN = import.meta.env.VITE_BYPASS_LOGIN === '1'

export default function App() {
  const [authed, setAuthed] = useState(
    () => BYPASS_LOGIN || sessionStorage.getItem('inda_auth') === '1'
  )
  const [dashboards, setDashboards] = useState(() => loadDashboards())
  const [activeDashboardId, setActiveDashboardId] = useState(
    () => loadDashboards()[0]?.id || 'insights'
  )
  const [view, setView] = useState(() => {
    const first = loadDashboards()[0]
    return dashboardIsReady(first) ? 'dashboard' : 'onboarding'
  })
  const [createModalOpen, setCreateModalOpen] = useState(false)

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />

  /* ── Helpers ────────────────────────────────────────────── */

  const getActiveConfig = () =>
    dashboards.find(d => d.id === activeDashboardId)?.config || {}

  const touchDashboard = (id, updater) => {
    setDashboards(prev => {
      const next = prev.map(d =>
        d.id === id ? { ...updater(d), updatedAt: Date.now() } : d
      )
      saveDashboards(next)
      return next
    })
  }

  const updateActiveConfig = (updater) =>
    touchDashboard(activeDashboardId, d => ({ ...d, config: updater(d.config || {}) }))

  /* ── Onboarding / view ──────────────────────────────────── */

  const handleComplete = (nextConfig) => {
    updateActiveConfig(() => nextConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig))
    setView('dashboard')
  }

  const handleEditFromOnboarding = (nextConfig) => {
    updateActiveConfig(() => nextConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig))
    setView('customize')
  }

  const handleOnboarding     = () => setView('onboarding')
  const handleCustomize      = () => setView('customize')
  const handleCloseCustomize = () => setView('dashboard')

  /* ── Scope + monitoring ─────────────────────────────────── */

  const handleScopeChange = (newScope) =>
    updateActiveConfig(prev => ({ ...prev, scope: newScope }))

  const handleMonitoringChange = (widgetId, rules) =>
    updateActiveConfig(prev => ({
      ...prev,
      monitoring: { ...(prev.monitoring || {}), [widgetId]: rules },
    }))

  const handleDisplayChange = (widgetId, mode) =>
    updateActiveConfig(prev => {
      const display = { ...(prev.display || {}) }
      if (mode === 'table') display[widgetId] = 'table'
      else delete display[widgetId]
      return { ...prev, display }
    })

  /* ── Dashboard switcher ─────────────────────────────────── */

  const handleSwitchDashboard = (id) => {
    setActiveDashboardId(id)
    const target = dashboards.find(d => d.id === id)
    setView(dashboardIsReady(target) ? 'dashboard' : 'onboarding')
  }

  const handleCreateDashboard  = () => setCreateModalOpen(true)
  const handleManageDashboards = () => setView('manage')

  const handleDashboardCreated = ({ name, scope, audience }) => {
    const newId = `dashboard-${Date.now()}`
    const isAssigned = audience && audience.id !== 'myself'
    const updated = [
      ...dashboards,
      {
        id: newId,
        name: name || 'New Dashboard',
        pinned: false,
        audience: audience || { id: 'myself', label: 'Myself' },
        config: { mode: isAssigned ? 'auto' : 'manual', scope: scope || {} },
        updatedAt: Date.now(),
      },
    ]
    setDashboards(updated)
    saveDashboards(updated)
    setActiveDashboardId(newId)
    setView('dashboard')
  }

  /* ── Manage dashboards actions ──────────────────────────── */

  const handleRenameDashboard = (id, newName) =>
    touchDashboard(id, d => ({ ...d, name: newName }))

  const handlePinDashboard = (id) =>
    touchDashboard(id, d => ({ ...d, pinned: !d.pinned }))

  const handleDuplicateDashboard = (id) => {
    const source = dashboards.find(d => d.id === id)
    if (!source) return
    const copy = {
      ...source,
      id: `dashboard-${Date.now()}`,
      name: `${source.name} (Copy)`,
      pinned: false,
      config: JSON.parse(JSON.stringify(source.config || {})),
      updatedAt: Date.now(),
    }
    const updated = [...dashboards, copy]
    setDashboards(updated)
    saveDashboards(updated)
  }

  const handleDeleteDashboard = (id) => {
    if (dashboards.length <= 1) return
    const updated = dashboards.filter(d => d.id !== id)
    setDashboards(updated)
    saveDashboards(updated)
    if (activeDashboardId === id) {
      const next = updated[0]
      setActiveDashboardId(next.id)
      setView(dashboardIsReady(next) ? 'dashboard' : 'onboarding')
    }
  }

  const config = getActiveConfig()

  return (
    <div className="app-shell">
      <Sidebar onHelp={handleOnboarding} />
      <div className="app-main">
        {view !== 'manage' && (
          <TopBar
            view={view}
            onCustomize={handleCustomize}
            dashboards={dashboards}
            activeDashboardId={activeDashboardId}
            onSwitchDashboard={handleSwitchDashboard}
            onCreateDashboard={handleCreateDashboard}
            onManageDashboards={handleManageDashboards}
          />
        )}

        {view === 'onboarding' && (
          <Onboarding
            onComplete={handleComplete}
            onEditDashboard={handleEditFromOnboarding}
            initialConfig={config}
          />
        )}
        {view === 'customize' && (
          <Customize
            onClose={handleCloseCustomize}
            config={config}
            onScopeChange={handleScopeChange}
            onMonitoringChange={handleMonitoringChange}
            onDisplayChange={handleDisplayChange}
          />
        )}
        {view === 'dashboard' && <Dashboard config={config} />}
        {view === 'manage' && (
          <ManageDashboardsPage
            dashboards={dashboards}
            activeDashboardId={activeDashboardId}
            onBack={() => setView('dashboard')}
            onSwitch={handleSwitchDashboard}
            onCreate={handleCreateDashboard}
            onRename={handleRenameDashboard}
            onPin={handlePinDashboard}
            onDuplicate={handleDuplicateDashboard}
            onDelete={handleDeleteDashboard}
          />
        )}
      </div>

      <CreateDashboardModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleDashboardCreated}
      />
    </div>
  )
}
