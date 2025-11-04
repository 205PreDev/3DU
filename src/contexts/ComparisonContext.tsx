import { createContext, useContext, useState, ReactNode } from 'react'
import { SimulationResult, PitchParameters } from '../types'

interface ComparisonExperiment {
  id: string
  name: string
  params: PitchParameters
  result: SimulationResult
}

interface ComparisonContextValue {
  experimentA: ComparisonExperiment | null
  experimentB: ComparisonExperiment | null
  isComparing: boolean
  showForceVectors: boolean
  comparisonReplayTime: number
  setExperimentA: (exp: ComparisonExperiment | null) => void
  setExperimentB: (exp: ComparisonExperiment | null) => void
  startComparison: () => void
  stopComparison: () => void
  setShowForceVectors: (show: boolean) => void
  setComparisonReplayTime: (time: number) => void
}

const ComparisonContext = createContext<ComparisonContextValue | undefined>(undefined)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [experimentA, setExperimentA] = useState<ComparisonExperiment | null>(null)
  const [experimentB, setExperimentB] = useState<ComparisonExperiment | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [showForceVectors, setShowForceVectors] = useState(false)
  const [comparisonReplayTime, setComparisonReplayTime] = useState(0)

  const startComparison = () => {
    if (experimentA && experimentB) {
      setIsComparing(true)
      setComparisonReplayTime(0) // 리셋
    }
  }

  const stopComparison = () => {
    setIsComparing(false)
    setShowForceVectors(false)
    setComparisonReplayTime(0)
  }

  return (
    <ComparisonContext.Provider
      value={{
        experimentA,
        experimentB,
        isComparing,
        showForceVectors,
        comparisonReplayTime,
        setExperimentA,
        setExperimentB,
        startComparison,
        stopComparison,
        setShowForceVectors,
        setComparisonReplayTime,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider')
  }
  return context
}
