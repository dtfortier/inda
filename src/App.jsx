import { useState } from 'react'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Customize from './pages/Customize.jsx'
import CreateDashboardModal from './components/dashboard/CreateDashboardModal.jsx'
import { Login } from './Login.jsx'
import './App.css'

const STORAGE_KEY = 'insights_onboarding_config'
const DASHBOARDS_KEY = 'insights_dashboards'

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function loadDashboards() {
  try {
    const raw = localStorage.getItem(DASHBOARDS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return [{ id: 'insights', name: 'Insights Dashboard' }]
}

function saveDashboards(list) {
  try { localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

const BYPASS_LOGIN = import.meta.env.VITE_BYPASS_LOGIN === '1'

function App() {
  const [authed, setAuthed] = useState(
    () => BYPASS_LOGIN || sessionStorage.getItem('inda_auth') === '1'
  )
  const [config, setConfig] = useState(() => loadConfig())
  const [view, setView] = useState(() => (loadConfig() === null ? 'onboarding' : 'dashboard'))

  const [dashboards, setDashboards] = useState(() => loadDashboards())
  const [activeDashboardId, setActiveDashboardId] = useState(
    () => loadDashboards()[0]?.id || 'insights'
  )

  // Create dashboard modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />

  const handleComplete = (nextConfig) => {
    setConfig(nextConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig))
    setView('dashboard')
  }

  const handleEditFromOnboarding = (nextConfig) => {
    setConfig(nextConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig))
    setView('customize')
  }

  const handleOnboarding = () => setView('onboarding')
  const handleCustomize = () => setView('customize')
  const handleCloseCustomize = () => setView('dashboard')

  const handleScopeChange = (newScope) => {
    setConfig((prev) => {
      const next = { ...(prev || {}), scope: newScope }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const handleMonitoringChange = (widgetId, rules) => {
    setConfig((prev) => {
      const prevMonitoring = (prev && prev.monitoring) || {}
      const nextMonitoring = { ...prevMonitoring, [widgetId]: rules }
      const next = { ...(prev || {}), monitoring: nextMonitoring }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const handleSwitchDashboard = (id) => {
    setActiveDashboardId(id)
  }

  /* Opens the Create Dashboard modal instead of jumping straight to onboarding */
  const handleCreateDashboard = () => {
    setCreateModalOpen(true)
  }

  /* Called when the user completes or saves-and-exits the create modal */
  const handleDashboardCreated = ({ name }) => {
    const newId = `dashboard-${Date.now()}`
    const newDashboard = { id: newId, name: name || 'New Dashboard' }
    const updated = [...dashboards, newDashboard]
    setDashboards(updated)
    saveDashboards(updated)
    setActiveDashboardId(newId)
    // Stay on the dashboard view — the new dashboard is now the active one
    setView('dashboard')
  }

  const handleManageDashboards = () => {
    console.log('Manage dashboards — coming soon')
  }

  return (
    <div className="app-shell">
      <Sidebar onHelp={handleOnboarding} />
      <div className="app-main">
        <TopBar
          view={view}
          onCustomize={handleCustomize}
          dashboards={dashboards}
          activeDashboardId={activeDashboardId}
          onSwitchDashboard={handleSwitchDashboard}
          onCreateDashboard={handleCreateDashboard}
          onManageDashboards={handleManageDashboards}
        />
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
          />
        )}
        {view === 'dashboard' && <Dashboard config={config} />}
      </div>

      {/* Create Dashboard modal — rendered at app level so it floats above everything */}
      <CreateDashboardModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleDashboardCreated}
      />
    </div>
  )
}

export default App
