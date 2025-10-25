import { createContext, useContext, useState, ReactNode } from 'react'
import {
  PitchParameters,
  SimulationResult,
  PitchType,
  DEFAULT_BALL,
  DEFAULT_ENVIRONMENT
} from '@/types'
import { runSimulation } from '@/core/physics/simulator'
import { PITCH_PRESETS } from '@/scenarios/pitch/presets'

// v2: UI 모드 제거, SimpleModeInputs 제거
interface SimulationContextType {
  // 상태
  params: PitchParameters
  result: SimulationResult | null
  isSimulating: boolean

  // 액션
  setParams: (params: Partial<PitchParameters>) => void
  setPreset: (pitchType: PitchType) => void
  runSimulation: () => void
  reset: () => void
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

// v2: 기본 파라미터 (3단 구조)
const DEFAULT_PARAMS: PitchParameters = {
  ball: DEFAULT_BALL,
  initial: {
    velocity: 35,  // m/s
    angle: { horizontal: 0, vertical: -2 },
    spin: { x: 0, y: 2000, z: 0 },  // 백스핀 2000rpm
    releaseHeight: 2.0,
    releasePosition: { x: 0, y: 2.0, z: 0 }
  },
  environment: DEFAULT_ENVIRONMENT
}

export function SimulationProvider({ children }: { children: ReactNode }): JSX.Element {
  const [params, setParamsState] = useState<PitchParameters>(DEFAULT_PARAMS)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // v2: 깊은 병합을 위한 setParams
  const setParams = (newParams: Partial<PitchParameters>): void => {
    setParamsState(prev => ({
      ...prev,
      ...newParams,
      ball: newParams.ball ? { ...prev.ball, ...newParams.ball } : prev.ball,
      initial: newParams.initial ? { ...prev.initial, ...newParams.initial } : prev.initial,
      environment: newParams.environment ? { ...prev.environment, ...newParams.environment } : prev.environment
    }))
  }

  const setPreset = (pitchType: PitchType): void => {
    setParamsState(PITCH_PRESETS[pitchType])
  }

  const runSim = (): void => {
    setIsSimulating(true)
    try {
      const simResult = runSimulation(params, { dt: 0.01, maxTime: 5.0 })
      setResult(simResult)
    } catch (error) {
      console.error('Simulation error:', error)
    } finally {
      setIsSimulating(false)
    }
  }

  const reset = (): void => {
    setParamsState(DEFAULT_PARAMS)
    setResult(null)
  }

  // v2: uiMode, setUIMode, setSimpleModeInputs 제거
  const value: SimulationContextType = {
    params,
    result,
    isSimulating,
    setParams,
    setPreset,
    runSimulation: runSim,
    reset
  }

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation(): SimulationContextType {
  const context = useContext(SimulationContext)
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider')
  }
  return context
}
