import { useState } from 'react'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Customize from './pages/Customize.jsx'
import CreateDashboardModal from './components/dashboard/CreateDashboardModal.jsx'
import ManageDashboardsModal from './components/dashboard/ManageDashboardsModal.jsx'
import { Login } from './Login.jsx'
import './App.css'

/* ── Storage keys ──────────────────────────────────────────────
   v2 stores the new shape: an array of dashboards, each owning its
   own config (scope, monitoring, audience, etc.). Old keys are kept
   only so we can migrate v1 data on first load. */
const DASHBOARDS_V2_KEY = 'insights_dashboards_v2'
const LEGACY_CONFIG_KEY = 'insights_onboarding_config'
const LEGACY_DASHBOARDS_KEY = 'insights_dashboards'

function safeParse(raw) {
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

/* Read v2 if present, otherwise migrate from v1 (legacy single
   config + legacy dashboard list). The first dashboard in the
   migrated list inherits the legacy config so the user's existing
   scope / monitoring carry over. */
function loadDashboardList() {
  const v2 = safeParse(localStorage.getItem(DASHBOARDS_V2_KEY))
  if (Array.isArray(v2) && v2.length > 0) return v2

  const legacyConfig = safeParse(localStorage.getItem(LEGACY_CONFIG_KEY))
  const legacyDashboards = safeParse(localStorage.getItem(LEGACY_DASHBOARDS_KEY))

  if (legacyConfig || legacyDashboards) {
    const list = (Array.isArray(legacyDashboards) && legacyDashboards.length > 0)
      ? legacyDashboards.map((d, i) => ({
          id: d.id,
          name: d.name,
          config: i === 0 ? (legacyConfig || null) : null,
        }))
      : [{ id: 'insights', name: 'Insights Dashboard', config: legacyConfig || null }]
    /* Persist the migrated list to v2 so subsequent loads skip
       the migration path. */
    try { localStorage.setItem(DASHBOARDS_V2_KEY, JSON.stringify(list)) } catch { /* ignore */ }
    return list
  }

  /* Fresh install — return null so the caller can route to onboarding. */
  return null
}

function saveDashboardList(list) {
  try { localStorage.setItem(DASHBOARDS_V2_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

/* Build a config object from CreateDashboardModal's payload. */
function buildConfigFromModal({ audience, scope }) {
  return {
    mode: 'manual',
    focusAreas: [],
    scope: scope || {},
    monitoring: {},
    audience: audience || null,
  }
}

const BYPASS_LOGIN = import.meta.env.VITE_BYPASS_LOGIN === '1'

const DEFAULT_DASHBOARDS = [
  { id: 'insights', name: 'Insights Dashboard', config: null },
]

function App() {
  const [authed, setAuthed] = useState(
    () => BYPASS_LOGIN || sessionStorage.getItem('inda_auth') === '1'
  )

  /* Single source of truth for everything dashboard-related. Each entry
     owns its own config; the active one drives Dashboard + Customize. */
  const [dashboards, setDashboards] = useState(() => loadDashboardList() || DEFAULT_DASHBOARDS)
  const [activeDashboardId, setActiveDashboardId] = useState(
    () => (loadDashboardList() || DEFAULT_DASHBOARDS)[0]?.id || 'insights'
  )

  /* Show onboarding only on a true first-run (no dashboards stored
     and no scope yet on the first dashboard). After that, all new
     dashboards come through CreateDashboardModal. */
  const [view, setView] = useState(() => {
    const list = loadDashboardList()
    return list?.[0]?.config ? 'dashboard' : 'onboarding'
  })

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [manageModalOpen, setManageModalOpen] = useState(false)

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />

  /* Derive the active dashboard's config every render. If the active
     id ever points at a missing dashboard (e.g. after a delete), fall
     back to the first one. */
  const activeDashboard =
    dashboards.find((d) => d.id === activeDashboardId) || dashboards[0]
  const activeConfig = activeDashboard?.config || null

  /* Helper: replace the active dashboard's config and persist. The
     `updater` may be a value or a function (prev) => next, mirroring
     the React useState API for ergonomic in-place edits. */
  const updateActiveConfig = (updater) => {
    setDashboards((prev) => {
      const next = prev.map((d) => {
        if (d.id !== activeDashboardId) return d
        const nextConfig =
          typeof updater === 'function' ? updater(d.config || null) : updater
        return { ...d, config: nextConfig }
      })
      saveDashboardList(next)
      return next
    })
  }

  /* ── Onboarding (first-run only) ── */
  const handleComplete = (nextConfig) => {
    updateActiveConfig(nextConfig)
    setView('dashboard')
  }

  const handleEditFromOnboarding = (nextConfig) => {
    updateActiveConfig(nextConfig)
    setView('customize')
  }

  const handleOnboarding = () => setView('onboarding')
  const handleCustomize = () => setView('customize')
  const handleCloseCustomize = () => setView('dashboard')

  /* ── Active-dashboard config edits (Edit Scope, Edit Widget) ── */
  const handleScopeChange = (newScope) => {
    updateActiveConfig((prev) => ({ ...(prev || {}), scope: newScope }))
  }

  const handleMonitoringChange = (widgetId, rules) => {
    updateActiveConfig((prev) => {
      const prevMonitoring = (prev && prev.monitoring) || {}
      return {
        ...(prev || {}),
        monitoring: { ...prevMonitoring, [widgetId]: rules },
      }
    })
  }

  /* ── Dashboard navigation ── */
  const handleSwitchDashboard = (id) => {
    setActiveDashboardId(id)
    /* Always land on the dashboard view when switching. If the user
       was mid-customize, switching cancels that. */
    setView('dashboard')
  }

  const handleCreateDashboard = () => setCreateModalOpen(true)

  /* Receives { name, audience, scope } from CreateDashboardModal. The
     audience + scope produced by the modal are baked into the new
     dashboard's config so it actually shows different data. */
  const handleDashboardCreated = (payload) => {
    const newId = `dashboard-${Date.now()}`
    const newDashboard = {
      id: newId,
      name: payload?.name || 'New Dashboard',
      config: buildConfigFromModal(payload || {}),
    }
    const updated = [...dashboards, newDashboard]
    setDashboards(updated)
    saveDashboardList(updated)
    setActiveDashboardId(newId)
    setView('dashboard')
  }

  /* ── Manage Dashboards ── */
  const handleManageDashboards = () => setManageModalOpen(true)

  const handleRenameDashboard = (id, newName) => {
    const trimmed = (newName || '').trim()
    if (!trimmed) return
    setDashboards((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, name: trimmed } : d))
      saveDashboardList(next)
      return next
    })
  }

  const handleDuplicateDashboard = (id) => {
    setDashboards((prev) => {
      const idx = prev.findIndex((d) => d.id === id)
      if (idx === -1) return prev
      const source = prev[idx]
      const newId = `dashboard-${Date.now()}`
      /* Deep-clone the config so future edits to the duplicate don't
         leak back into the original. structuredClone is widely
         supported now; falls back to JSON-clone if needed. */
      let configCopy = null
      if (source.config) {
        try {
          configCopy = typeof structuredClone === 'function'
            ? structuredClone(source.config)
            : JSON.parse(JSON.stringify(source.config))
        } catch {
          configCopy = JSON.parse(JSON.stringify(source.config))
        }
      }
      const dupe = {
        id: newId,
        name: `${source.name} (Copy)`,
        config: configCopy,
      }
      const next = [...prev.slice(0, idx + 1), dupe, ...prev.slice(idx + 1)]
      saveDashboardList(next)
      return next
    })
  }

  const handleDeleteDashboard = (id) => {
    setDashboards((prev) => {
      /* Refuse to delete the last dashboard — the app needs at least
         one to render anything. The Manage modal disables the delete
         action in that case too, but this is the safety net. */
      if (prev.length <= 1) return prev
      const next = prev.filter((d) => d.id !== id)
      saveDashboardList(next)
      /* If we just deleted the active one, point at the first
         remaining dashboard so the view doesn't break. */
      if (id === activeDashboardId) {
        setActiveDashboardId(next[0].id)
      }
      return next
    })
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
            initialConfig={activeConfig}
          />
        )}
        {view === 'customize' && (
          <Customize
            onClose={handleCloseCustomize}
            config={activeConfig}
            onScopeChange={handleScopeChange}
            onMonitoringChange={handleMonitoringChange}
          />
        )}
        {view === 'dashboard' && <Dashboard config={activeConfig} />}
      </div>

      <CreateDashboardModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleDashboardCreated}
      />

      <ManageDashboardsModal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        dashboards={dashboards}
        activeDashboardId={activeDashboardId}
        onRename={handleRenameDashboard}
        onDuplicate={handleDuplicateDashboard}
        onDelete={handleDeleteDashboard}
      />
    </div>
  )
}

export default App
