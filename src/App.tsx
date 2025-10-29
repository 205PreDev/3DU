import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SimulationProvider } from './contexts/SimulationContext'
import { GraphicsProvider } from './contexts/GraphicsContext'
import { ComparisonProvider } from './contexts/ComparisonContext'
import { PitchSimulator } from './scenarios/pitch/PitchSimulator'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/pitch"
          element={
            <ProtectedRoute>
              <GraphicsProvider>
                <SimulationProvider>
                  <ComparisonProvider>
                    <PitchSimulator />
                  </ComparisonProvider>
                </SimulationProvider>
              </GraphicsProvider>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
