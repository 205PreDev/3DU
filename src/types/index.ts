// 3D 벡터 타입
export interface Vector3 {
  x: number
  y: number
  z: number
}

// v2: 공 물성 파라미터
export interface BallProperties {
  mass: number              // kg
  radius: number            // m
  dragCoefficient: number   // C_d
  liftCoefficient: number   // C_L
}

// v2: 초기 투구 조건
export interface InitialConditions {
  velocity: number          // m/s
  angle: {
    horizontal: number      // degrees (수평각)
    vertical: number        // degrees (수직각)
  }
  spin: Vector3             // rpm (x, y, z 회전)
  releasePoint: Vector3     // m (릴리스 포인트: X=좌우, Y=높이, Z=앞뒤)
}

// v2: 환경 변수
export interface EnvironmentConditions {
  gravity: number           // m/s² (9.78~9.83)
  temperature: number       // °C
  pressure: number          // hPa
  humidity: number          // %
  windSpeed: Vector3        // m/s
}

// v2: 투구 파라미터 (3단 구조)
export interface PitchParameters {
  ball: BallProperties
  initial: InitialConditions
  environment: EnvironmentConditions
}

// 시뮬레이션 상태
export interface SimulationState {
  position: Vector3
  velocity: Vector3
  spin: Vector3     // 각속도 벡터 (rpm)
  time: number
}

// 궤적 포인트 (위치 + 힘 벡터)
export interface TrajectoryPoint {
  position: Vector3
  forces?: {
    gravity: Vector3
    drag: Vector3
    magnus: Vector3
  }
}

// 시뮬레이션 결과
export interface SimulationResult {
  trajectory: TrajectoryPoint[]  // 궤적 포인트 배열 (위치 + 힘 벡터)
  flightTime: number        // 비행 시간 (초)
  maxHeight: number         // 최고 높이 (m)
  finalPosition: Vector3    // 최종 위치
  finalVelocity: Vector3    // 최종 속도
  plateHeight: number       // 홈플레이트 통과 높이
  horizontalBreak: number   // 수평 변화량 (m)
  verticalDrop: number      // 수직 낙차 (m)
  isStrike: boolean         // 스트라이크 판정 (deprecated, UI에서 제거됨)
  initialSpeed: number      // 초기 속도 (m/s)
  spinRate: number          // 회전수 (rpm) - 스핀 벡터의 크기
  horizontalDistance: number // 수평 이동 거리 (m)
  reachedPlate: boolean     // 스트라이크 존에 도달했는지 여부
}

// 구종 타입
export type PitchType =
  | 'fastball'    // 직구
  | 'curveball'   // 커브
  | 'slider'      // 슬라이더
  | 'changeup'    // 체인지업
  | 'knuckleball' // 너클볼

// v2: UI 모드 제거 (단일 모드로 통합)
// export type UIMode = 'simple' | 'advanced' // REMOVED

// v2: 물리 상수 (GRAVITY 제거, 환경 변수로 이동)
export const PHYSICS_CONSTANTS = {
  AIR_DENSITY_SEA_LEVEL: 1.225,     // kg/m³ (참조값, 환경 조건으로 계산)
  BASEBALL_MASS: 0.145,             // kg (기본값)
  BASEBALL_RADIUS: 0.0366,          // m (기본값)
  BASEBALL_AREA: Math.PI * 0.0366 * 0.0366, // m²
  DRAG_COEFFICIENT: 0.4,            // 기본값
  LIFT_COEFFICIENT: 1.0,            // 기본값 (0.2 → 1.0: 마그누스 효과 증대)
  MOUND_TO_PLATE: 18.44,            // m (60.5 feet)
  // GRAVITY 제거: environment.gravity 사용
} as const

// v2: 기본 환경 조건
export const DEFAULT_ENVIRONMENT: EnvironmentConditions = {
  gravity: 9.81,          // m/s² (표준 중력)
  temperature: 20,        // °C (표준 온도)
  pressure: 1013.25,      // hPa (해수면 기압)
  humidity: 50,           // %
  windSpeed: { x: 0, y: 0, z: 0 }
}

// v2: 기본 공 물성
export const DEFAULT_BALL: BallProperties = {
  mass: PHYSICS_CONSTANTS.BASEBALL_MASS,
  radius: PHYSICS_CONSTANTS.BASEBALL_RADIUS,
  dragCoefficient: PHYSICS_CONSTANTS.DRAG_COEFFICIENT,
  liftCoefficient: PHYSICS_CONSTANTS.LIFT_COEFFICIENT
}

// 스트라이크 존 상수
export const STRIKE_ZONE = {
  WIDTH: 0.432,   // m (17 inches)
  HEIGHT: {
    TOP: 1.07,    // m (평균 상단)
    BOTTOM: 0.53  // m (평균 하단)
  }
} as const

// 스트라이크 존 9구역 타입 (좌상단부터 시계방향)
export type StrikeZone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

// 챌린지 타입
export type ChallengeType =
  | 'zone-target'      // 특정 구역 맞추기
  | 'movement-goal'    // 변화량 목표 달성
  | 'reverse-problem'  // 역문제 (목표 결과에 맞는 파라미터 찾기)

// 챌린지 목표 조건
export interface ChallengeGoal {
  type: ChallengeType
  description: string

  // 구역 타겟 (zone-target)
  targetZone?: StrikeZone

  // 변화량 목표 (movement-goal)
  horizontalBreak?: { min?: number; max?: number }  // m
  verticalDrop?: { min?: number; max?: number }     // m

  // 역문제 (reverse-problem)
  targetResult?: {
    plateHeight?: { min: number; max: number }
    finalPositionX?: { min: number; max: number }
    horizontalBreak?: { min: number; max: number }
    verticalDrop?: { min: number; max: number }
  }

  // 허용 오차
  tolerance?: number  // m (기본값: 0.05m = 5cm)
}

// 챌린지 정의
export interface Challenge {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  goal: ChallengeGoal
  hint?: string
  educationalNote?: string  // 물리 개념 설명
  reward?: {
    points: number
    badge?: string
  }
}

// 챌린지 진행 상황
export interface ChallengeProgress {
  challengeId: string
  attempts: number
  completed: boolean
  bestScore?: number
  completedAt?: Date
}

// 챌린지 결과 판정
export interface ChallengeResult {
  success: boolean
  score: number  // 0-100
  feedback: string
  details?: {
    targetZoneHit?: boolean
    actualZone?: StrikeZone | null
    movementAchieved?: {
      horizontalBreak: number
      verticalDrop: number
    }
    accuracy?: number  // 0-1
  }
}
