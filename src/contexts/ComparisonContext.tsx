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
  setExperimentA: (exp: ComparisonExperiment | null) => void
  setExperimentB: (exp: ComparisonExperiment | null) => void
  startComparison: () => void
  stopComparison: () => void
}

const ComparisonContext = createContext<ComparisonContextValue | undefined>(undefined)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [experimentA, setExperimentA] = useState<ComparisonExperiment | null>(null)
  const [experimentB, setExperimentB] = useState<ComparisonExperiment | null>(null)
  const [isComparing, setIsComparing] = useState(false)

  const startComparison = () => {
    if (experimentA && experimentB) {
      setIsComparing(true)
    }
  }

  const stopComparison = () => {
    setIsComparing(false)
  }

  return (
    <ComparisonContext.Provider
      value={{
        experimentA,
        experimentB,
        isComparing,
        setExperimentA,
        setExperimentB,
        startComparison,
        stopComparison,
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
