import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProfilesProvider } from './context/ProfilesContext'
import { AuthProvider } from './context/AuthContext'
import { StolenProvider } from './context/StolenContext'
import App from './App'
import './index.css'

const savedTheme = localStorage.getItem('tracksure_theme') || 'dark'
document.documentElement.dataset.theme = savedTheme

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProfilesProvider>
        <AuthProvider>
          <StolenProvider>
            <App />
          </StolenProvider>
        </AuthProvider>
      </ProfilesProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
