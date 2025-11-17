import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { SimulationProvider } from './contexts/SimulationContext'
import { GraphicsProvider } from './contexts/GraphicsContext'
import { ComparisonProvider } from './contexts/ComparisonContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalStyles } from './styles/GlobalStyles'

// Lazy loading으로 라우트 컴포넌트 분리
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })))
const PitchSimulator = lazy(() => import('./scenarios/pitch/PitchSimulator').then(m => ({ default: m.PitchSimulator })))

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div style={{
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0e27',
    color: '#64748b'
  }}>
    로딩 중...
  </div>
)

function App() {
  return (
    <>
      <GlobalStyles />
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
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
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </>
  )
}

export default App
