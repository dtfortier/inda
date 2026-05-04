import { useState } from 'react'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Customize from './pages/Customize.jsx'
/*import { Login } from './Login.jsx'*/
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

function App() {
  /*const [authed, setAuthed] = useState(() => sessionStorage.getItem('inda_auth') === '1')*/
  const [authed, setAuthed] = useState(true)
  const [config, setConfig] = useState(() => loadConfig())
  const [view, setView] = useState(() => (loadConfig() === null ? 'onboarding' : 'dashboard'))

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />

  const handleComplete = (nextConfig) => {
    setConfig(nextConfig)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig))
    setView('dashboard')
  }

  const handleOnboarding = () => setView('onboarding')
  const handleCustomize = () => setView('customize')
  const handleCloseCustomize = () => setView('dashboard')

  return (
    <div className="app-shell">
      <Sidebar onHelp={handleOnboarding} />
      <div className="app-main">
        <TopBar onCustomize={handleCustomize} />
        {view === 'onboarding' && <Onboarding onComplete={handleComplete} initialConfig={config} />}
        {view === 'customize' && <Customize onClose={handleCloseCustomize} />}
        {view === 'dashboard' && <Dashboard />}
      </div>
    </div>
  )
}

export default App
