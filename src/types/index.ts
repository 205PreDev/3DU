// 3D 벡터 타입
export interface Vector3 {
  x: number
  y: number
  z: number
}

// 투구 파라미터
export interface PitchParameters {
  // 공 속성
  mass: number              // kg (야구공: 0.145)
  radius: number            // m (야구공: 0.0366)

  // 초기 조건
  initialSpeed: number      // m/s
  releaseAngle: number      // degrees
  releaseHeight: number     // m
  releasePosition: Vector3  // m

  // 회전
  spinRate: number          // rpm
  spinAxis: Vector3         // 정규화된 벡터

  // 환경
  airDensity: number        // kg/m³
  gravity: number           // m/s² (기본: 9.81)

  // 계수
  dragCoefficient: number   // 항력 계수 (기본: 0.4)
  liftCoefficient: number   // 양력 계수 (기본: 0.2)
}

// 시뮬레이션 상태
export interface SimulationState {
  position: Vector3
  velocity: Vector3
  spin: Vector3     // 각속도 벡터 (rpm)
  time: number
}

// 시뮬레이션 결과
export interface SimulationResult {
  trajectory: Vector3[]     // 궤적 포인트 배열
  flightTime: number        // 비행 시간 (초)
  maxHeight: number         // 최고 높이 (m)
  finalPosition: Vector3    // 최종 위치
  finalVelocity: Vector3    // 최종 속도
  plateHeight: number       // 홈플레이트 통과 높이
  horizontalBreak: number   // 수평 변화량 (m)
  verticalDrop: number      // 수직 낙차 (m)
  isStrike: boolean         // 스트라이크 판정
}

// 구종 타입
export type PitchType =
  | 'fastball'    // 직구
  | 'curveball'   // 커브
  | 'slider'      // 슬라이더
  | 'changeup'    // 체인지업
  | 'knuckleball' // 너클볼

// UI 모드
export type UIMode = 'simple' | 'advanced'

// 단순 모드 입력
export interface SimpleModeInputs {
  throwPower: number      // 던지는 세기 (1-10)
  pitchType: PitchType    // 구종 선택
  targetZone: string      // 목표 위치
}

// 물리 상수
export const PHYSICS_CONSTANTS = {
  GRAVITY: 9.81,                    // m/s²
  AIR_DENSITY_SEA_LEVEL: 1.225,     // kg/m³
  BASEBALL_MASS: 0.145,             // kg
  BASEBALL_RADIUS: 0.0366,          // m
  BASEBALL_AREA: Math.PI * 0.0366 * 0.0366, // m²
  DRAG_COEFFICIENT: 0.4,
  LIFT_COEFFICIENT: 0.2,
  MOUND_TO_PLATE: 18.44,            // m (60.5 feet)
} as const
