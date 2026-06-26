import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import ToastProvider from './components/ToastProvider'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ToastProvider>
  </React.StrictMode>
)
