import { PitchParameters, PitchType, PHYSICS_CONSTANTS, DEFAULT_ENVIRONMENT, DEFAULT_BALL } from '@/types'

/**
 * v2: 프리셋 투구 파라미터 (3단 구조)
 * 실제 프로 투수들의 데이터를 기반으로 구성
 */
export const PITCH_PRESETS: Record<PitchType, PitchParameters> = {
  fastball: {
    ball: DEFAULT_BALL,
    initial: {
      velocity: 40.2,  // 40.2 m/s ≈ 145 km/h
      angle: {
        horizontal: 0,    // 정면
        vertical: -3      // 약간 하향
      },
      spin: { x: 0, y: 2400, z: 0 },  // 순수 백스핀 (rpm)
      releasePoint: { x: 0, y: 2.0, z: 0 }
    },
    environment: DEFAULT_ENVIRONMENT
  },

  curveball: {
    ball: {
      ...DEFAULT_BALL,
      liftCoefficient: PHYSICS_CONSTANTS.LIFT_COEFFICIENT * 1.2  // 커브는 양력 계수가 더 큼
    },
    initial: {
      velocity: 30.5,  // 30.5 m/s ≈ 110 km/h
      angle: { horizontal: 0, vertical: 0 },
      spin: { x: 1064, y: -2492, z: 700 },  // 탑스핀 + 측면 (정규화 전 2800rpm)
      releasePoint: { x: 0, y: 2.0, z: 0 }
    },
    environment: DEFAULT_ENVIRONMENT
  },

  slider: {
    ball: DEFAULT_BALL,
    initial: {
      velocity: 36.1,  // 36.1 m/s ≈ 130 km/h
      angle: { horizontal: 0, vertical: -2 },
      spin: { x: 2522, y: 624, z: 0 },  // 주로 횡 회전 (정규화 전 2600rpm)
      releasePoint: { x: 0, y: 2.0, z: 0 }
    },
    environment: DEFAULT_ENVIRONMENT
  },

  changeup: {
    ball: {
      ...DEFAULT_BALL,
      dragCoefficient: PHYSICS_CONSTANTS.DRAG_COEFFICIENT * 1.1,
      liftCoefficient: PHYSICS_CONSTANTS.LIFT_COEFFICIENT * 0.8
    },
    initial: {
      velocity: 34.7,  // 34.7 m/s ≈ 125 km/h
      angle: { horizontal: 0, vertical: -1 },
      spin: { x: 0, y: 1485, z: 165 },  // 약한 백스핀 (정규화 전 1500rpm)
      releasePoint: { x: 0, y: 2.0, z: 0 }
    },
    environment: DEFAULT_ENVIRONMENT
  },

  knuckleball: {
    ball: {
      ...DEFAULT_BALL,
      dragCoefficient: PHYSICS_CONSTANTS.DRAG_COEFFICIENT * 1.3,
      liftCoefficient: 0.05
    },
    initial: {
      velocity: 27.8,  // 27.8 m/s ≈ 100 km/h
      angle: { horizontal: 0, vertical: 0 },
      spin: { x: 0, y: 50, z: 0 },  // 거의 회전 없음
      releasePoint: { x: 0, y: 2.0, z: 0 }
    },
    environment: DEFAULT_ENVIRONMENT
  }
}

/**
 * 구종별 설명
 */
export const PITCH_DESCRIPTIONS: Record<PitchType, string> = {
  fastball: '가장 빠른 직구입니다. 백스핀으로 인해 공이 덜 떨어집니다.',
  curveball: '큰 낙차를 가진 변화구입니다. 탑스핀으로 급격히 떨어집니다.',
  slider: '횡적 변화가 큰 변화구입니다. 타자의 바깥쪽으로 휘어집니다.',
  changeup: '직구와 비슷한 폼이지만 느린 공입니다. 타이밍을 교란합니다.',
  knuckleball: '거의 회전하지 않아 불규칙하게 움직입니다.'
}

/**
 * 구종별 한글 이름
 */
export const PITCH_NAMES: Record<PitchType, string> = {
  fastball: '직구',
  curveball: '커브',
  slider: '슬라이더',
  changeup: '체인지업',
  knuckleball: '너클볼'
}
