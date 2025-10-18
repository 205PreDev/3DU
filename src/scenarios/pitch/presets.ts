import { PitchParameters, PitchType, PHYSICS_CONSTANTS } from '@/types'

/**
 * 프리셋 투구 파라미터
 * 실제 프로 투수들의 데이터를 기반으로 구성
 */
export const PITCH_PRESETS: Record<PitchType, PitchParameters> = {
  fastball: {
    // 프로 직구 (약 145 km/h)
    mass: PHYSICS_CONSTANTS.BASEBALL_MASS,
    radius: PHYSICS_CONSTANTS.BASEBALL_RADIUS,
    initialSpeed: 40.2,  // 40.2 m/s ≈ 145 km/h
    releaseAngle: -3,    // 약간 하향
    releaseHeight: 2.0,
    releasePosition: { x: 0, y: 2.0, z: 0 },
    spinRate: 2400,      // 백스핀
    spinAxis: { x: 0, y: 1, z: 0 },  // 순수 백스핀 (위쪽)
    airDensity: PHYSICS_CONSTANTS.AIR_DENSITY_SEA_LEVEL,
    gravity: PHYSICS_CONSTANTS.GRAVITY,
    dragCoefficient: PHYSICS_CONSTANTS.DRAG_COEFFICIENT,
    liftCoefficient: PHYSICS_CONSTANTS.LIFT_COEFFICIENT
  },

  curveball: {
    // 커브볼 (약 110 km/h, 큰 낙차)
    mass: PHYSICS_CONSTANTS.BASEBALL_MASS,
    radius: PHYSICS_CONSTANTS.BASEBALL_RADIUS,
    initialSpeed: 30.5,  // 30.5 m/s ≈ 110 km/h
    releaseAngle: 0,
    releaseHeight: 2.0,
    releasePosition: { x: 0, y: 2.0, z: 0 },
    spinRate: 2800,      // 강한 회전
    spinAxis: { x: 0.3, y: -0.7, z: 0.2 },  // 탑스핀 + 측면
    airDensity: PHYSICS_CONSTANTS.AIR_DENSITY_SEA_LEVEL,
    gravity: PHYSICS_CONSTANTS.GRAVITY,
    dragCoefficient: PHYSICS_CONSTANTS.DRAG_COEFFICIENT,
    liftCoefficient: PHYSICS_CONSTANTS.LIFT_COEFFICIENT * 1.2  // 커브는 양력 계수가 더 큼
  },

  slider: {
    // 슬라이더 (약 130 km/h, 횡적 변화)
    mass: PHYSICS_CONSTANTS.BASEBALL_MASS,
    radius: PHYSICS_CONSTANTS.BASEBALL_RADIUS,
    initialSpeed: 36.1,  // 36.1 m/s ≈ 130 km/h
    releaseAngle: -2,
    releaseHeight: 2.0,
    releasePosition: { x: 0, y: 2.0, z: 0 },
    spinRate: 2600,
    spinAxis: { x: 0.8, y: 0.2, z: -0.1 },  // 주로 횡 회전
    airDensity: PHYSICS_CONSTANTS.AIR_DENSITY_SEA_LEVEL,
    gravity: PHYSICS_CONSTANTS.GRAVITY,
    dragCoefficient: PHYSICS_CONSTANTS.DRAG_COEFFICIENT,
    liftCoefficient: PHYSICS_CONSTANTS.LIFT_COEFFICIENT
  },

  changeup: {
    // 체인지업 (약 125 km/h, 적은 회전)
    mass: PHYSICS_CONSTANTS.BASEBALL_MASS,
    radius: PHYSICS_CONSTANTS.BASEBALL_RADIUS,
    initialSpeed: 34.7,  // 34.7 m/s ≈ 125 km/h
    releaseAngle: -1,
    releaseHeight: 2.0,
    releasePosition: { x: 0, y: 2.0, z: 0 },
    spinRate: 1500,      // 낮은 회전수
    spinAxis: { x: 0, y: 0.9, z: 0.1 },  // 약한 백스핀
    airDensity: PHYSICS_CONSTANTS.AIR_DENSITY_SEA_LEVEL,
    gravity: PHYSICS_CONSTANTS.GRAVITY,
    dragCoefficient: PHYSICS_CONSTANTS.DRAG_COEFFICIENT * 1.1,  // 항력이 더 큼
    liftCoefficient: PHYSICS_CONSTANTS.LIFT_COEFFICIENT * 0.8
  },

  knuckleball: {
    // 너클볼 (약 100 km/h, 거의 무회전)
    mass: PHYSICS_CONSTANTS.BASEBALL_MASS,
    radius: PHYSICS_CONSTANTS.BASEBALL_RADIUS,
    initialSpeed: 27.8,  // 27.8 m/s ≈ 100 km/h
    releaseAngle: 0,
    releaseHeight: 2.0,
    releasePosition: { x: 0, y: 2.0, z: 0 },
    spinRate: 50,        // 거의 회전 없음
    spinAxis: { x: 0, y: 1, z: 0 },
    airDensity: PHYSICS_CONSTANTS.AIR_DENSITY_SEA_LEVEL,
    gravity: PHYSICS_CONSTANTS.GRAVITY,
    dragCoefficient: PHYSICS_CONSTANTS.DRAG_COEFFICIENT * 1.3,  // 높은 항력
    liftCoefficient: 0.05  // 마그누스 효과 거의 없음
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
