import { Vector3, PitchParameters, SimulationState, SimulationResult, PHYSICS_CONSTANTS } from '@/types'
import { vec3, eulerIntegrate, rk4Integrate, DerivativeFunction } from './integrator'
import { calculateTotalForce, calculateAcceleration } from './forces'

/**
 * 투구 시뮬레이터
 * 초기 조건에 따라 공의 궤적을 계산
 */
export class PitchSimulator {
  private params: PitchParameters
  private dt: number  // 시간 스텝 (초)
  private maxTime: number  // 최대 시뮬레이션 시간 (초)
  private useRK4: boolean  // RK4 사용 여부

  constructor(
    params: PitchParameters,
    dt = 0.01,  // 10ms
    maxTime = 5.0,  // 5초
    useRK4 = false
  ) {
    this.params = params
    this.dt = dt
    this.maxTime = maxTime
    this.useRK4 = useRK4
  }

  /**
   * 미분 함수: 위치와 속도의 변화율 계산
   */
  private derivative: DerivativeFunction = (
    position: Vector3,
    velocity: Vector3,
    _time: number
  ) => {
    // 현재 상태에서의 힘 계산
    // spinAxis는 정규화된 방향 벡터를 전달
    const normalizedSpinAxis = vec3.normalize(this.params.spinAxis)
    const force = calculateTotalForce(velocity, normalizedSpinAxis, this.params)
    const acceleration = calculateAcceleration(force, this.params.mass)

    return {
      velocityDerivative: velocity,  // dx/dt = v
      accelerationDerivative: acceleration  // dv/dt = a = F/m
    }
  }

  /**
   * 시뮬레이션 실행
   */
  simulate(): SimulationResult {
    // 초기 상태 설정
    const initialAngleRad = (this.params.releaseAngle * Math.PI) / 180
    const initialVelocity: Vector3 = {
      x: 0,  // 수평 방향 (좌우)
      y: this.params.initialSpeed * Math.sin(initialAngleRad),
      z: -this.params.initialSpeed * Math.cos(initialAngleRad)  // 앞으로 (음수)
    }

    let state: SimulationState = {
      position: vec3.clone(this.params.releasePosition),
      velocity: initialVelocity,
      spin: vec3.normalize(this.params.spinAxis),  // 정규화된 회전축 방향만 저장
      time: 0
    }

    const trajectory: Vector3[] = [vec3.clone(state.position)]
    let maxHeight = state.position.y
    let plateHeight = state.position.y
    let plateX = 0  // 홈플레이트 통과 시 x 좌표 추가
    let reachedPlate = false

    // 시뮬레이션 루프
    while (state.time < this.maxTime && state.position.y > 0) {
      // 수치 적분
      const integrated = this.useRK4
        ? rk4Integrate(state.position, state.velocity, state.time, this.dt, this.derivative)
        : eulerIntegrate(state.position, state.velocity, state.time, this.dt, this.derivative)

      state.position = integrated.position
      state.velocity = integrated.velocity
      state.time += this.dt

      // 궤적 기록
      trajectory.push(vec3.clone(state.position))

      // 최고 높이 갱신
      if (state.position.y > maxHeight) {
        maxHeight = state.position.y
      }

      // 홈플레이트 도달 체크 (z 좌표가 -18.44m 이하)
      if (!reachedPlate && state.position.z <= -PHYSICS_CONSTANTS.MOUND_TO_PLATE) {
        plateHeight = state.position.y
        plateX = state.position.x  // 플레이트 통과 시의 x 좌표 기록
        reachedPlate = true
      }

      // 지면 도달 시 종료
      if (state.position.y < 0) {
        break
      }
    }

    // 결과 계산
    const horizontalBreak = plateX - this.params.releasePosition.x
    const verticalDrop = this.params.releasePosition.y - plateHeight
    const isStrike = this.checkStrike(plateX, plateHeight)  // 플레이트 통과 시의 위치로 판정

    return {
      trajectory,
      flightTime: state.time,
      maxHeight,
      finalPosition: state.position,
      finalVelocity: state.velocity,
      plateHeight,
      horizontalBreak,
      verticalDrop,
      isStrike
    }
  }

  /**
   * 스트라이크 판정
   * 스트라이크 존: x: ±0.22m, y: 0.5m ~ 1.1m (대략적인 값)
   */
  private checkStrike(x: number, y: number): boolean {
    const STRIKE_ZONE_WIDTH = 0.44  // m (약 43cm)
    const STRIKE_ZONE_TOP = 1.1     // m
    const STRIKE_ZONE_BOTTOM = 0.5  // m

    return (
      Math.abs(x) <= STRIKE_ZONE_WIDTH / 2 &&
      y >= STRIKE_ZONE_BOTTOM &&
      y <= STRIKE_ZONE_TOP
    )
  }
}

/**
 * 간편한 시뮬레이션 실행 함수
 */
export function runSimulation(
  params: PitchParameters,
  options?: {
    dt?: number
    maxTime?: number
    useRK4?: boolean
  }
): SimulationResult {
  const simulator = new PitchSimulator(
    params,
    options?.dt,
    options?.maxTime,
    options?.useRK4
  )
  return simulator.simulate()
}
