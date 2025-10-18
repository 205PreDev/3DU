import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  PitchParameters,
  SimulationResult,
  UIMode,
  PitchType,
  SimpleModeInputs,
  PHYSICS_CONSTANTS
} from '@/types'
import { runSimulation } from '@/core/physics/simulator'
import { PITCH_PRESETS } from '@/scenarios/pitch/presets'

interface SimulationContextType {
  // 상태
  params: PitchParameters
  result: SimulationResult | null
  isSimulating: boolean
  uiMode: UIMode

  // 액션
  setParams: (params: Partial<PitchParameters>) => void
  setUIMode: (mode: UIMode) => void
  setPreset: (pitchType: PitchType) => void
  setSimpleModeInputs: (inputs: SimpleModeInputs) => void
  runSimulation: () => void
  reset: () => void
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

const DEFAULT_PARAMS: PitchParameters = {
  mass: PHYSICS_CONSTANTS.BASEBALL_MASS,
  radius: PHYSICS_CONSTANTS.BASEBALL_RADIUS,
  initialSpeed: 35,
  releaseAngle: -2,
  releaseHeight: 2.0,
  releasePosition: { x: 0, y: 2.0, z: 0 },
  spinRate: 2000,
  spinAxis: { x: 0, y: 1, z: 0 },
  airDensity: PHYSICS_CONSTANTS.AIR_DENSITY_SEA_LEVEL,
  gravity: PHYSICS_CONSTANTS.GRAVITY,
  dragCoefficient: PHYSICS_CONSTANTS.DRAG_COEFFICIENT,
  liftCoefficient: PHYSICS_CONSTANTS.LIFT_COEFFICIENT
}

export function SimulationProvider({ children }: { children: ReactNode }): JSX.Element {
  const [params, setParamsState] = useState<PitchParameters>(DEFAULT_PARAMS)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [uiMode, setUIMode] = useState<UIMode>('simple')

  const setParams = (newParams: Partial<PitchParameters>): void => {
    setParamsState(prev => ({ ...prev, ...newParams }))
  }

  const setPreset = (pitchType: PitchType): void => {
    setParamsState(PITCH_PRESETS[pitchType])
  }

  const setSimpleModeInputs = (inputs: SimpleModeInputs): void => {
    // 단순 모드 입력을 전문가 모드 파라미터로 매핑
    const preset = PITCH_PRESETS[inputs.pitchType]
    const mappedSpeed = 20 + inputs.throwPower * 3  // 1-10 -> 23-50 m/s

    setParamsState({
      ...preset,
      initialSpeed: mappedSpeed
    })
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

  const value: SimulationContextType = {
    params,
    result,
    isSimulating,
    uiMode,
    setParams,
    setUIMode,
    setPreset,
    setSimpleModeInputs,
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
