import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Hide loader when React is ready
const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Mark app as ready after first render
setTimeout(() => {
  document.body.classList.add('app-ready')
}, 100)
