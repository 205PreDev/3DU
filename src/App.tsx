import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SimulationProvider } from './contexts/SimulationContext'
import { GraphicsProvider } from './contexts/GraphicsContext'
import { ComparisonProvider } from './contexts/ComparisonContext'
import { PitchSimulator } from './scenarios/pitch/PitchSimulator'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalStyles } from './styles/GlobalStyles'

function App() {
  return (
    <>
      <GlobalStyles />
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/mechanics/pitch"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <GraphicsProvider>
                      <SimulationProvider>
                        <ComparisonProvider>
                          <PitchSimulator />
                        </ComparisonProvider>
                      </SimulationProvider>
                    </GraphicsProvider>
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </>
  )
}

export default App
