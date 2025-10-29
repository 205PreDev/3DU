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
// v5: 성능 측정 추가
export interface PerformanceMetrics {
  physicsTime: number          // 물리 계산 시간 (ms)
  renderTime: number           // 렌더링 시간 (ms)
  totalFrameTime: number       // 총 프레임 시간 (ms)
  fps: number                  // FPS
  frameCount: number           // 프레임 카운트
  avgPhysicsTime: number       // 평균 물리 계산 시간 (ms)
  maxPhysicsTime: number       // 최대 물리 계산 시간 (ms)
  simulationTime: number       // 총 시뮬레이션 시간 (s)
  trajectoryPoints: number     // 궤적 포인트 수
  memoryUsage?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

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

  // 성능 측정
  performanceMetrics: PerformanceMetrics | null

  // 액션
  setParams: (params: Partial<PitchParameters>) => void
  runSimulation: (trajectoryDt?: number) => void  // 그래픽 설정에서 dt 받기
  reset: () => void

  // 리플레이 액션
  setIsReplaying: (playing: boolean | ((prev: boolean) => boolean)) => void
  setReplayTime: (time: number | ((prev: number) => number)) => void
  setPlaybackSpeed: (speed: number | ((prev: number) => number)) => void

  // 카메라 액션
  setCameraPreset: (preset: CameraPreset) => void

  // 성능 측정 액션
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void
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

  // v5: 성능 측정 상태
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)

  // v2: 깊은 병합을 위한 setParams
  const setParams = (newParams: Partial<PitchParameters>): void => {
    setParamsState(prev => ({
      ...prev,
      ...newParams,
      ball: newParams.ball ? { ...prev.ball, ...newParams.ball } : prev.ball,
      initial: newParams.initial ? {
        ...prev.initial,
        ...newParams.initial,
        // spin, releasePoint, angle은 부분 병합 지원
        spin: newParams.initial.spin ? { ...prev.initial.spin, ...newParams.initial.spin } : prev.initial.spin,
        releasePoint: newParams.initial.releasePoint ? { ...prev.initial.releasePoint, ...newParams.initial.releasePoint } : prev.initial.releasePoint,
        angle: newParams.initial.angle ? { ...prev.initial.angle, ...newParams.initial.angle } : prev.initial.angle
      } : prev.initial,
      environment: newParams.environment ? { ...prev.environment, ...newParams.environment } : prev.environment
    }))
  }

  // v3: setPreset 제거 (프리셋 제거)

  const runSim = (trajectoryDt: number = 0.01): void => {
    setIsSimulating(true)
    const startTime = performance.now()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚾ 시뮬레이션 시작')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    try {
      const simResult = runSimulation(params, { dt: trajectoryDt, maxTime: 5.0 })
      const endTime = performance.now()
      const physicsTime = endTime - startTime

      setResult(simResult)

      // 초기 성능 지표 설정 (물리 계산 시간만)
      const metrics = {
        physicsTime,
        renderTime: 0,
        totalFrameTime: physicsTime,
        fps: 0,
        frameCount: 0,
        avgPhysicsTime: physicsTime,
        maxPhysicsTime: physicsTime,
        simulationTime: simResult.flightTime,
        trajectoryPoints: simResult.trajectory.length,
        memoryUsage: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : undefined
      }

      setPerformanceMetrics(metrics)

      // 콘솔 출력
      console.log('📊 성능 지표')
      console.log(`  ⏱️  물리 계산: ${physicsTime.toFixed(2)} ms`)
      console.log(`  📈 궤적 포인트: ${simResult.trajectory.length}개`)
      console.log(`  ⏰ 비행시간: ${simResult.flightTime.toFixed(3)}s`)
      console.log('')
      console.log('🎯 결과')
      console.log(`  ${simResult.isStrike ? '✅ 스트라이크' : '❌ 볼'}`)
      console.log(`  📏 수평 변화: ${(simResult.horizontalBreak * 100).toFixed(1)} cm`)
      console.log(`  📐 수직 낙차: ${(simResult.verticalDrop * 100).toFixed(1)} cm`)
      const finalSpeed = Math.sqrt(
        simResult.finalVelocity.x ** 2 +
        simResult.finalVelocity.y ** 2 +
        simResult.finalVelocity.z ** 2
      )
      console.log(`  🚀 최종 속도: ${finalSpeed.toFixed(1)} m/s`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    } catch (error) {
      console.error('❌ 시뮬레이션 오류:', error)
    } finally {
      setIsSimulating(false)
    }
  }

  const updatePerformanceMetrics = (metrics: Partial<PerformanceMetrics>): void => {
    setPerformanceMetrics(prev => prev ? { ...prev, ...metrics } : null)
  }

  const reset = (): void => {
    setParamsState(DEFAULT_PARAMS)
    setResult(null)
    setIsReplaying(false)
    setReplayTime(0)
  }

  // v4: 리플레이 및 카메라 액션 추가
  // v5: 성능 측정 추가
  const value: SimulationContextType = {
    params,
    result,
    isSimulating,
    isReplaying,
    replayTime,
    playbackSpeed,
    cameraPreset,
    performanceMetrics,
    setParams,
    runSimulation: runSim,
    reset,
    setIsReplaying,
    setReplayTime,
    setPlaybackSpeed,
    setCameraPreset,
    updatePerformanceMetrics
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
