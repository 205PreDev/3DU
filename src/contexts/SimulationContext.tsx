import { createContext, useContext, useState, ReactNode } from 'react'
import {
  PitchParameters,
  SimulationResult,
  DEFAULT_BALL,
  DEFAULT_ENVIRONMENT
} from '@/types'
import { runSimulation } from '@/core/physics/simulator'

// v3: 프리셋 제거 (직접 입력 전용)
// v4: 리플레이 및 카메라 상태 추가
interface SimulationContextType {
  // 상태
  params: PitchParameters
  result: SimulationResult | null
  isSimulating: boolean

  // 리플레이 상태
  isReplaying: boolean
  replayTime: number            // 현재 재생 시간 (초)
  playbackSpeed: number         // 재생 속도 (0.25 ~ 2.0)

  // 카메라 상태
  cameraPreset: CameraPreset

  // 액션
  setParams: (params: Partial<PitchParameters>) => void
  runSimulation: () => void
  reset: () => void

  // 리플레이 액션
  setIsReplaying: (playing: boolean) => void
  setReplayTime: (time: number) => void
  setPlaybackSpeed: (speed: number) => void

  // 카메라 액션
  setCameraPreset: (preset: CameraPreset) => void
}

export type CameraPreset = 'catcher' | 'pitcher' | 'side' | 'follow' | 'free'

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

// v2: 기본 파라미터 (3단 구조)
const DEFAULT_PARAMS: PitchParameters = {
  ball: DEFAULT_BALL,
  initial: {
    velocity: 35,  // m/s
    angle: { horizontal: 0, vertical: -2 },
    spin: { x: 0, y: 2000, z: 0 },  // 백스핀 2000rpm
    releasePoint: { x: 0, y: 2.0, z: 0 }  // 중앙, 높이 2m, 투구판 위치
  },
  environment: DEFAULT_ENVIRONMENT
}

export function SimulationProvider({ children }: { children: ReactNode }): JSX.Element {
  const [params, setParamsState] = useState<PitchParameters>(DEFAULT_PARAMS)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // v4: 리플레이 및 카메라 상태
  const [isReplaying, setIsReplaying] = useState(false)
  const [replayTime, setReplayTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('free')

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

  // v3: setPreset 제거 (프리셋 제거)

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
    setIsReplaying(false)
    setReplayTime(0)
  }

  // v4: 리플레이 및 카메라 액션 추가
  const value: SimulationContextType = {
    params,
    result,
    isSimulating,
    isReplaying,
    replayTime,
    playbackSpeed,
    cameraPreset,
    setParams,
    runSimulation: runSim,
    reset,
    setIsReplaying,
    setReplayTime,
    setPlaybackSpeed,
    setCameraPreset
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
