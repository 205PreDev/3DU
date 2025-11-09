import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Hide loader when React is ready
const root = ReactDOM.createRoot(document.getElementById('root')!)

// Delay render until after first paint to ensure styled-components loads
requestAnimationFrame(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )

  // Mark app as ready after styled-components has injected styles
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('app-ready')
    })
  })
})
