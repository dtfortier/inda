import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { InstUISettingsProvider } from '@instructure/ui'
import { canvas } from '@instructure/ui-themes'
import Highcharts from 'highcharts'
import highchartsTheme from './theme/highchartsTheme.js'
import App from './App.jsx'
import './index.css'

Highcharts.setOptions(highchartsTheme)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <InstUISettingsProvider theme={canvas}>
      <App />
    </InstUISettingsProvider>
  </StrictMode>,
)
