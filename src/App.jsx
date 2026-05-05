import { useState } from 'react'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Customize from './pages/Customize.jsx'
import { Login } from './Login.jsx'
import './App.css'

const STORAGE_KEY = 'insights_onboarding_config'

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/* Local-dev bypass: set VITE_BYPASS_LOGIN=1 in .env.local to skip the
   login gate while iterating. .env.local is gitignored so this never
   ships to GitHub; the gate still works for anyone else. */
const BYPASS_LOGIN = import.meta.env.VITE_BYPASS_LOGIN === '1'

function App() {
  const [authed, setAuthed] = useState(
    () => BYPASS_LOGIN || sessionStorage.getItem('inda_auth') === '1'
  )
  const [config, setConfig] = useState(() => loadConfig())
  const [view, setView] = useState(() => (loadConfig() === null ? 'onboarding' : 'dashboard'))

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />

  const handleComplete = (nextConfig) => {
    setConfig(nextConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig))
    setView('dashboard')
  }

  /* Called from Step 4's "Edit Dashboard" button. Saves the onboarding
     config so Customize has something to work with, then jumps the user
     straight into the customize flow instead of showing the dashboard
     first. */
  const handleEditFromOnboarding = (nextConfig) => {
    setConfig(nextConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig))
    setView('customize')
  }

  const handleOnboarding = () => setView('onboarding')
  const handleCustomize = () => setView('customize')
  const handleCloseCustomize = () => setView('dashboard')

  return (
    <div className="app-shell">
      <Sidebar onHelp={handleOnboarding} />
      <div className="app-main">
        <TopBar view={view} onCustomize={handleCustomize} />
        {view === 'onboarding' && (
          <Onboarding
            onComplete={handleComplete}
            onEditDashboard={handleEditFromOnboarding}
            initialConfig={config}
          />
        )}
        {view === 'customize' && <Customize onClose={handleCloseCustomize} />}
        {view === 'dashboard' && <Dashboard config={config} />}
      </div>
    </div>
  )
}

export default App
