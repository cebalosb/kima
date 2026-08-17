import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { AppDataProvider } from './lib/data'
import { AuthProvider } from './lib/auth'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { SupabaseSetupNotice } from './components/SupabaseSetupNotice'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isSupabaseConfigured ? (
      <BrowserRouter>
        <AuthProvider>
          <AppDataProvider>
            <App />
          </AppDataProvider>
        </AuthProvider>
      </BrowserRouter>
    ) : (
      <SupabaseSetupNotice />
    )}
  </StrictMode>,
)
