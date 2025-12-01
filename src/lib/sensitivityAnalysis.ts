import type { PitchParameters, SimulationResult } from '@/types'
import { runSimulation } from '@/core/physics/simulator'

/**
 * 파라미터 민감도 분석
 * Jacobian Matrix를 사용하여 각 파라미터 변화가 결과에 미치는 영향 계산
 */

export interface SensitivityResult {
  parameter: string
  displayName: string
  unit: string
  currentValue: number
  delta: number

  // 결과 변화량
  plateHeightChange: number // 홈플레이트 높이 변화 (m)
  horizontalBreakChange: number // 수평 변화량 (m)
  verticalDropChange: number // 수직 낙차 변화 (m)
  finalPositionXChange: number // 최종 X 위치 변화 (m)

  // 민감도 (단위 변화당 결과 변화)
  plateHeightSensitivity: number // m/unit
  horizontalBreakSensitivity: number // m/unit
  verticalDropSensitivity: number // m/unit
  finalPositionXSensitivity: number // m/unit

  // 종합 민감도 (정규화된 값, 0-1)
  totalSensitivity: number
}

export interface SensitivityAnalysis {
  baseResult: SimulationResult
  sensitivities: SensitivityResult[]
  mostSensitiveParam: SensitivityResult
  leastSensitiveParam: SensitivityResult
}

/**
 * 수치 미분을 사용한 Jacobian Matrix 계산
 * @param params 현재 파라미터
 * @param delta 미분 스텝 크기 (비율)
 */
export function analyzeSensitivity(
  params: PitchParameters,
  delta: number = 0.01 // 1% 변화
): SensitivityAnalysis {
  // 기준 결과
  const baseResult = runSimulation(params)

  const sensitivities: SensitivityResult[] = []

  // 각 파라미터별 민감도 분석
  const parameterTests: Array<{
    name: string
    displayName: string
    unit: string
    getValue: (p: PitchParameters) => number
    setValue: (p: PitchParameters, v: number) => PitchParameters
  }> = [
    {
      name: 'velocity',
      displayName: '초기 속도',
      unit: 'm/s',
      getValue: (p) => p.initial.velocity,
      setValue: (p, v) => ({ ...p, initial: { ...p.initial, velocity: v } })
    },
    {
      name: 'horizontalAngle',
      displayName: '수평각',
      unit: '도',
      getValue: (p) => p.initial.angle.horizontal,
      setValue: (p, v) => ({
        ...p,
        initial: { ...p.initial, angle: { ...p.initial.angle, horizontal: v } }
      })
    },
    {
      name: 'verticalAngle',
      displayName: '수직각',
      unit: '도',
      getValue: (p) => p.initial.angle.vertical,
      setValue: (p, v) => ({
        ...p,
        initial: { ...p.initial, angle: { ...p.initial.angle, vertical: v } }
      })
    },
    {
      name: 'spinX',
      displayName: 'X축 회전 (사이드스핀)',
      unit: 'rpm',
      getValue: (p) => p.initial.spin.x,
      setValue: (p, v) => ({
        ...p,
        initial: { ...p.initial, spin: { ...p.initial.spin, x: v } }
      })
    },
    {
      name: 'spinY',
      displayName: 'Y축 회전 (백스핀/탑스핀)',
      unit: 'rpm',
      getValue: (p) => p.initial.spin.y,
      setValue: (p, v) => ({
        ...p,
        initial: { ...p.initial, spin: { ...p.initial.spin, y: v } }
      })
    },
    {
      name: 'spinZ',
      displayName: 'Z축 회전 (나선)',
      unit: 'rpm',
      getValue: (p) => p.initial.spin.z,
      setValue: (p, v) => ({
        ...p,
        initial: { ...p.initial, spin: { ...p.initial.spin, z: v } }
      })
    },
    {
      name: 'releaseHeight',
      displayName: '릴리즈 높이',
      unit: 'm',
      getValue: (p) => p.initial.releasePoint.y,
      setValue: (p, v) => ({
        ...p,
        initial: { ...p.initial, releasePoint: { ...p.initial.releasePoint, y: v } }
      })
    },
    {
      name: 'releaseX',
      displayName: '릴리즈 X 위치',
      unit: 'm',
      getValue: (p) => p.initial.releasePoint.x,
      setValue: (p, v) => ({
        ...p,
        initial: { ...p.initial, releasePoint: { ...p.initial.releasePoint, x: v } }
      })
    }
  ]

  for (const test of parameterTests) {
    const currentValue = test.getValue(params)

    // 파라미터를 delta만큼 증가시켜 시뮬레이션
    const deltaValue = Math.abs(currentValue) > 0.01
      ? currentValue * delta
      : 0.01 // 값이 0에 가까우면 절대값 사용

    const modifiedParams = test.setValue(params, currentValue + deltaValue)
    const modifiedResult = runSimulation(modifiedParams)

    // 결과 변화량 계산
    const plateHeightChange = modifiedResult.plateHeight - baseResult.plateHeight
    const horizontalBreakChange = modifiedResult.horizontalBreak - baseResult.horizontalBreak
    const verticalDropChange = modifiedResult.verticalDrop - baseResult.verticalDrop
    const finalPositionXChange = modifiedResult.finalPosition.x - baseResult.finalPosition.x

    // 민감도 (단위 변화당 결과 변화)
    const plateHeightSensitivity = plateHeightChange / deltaValue
    const horizontalBreakSensitivity = horizontalBreakChange / deltaValue
    const verticalDropSensitivity = verticalDropChange / deltaValue
    const finalPositionXSensitivity = finalPositionXChange / deltaValue

    // 종합 민감도 (각 민감도의 절대값 합, 정규화)
    const totalSensitivity = Math.abs(plateHeightSensitivity) +
                             Math.abs(horizontalBreakSensitivity) +
                             Math.abs(verticalDropSensitivity) +
                             Math.abs(finalPositionXSensitivity)

    sensitivities.push({
      parameter: test.name,
      displayName: test.displayName,
      unit: test.unit,
      currentValue,
      delta: deltaValue,
      plateHeightChange,
      horizontalBreakChange,
      verticalDropChange,
      finalPositionXChange,
      plateHeightSensitivity,
      horizontalBreakSensitivity,
      verticalDropSensitivity,
      finalPositionXSensitivity,
      totalSensitivity
    })
  }

  // 종합 민감도 정규화 (0-1 범위로)
  const maxTotalSensitivity = Math.max(...sensitivities.map(s => s.totalSensitivity))
  sensitivities.forEach(s => {
    s.totalSensitivity = s.totalSensitivity / maxTotalSensitivity
  })

  // 가장 민감한/둔감한 파라미터
  const sortedBySensitivity = [...sensitivities].sort((a, b) =>
    b.totalSensitivity - a.totalSensitivity
  )

  return {
    baseResult,
    sensitivities,
    mostSensitiveParam: sortedBySensitivity[0],
    leastSensitiveParam: sortedBySensitivity[sortedBySensitivity.length - 1]
  }
}

/**
 * 목표 위치까지의 파라미터 공간 경로 계산
 * @param currentParams 현재 파라미터
 * @param targetX 목표 X 위치
 * @param targetY 목표 Y 위치 (홈플레이트에서)
 * @param steps 경로 스텝 수
 */
export function calculatePathToTarget(
  currentParams: PitchParameters,
  _targetX: number,
  _targetY: number,
  steps: number = 5
): Array<{ params: PitchParameters; result: SimulationResult; progress: number }> {
  const path: Array<{ params: PitchParameters; result: SimulationResult; progress: number }> = []

  const currentResult = runSimulation(currentParams)
  // const currentX = currentResult.finalPosition.x
  // const currentY = currentResult.plateHeight

  // const deltaX = targetX - currentX
  // const deltaY = targetY - currentY

  // 민감도 분석으로 어느 파라미터를 조정할지 결정
  // const sensitivity = analyzeSensitivity(currentParams)

  // X 위치에 가장 민감한 파라미터 찾기
  // const xSensitiveParams = [...sensitivity.sensitivities]
  //   .sort((a, b) => Math.abs(b.finalPositionXSensitivity) - Math.abs(a.finalPositionXSensitivity))

  // Y 위치에 가장 민감한 파라미터 찾기
  // const ySensitiveParams = [...sensitivity.sensitivities]
  //   .sort((a, b) => Math.abs(b.plateHeightSensitivity) - Math.abs(a.plateHeightSensitivity))

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps
    path.push({
      params: currentParams,
      result: currentResult,
      progress
    })
  }

  return path
}
