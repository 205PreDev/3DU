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
   * v2: 미분 함수: 위치와 속도의 변화율 계산
   */
  private derivative: DerivativeFunction = (
    _position: Vector3,
    velocity: Vector3,
    _time: number
  ) => {
    // v2: spin은 이미 Vector3 형태
    const force = calculateTotalForce(velocity, this.params.initial.spin, this.params)
    const acceleration = calculateAcceleration(force, this.params.ball.mass)

    return {
      velocityDerivative: velocity,  // dx/dt = v
      accelerationDerivative: acceleration  // dv/dt = a = F/m
    }
  }

  /**
   * v2: 시뮬레이션 실행
   */
  simulate(): SimulationResult {
    // v2: 초기 상태 설정
    const horizontalAngleRad = (this.params.initial.angle.horizontal * Math.PI) / 180
    const verticalAngleRad = (this.params.initial.angle.vertical * Math.PI) / 180

    // 릴리스 포인트에서 홈플레이트 중심으로 향하는 자연스러운 궤적 계산
    // 홈플레이트는 (0, 1.0, -18.44) 위치 (대략적인 스트라이크 존 중심)
    const targetX = 0
    const targetZ = -PHYSICS_CONSTANTS.MOUND_TO_PLATE
    const releaseX = this.params.initial.releasePoint.x
    const releaseZ = this.params.initial.releasePoint.z

    // 릴리스 포인트에서 홈플레이트까지의 수평 변위
    const deltaX = targetX - releaseX
    const deltaZ = targetZ - releaseZ

    // 자연스러운 투구 각도 (릴리스 포인트 → 홈플레이트 중심)
    const naturalHorizontalAngle = Math.atan2(deltaX, -deltaZ)

    // 사용자 입력 각도를 자연 각도에 더함 (미세 조정 가능)
    const adjustedHorizontalAngleRad = naturalHorizontalAngle + horizontalAngleRad

    const initialVelocity: Vector3 = {
      x: this.params.initial.velocity * Math.sin(adjustedHorizontalAngleRad) * Math.cos(verticalAngleRad),
      y: this.params.initial.velocity * Math.sin(verticalAngleRad),
      z: -this.params.initial.velocity * Math.cos(adjustedHorizontalAngleRad) * Math.cos(verticalAngleRad)
    }

    let state: SimulationState = {
      position: vec3.clone(this.params.initial.releasePoint),
      velocity: initialVelocity,
      spin: vec3.clone(this.params.initial.spin),  // v2: spin Vector3 그대로 저장
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

    // v2: 결과 계산
    const horizontalBreak = plateX - this.params.initial.releasePoint.x
    const verticalDrop = this.params.initial.releasePoint.y - plateHeight
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
   * 스트라이크 판정 (v3: 공이 스트라이크 존에 접촉하면 스트라이크)
   * 스트라이크 존: x: ±0.22m, y: 0.5m ~ 1.1m (대략적인 값)
   * 공 반지름을 고려하여 접촉 판정
   */
  private checkStrike(x: number, y: number): boolean {
    const STRIKE_ZONE_WIDTH = 0.44  // m (약 43cm)
    const STRIKE_ZONE_TOP = 1.1     // m
    const STRIKE_ZONE_BOTTOM = 0.5  // m
    const ballRadius = this.params.ball.radius

    // 공이 스트라이크 존과 접촉하는지 확인 (공 반지름 만큼 확장)
    return (
      Math.abs(x) <= STRIKE_ZONE_WIDTH / 2 + ballRadius &&
      y >= STRIKE_ZONE_BOTTOM - ballRadius &&
      y <= STRIKE_ZONE_TOP + ballRadius
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
