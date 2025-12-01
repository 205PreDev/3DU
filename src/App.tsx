import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SimulationProvider } from './contexts/SimulationContext'
import { GraphicsProvider } from './contexts/GraphicsContext'
import { ComparisonProvider } from './contexts/ComparisonContext'
import { ChallengeProvider } from './contexts/ChallengeContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GlobalStyles } from './styles/GlobalStyles'
import { ToastContainer } from './core/ui/ToastContainer'
import styled from 'styled-components'

// Lazy load pages
const PitchSimulator = lazy(() => import('./scenarios/pitch/PitchSimulator').then(m => ({ default: m.PitchSimulator })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })))

const LoadingFallback = () => (
  <LoadingContainer>
    <Spinner />
    <LoadingText>로딩 중...</LoadingText>
  </LoadingContainer>
)

function App() {
  return (
    <>
      <GlobalStyles />
      <ErrorBoundary>
        <ToastProvider>
          <BrowserRouter>
            <ToastContainer />
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
                              <ChallengeProvider>
                                <PitchSimulator />
                              </ChallengeProvider>
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
        </ToastProvider>
      </ErrorBoundary>
    </>
  )
}

export default App

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #0A0E27;
  gap: 16px;
`

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #1C2340;
  border-top-color: #00D9FF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const LoadingText = styled.div`
  font-size: 16px;
  color: #B4B9D5;
`
