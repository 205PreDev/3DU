# 교육용 3D 물리 시뮬레이터 구현 계획

**문서 버전:** 1.0
**작성일:** 2025-10-16
**프로젝트 코드명:** 3DU

---

## 1. 프로젝트 개요

### 1.1 목적
기존 "3D 스토리 시뮬레이터"의 AI 기반 자유로운 씬 생성 방식에서, 물리 법칙 기반의 정밀한 교육용 시뮬레이터로 전환한다.

### 1.2 핵심 차이점

| 구분 | 3DS (기존) | 3DU (신규) |
|------|-----------|-----------|
| **목적** | 창작 도구 (스토리텔링) | 교육 도구 (물리 학습) |
| **AI 역할** | 씬 생성의 핵심 | 사용하지 않음 (선택적) |
| **물리 엔진** | 시각적 효과용 | 정밀 계산의 핵심 |
| **사용자 입력** | 자연어 텍스트 | 수치 파라미터 |
| **확장성** | 자유로운 씬 구성 | 정의된 시나리오 모듈 |
| **백엔드** | BFF 서버 필요 (AI API) | 클라이언트 전용 |

### 1.3 초기 개발 범위
**투구 시뮬레이터 모듈 1개 구현**
- 순방향 시뮬레이션: 입력 → 궤적 계산 → 3D 시각화
- 단순/전문가 모드 UI
- 프리셋 기능
- 결과 데이터 표시

---

## 2. 기술 스택

### 2.1 채택 기술

```yaml
프론트엔드:
  - React 18 + TypeScript
  - Vite (빌드 도구)

3D 렌더링:
  - Three.js
  - @react-three/fiber
  - @react-three/drei (카메라 컨트롤, 헬퍼)

물리 계산:
  - 자체 구현 (Euler/RK4 적분)
  - 물리 법칙: 중력, 항력, 마그누스 효과

상태 관리:
  - Zustand (경량, 단순)

스타일링:
  - Styled Components 또는 CSS Modules

버전 관리:
  - Git + GitHub
```

### 2.2 기존 3DS 프로젝트와의 기술적 차이

**제거:**
- OpenAI API 연동 (aiService.ts)
- BFF 서버 (server/ 디렉토리 전체)
- Express, axios, OpenAI SDK
- AuthContext (인증 불필요)

**추가:**
- 물리 계산 엔진 모듈
- 시나리오 모듈 구조
- 파라미터 입력 UI 컴포넌트

**유지:**
- Three.js 기반 3D 렌더링 구조
- SceneContext 패턴 (물리 상태 관리로 용도 변경)
- 카메라 컨트롤러

---

## 3. 시스템 아키텍처

### 3.1 프로젝트 구조

```
3DU/
├── src/
│   ├── core/                      # 코어 플랫폼
│   │   ├── physics/               # 물리 계산 엔진
│   │   │   ├── integrator.ts     # Euler/RK4 적분기
│   │   │   ├── forces.ts         # 힘 계산 (중력, 항력, 마그누스)
│   │   │   └── simulator.ts      # 시뮬레이션 루프
│   │   ├── renderer/              # 3D 렌더링
│   │   │   ├── Scene3D.tsx       # 메인 3D 씬
│   │   │   ├── Camera.tsx        # 카메라 컨트롤
│   │   │   └── Grid.tsx          # 그리드 헬퍼
│   │   └── ui/                    # 공통 UI 컴포넌트
│   │       ├── ModeToggle.tsx    # 단순/전문가 모드 토글
│   │       ├── TooltipModal.tsx  # 용어 설명 모달
│   │       └── ResultPanel.tsx   # 결과 표시 패널
│   │
│   ├── scenarios/                 # 시나리오 모듈
│   │   └── pitch/                 # 투구 시뮬레이터
│   │       ├── PitchSimulator.tsx     # 메인 컴포넌트
│   │       ├── PitchInputPanel.tsx    # 입력 UI
│   │       ├── PitchPresets.ts        # 프리셋 데이터
│   │       ├── PitchPhysics.ts        # 투구 물리 로직
│   │       ├── Ball3D.tsx             # 공 3D 모델
│   │       ├── TrajectoryLine.tsx     # 궤적 라인
│   │       └── types.ts               # 타입 정의
│   │
│   ├── contexts/                  # React Context
│   │   └── SimulationContext.tsx # 시뮬레이션 상태 관리
│   │
│   ├── types/                     # 공통 타입
│   │   └── index.ts
│   │
│   ├── App.tsx                    # 메인 앱
│   └── main.tsx                   # 진입점
│
├── public/
│   └── models/
│       ├── baseball.glb           # 야구공 모델
│       ├── pitcher.glb            # 투수 모델 (선택)
│       └── catcher.glb            # 포수 모델 (선택)
│
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 3.2 데이터 흐름

```
[사용자 입력]
    ↓
[SimulationContext] ← 단순 모드: 슬라이더 값
    ↓                  전문가 모드: 수치 입력
[PitchPhysics.ts]
    ↓
[Physics Engine] → 시간 스텝마다 힘 계산
    ↓                (중력 + 항력 + 마그누스)
[적분기] → 위치/속도 업데이트
    ↓
[궤적 데이터 배열]
    ↓
[Scene3D] → Three.js로 렌더링
    ↓
[결과 패널] → 수치 데이터 표시
```

---

## 4. 물리 엔진 구현

### 4.1 핵심 물리 법칙

**1. 중력**
```
F_gravity = m * g * [0, -1, 0]
```

**2. 항력 (Drag Force)**
```
F_drag = -0.5 * ρ * C_d * A * |v|² * v̂
```
- ρ: 공기 밀도 (1.225 kg/m³ at sea level)
- C_d: 항력 계수 (야구공: ~0.3-0.5)
- A: 단면적 (야구공: π * 0.0366² m²)

**3. 마그누스 효과 (Magnus Effect)**
```
F_magnus = 0.5 * C_L * ρ * A * |v|² * (ω × v̂)
```
- C_L: 양력 계수 (~0.1-0.4, rpm에 따라 변화)
- ω: 각속도 벡터

### 4.2 수치 적분 방법

**초기 구현: Euler Method**
```typescript
// 단순하고 빠름, 정확도는 낮음
v_new = v + (F/m) * dt
x_new = x + v * dt
```

**향후 개선: RK4 Method**
```typescript
// 정확도 높음, 계산량 많음
// 4차 Runge-Kutta 적분
```

### 4.3 시뮬레이션 루프

```typescript
interface SimulationState {
  position: Vector3
  velocity: Vector3
  spin: Vector3  // 각속도 벡터 (rpm)
  time: number
  trajectory: Vector3[]  // 궤적 기록
}

function simulate(
  initialState: SimulationState,
  params: PitchParameters,
  dt: number = 0.01  // 10ms 타임스텝
): SimulationResult {
  let state = { ...initialState }
  const trajectory: Vector3[] = [state.position]

  while (state.time < maxTime && state.position.y > 0) {
    // 힘 계산
    const F_gravity = calculateGravity(params.mass)
    const F_drag = calculateDrag(state.velocity, params)
    const F_magnus = calculateMagnus(state.velocity, state.spin, params)
    const F_total = F_gravity.add(F_drag).add(F_magnus)

    // 적분 (Euler)
    const acceleration = F_total.divideScalar(params.mass)
    state.velocity.add(acceleration.multiplyScalar(dt))
    state.position.add(state.velocity.clone().multiplyScalar(dt))
    state.time += dt

    trajectory.push(state.position.clone())
  }

  return { trajectory, finalState: state }
}
```

---

## 5. UI/UX 구현 계획

### 5.1 단순 모드 (기본)

**목표:** 물리 지식 없는 사용자도 직관적으로 사용

**입력 컨트롤:**
```typescript
interface SimpleModeInputs {
  throwPower: number      // 던지는 세기 (1-10) → 초기 속도로 매핑
  pitchType: PitchType    // 구종 선택 (직구, 커브, 슬라이더...)
  targetZone: string      // 목표 위치 (스트라이크존 9분할)
}

// 매핑 로직
function mapSimpleToAdvanced(simple: SimpleModeInputs): AdvancedInputs {
  return {
    initialSpeed: 20 + simple.throwPower * 5,  // 25-70 m/s
    releaseAngle: pitchTypePresets[simple.pitchType].angle,
    spinRate: pitchTypePresets[simple.pitchType].rpm,
    spinAxis: pitchTypePresets[simple.pitchType].axis,
  }
}
```

**UI 레이아웃:**
```
┌─────────────────────────────────────┐
│ 던지는 세기: [========>---] (7/10)  │
│ 구종: [직구 ▼]                      │
│ 목표 위치: [스트라이크존 그리드]    │
│              [시뮬레이션 시작] 버튼  │
└─────────────────────────────────────┘
```

### 5.2 전문가 모드

**입력 컨트롤:**
```typescript
interface AdvancedInputs {
  initialSpeed: number    // m/s (10-50)
  releaseAngle: number    // degrees (-10 to 10)
  releaseHeight: number   // m (1.5-2.5)
  spinRate: number        // rpm (0-3000)
  spinAxis: Vector3       // 회전축 (정규화된 벡터)
  airDensity: number      // kg/m³ (환경 변수)
}
```

**UI 레이아웃:**
```
┌──────────────────────────────────────────┐
│ 초기 속도: [35.5] m/s [?]               │
│ 릴리즈 각도: [-2.5] deg [?]             │
│ 회전수: [2400] rpm [?]                  │
│ 회전축:                                 │
│   X: [0.2] Y: [0.9] Z: [-0.1] [?]      │
│ 공기 밀도: [1.225] kg/m³ [?]            │
│                  [시뮬레이션 시작] 버튼  │
└──────────────────────────────────────────┘
```

**[?] 호버 시 모달 예시:**
```
┌────────────────────────────────────┐
│ 회전수 (Spin Rate)                 │
│                                    │
│ 공이 1분 동안 회전하는 횟수입니다. │
│                                    │
│ • 높을수록 변화가 큽니다           │
│ • 프로 투수: 2000-2800 rpm         │
│ • 커브볼은 2500+ rpm 권장          │
└────────────────────────────────────┘
```

### 5.3 프리셋 시스템

```typescript
const PITCH_PRESETS: Record<string, AdvancedInputs> = {
  'fastball_pro': {
    initialSpeed: 40.2,  // ~145 km/h
    releaseAngle: -3,
    releaseHeight: 2.0,
    spinRate: 2400,
    spinAxis: { x: 0, y: 1, z: 0 },  // 백스핀
    airDensity: 1.225,
  },
  'curveball_pro': {
    initialSpeed: 30.5,  // ~110 km/h
    releaseAngle: 0,
    releaseHeight: 2.0,
    spinRate: 2800,
    spinAxis: { x: 0.3, y: 0.7, z: 0.2 },  // 탑스핀 + 측면
    airDensity: 1.225,
  },
  // ... 더 많은 프리셋
}
```

**프리셋 UI:**
```
┌────────────────────────────────┐
│ 프리셋 선택:                   │
│  • 프로 직구 (145 km/h)        │
│  • 프로 커브볼                 │
│  • 슬라이더                    │
│  • 체인지업                    │
│  • 커스텀 (사용자 설정)        │
└────────────────────────────────┘
```

### 5.4 결과 표시

```
┌───────────────────────────────┐
│ 시뮬레이션 결과               │
├───────────────────────────────┤
│ 비행 시간: 0.42초             │
│ 최고 높이: 2.15m              │
│ 홈플레이트 도달 높이: 0.85m   │
│ 최종 속도: 38.2 m/s           │
│ 수평 이동: -0.23m (←)         │
│ 수직 낙차: 0.52m (↓)          │
│                               │
│ 판정: 스트라이크 (중앙 저구)  │
└───────────────────────────────┘
```

---

## 6. 3D 렌더링 구현

### 6.1 씬 구성

```typescript
<Canvas camera={{ position: [0, 2, 20], fov: 50 }}>
  {/* 조명 */}
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} intensity={1} />

  {/* 환경 */}
  <Grid args={[50, 50]} />
  <Field />  {/* 야구장 바닥 */}

  {/* 시뮬레이션 객체 */}
  <Ball position={currentPosition} />
  <TrajectoryLine points={trajectory} />
  <Pitcher position={[0, 0, 0]} />
  <Catcher position={[0, 0, 18.44]} />  {/* 18.44m = 60.5 feet */}

  {/* 컨트롤 */}
  <OrbitControls enablePan={true} />
</Canvas>
```

### 6.2 궤적 시각화

```typescript
// 궤적을 Line으로 렌더링
function TrajectoryLine({ points }: { points: Vector3[] }) {
  const lineRef = useRef<Line>()

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.geometry.setFromPoints(points)
    }
  }, [points])

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="red" linewidth={2} />
    </line>
  )
}
```

### 6.3 애니메이션

```typescript
function Ball({ trajectory, isAnimating }: BallProps) {
  const ballRef = useRef<Mesh>()
  const [currentIndex, setCurrentIndex] = useState(0)

  useFrame(() => {
    if (!isAnimating || currentIndex >= trajectory.length) return

    ballRef.current.position.copy(trajectory[currentIndex])
    setCurrentIndex(i => i + 1)
  })

  return (
    <mesh ref={ballRef}>
      <sphereGeometry args={[0.0366]} /> {/* 야구공 반지름 */}
      <meshStandardMaterial color="white" />
    </mesh>
  )
}
```

---

## 7. 개발 로드맵

### Phase 1: 기반 구축 (1-2주)
- [ ] 프로젝트 초기 설정 (Vite + React + TS)
- [ ] 3D 씬 기본 구조 (Three.js + R3F)
- [ ] 물리 엔진 코어 구현 (중력만)
- [ ] 단순한 궤적 시뮬레이션 (포물선)

### Phase 2: 물리 완성 (1-2주)
- [ ] 항력 구현
- [ ] 마그누스 효과 구현
- [ ] 수치 적분 안정성 검증
- [ ] 실제 데이터와 비교 검증

### Phase 3: UI 구현 (1-2주)
- [ ] 단순 모드 입력 UI
- [ ] 전문가 모드 입력 UI
- [ ] 모드 토글 기능
- [ ] 용어 설명 모달
- [ ] 결과 표시 패널

### Phase 4: 프리셋 & 고도화 (1주)
- [ ] 프리셋 데이터 작성
- [ ] 프리셋 선택 UI
- [ ] 3D 모델 추가 (투수, 포수)
- [ ] 애니메이션 개선
- [ ] 성능 최적화

### Phase 5: 테스트 & 문서화 (1주)
- [ ] 사용성 테스트
- [ ] 버그 수정
- [ ] 사용자 가이드 작성
- [ ] 배포 준비

**총 예상 기간: 5-8주**

---

## 8. 성공 기준

### 8.1 기능적 기준
- [ ] 사용자가 입력한 파라미터로 정확한 궤적이 계산됨
- [ ] 중력, 항력, 마그누스 효과가 모두 적용됨
- [ ] 단순/전문가 모드 전환이 원활함
- [ ] 프리셋 선택 시 즉시 적용됨
- [ ] 3D 시각화가 부드럽게 작동함

### 8.2 비기능적 기준
- [ ] 평균 30fps 이상 유지
- [ ] Chrome, Firefox, Edge 호환
- [ ] 물리 지식 없는 사용자도 5분 내 사용 가능

### 8.3 물리 정확도 검증
- [ ] 프로 직구(40 m/s, 백스핀 2400rpm) → 수평 이동 < 0.1m
- [ ] 커브볼(30 m/s, 2800rpm) → 수직 낙차 > 0.5m
- [ ] 무회전 너클볼 → 항력만 적용, 불규칙 움직임 없음

---

## 9. 향후 확장 계획 (v2.0+)

### 9.1 추가 시나리오 모듈
- **타격 시뮬레이터**: 타구 각도, 배트 속도 → 비거리
- **자유낙하 실험**: 공기 저항 유무 비교
- **포물선 운동**: 각도와 초기 속도에 따른 최대 비거리

### 9.2 고급 기능
- **역방향 계산**: 목표 위치 → 필요한 입력값 자동 계산
- **AI 최적화**: 특정 목표를 위한 최적 파라미터 제안
- **멀티플레이어**: 친구와 정확도 경쟁
- **기록 시스템**: 시뮬레이션 결과 저장/공유

### 9.3 교육 콘텐츠
- **물리 튜토리얼**: 각 힘의 영향을 단계별로 학습
- **퀴즈 모드**: "커브볼을 만들려면?" 같은 문제
- **실험 과제**: 교사가 학생에게 과제 할당

---

## 10. 기술적 고려사항

### 10.1 기존 3DS 코드 재사용 가능 부분
- ✅ `CameraController.tsx`: 그대로 사용 가능
- ✅ `PerformanceMonitor.tsx`: 그대로 사용 가능
- ✅ `WebGLErrorBoundary.tsx`: 그대로 사용 가능
- ⚠️ `SceneContext`: 구조는 유사하나 상태 타입 완전히 변경
- ❌ `aiService.ts`: 사용하지 않음
- ❌ `AuthContext`: 사용하지 않음

### 10.2 새로 구현 필요한 부분
- 물리 계산 엔진 전체
- 시나리오 모듈 구조
- 파라미터 입력 UI
- 프리셋 시스템
- 결과 분석 로직

### 10.3 성능 최적화 전략
- 궤적 계산은 Web Worker에서 수행 (메인 스레드 블로킹 방지)
- 궤적 포인트는 적절히 샘플링 (모든 타임스텝을 렌더링하지 않음)
- 3D 모델은 Low-poly 사용
- Three.js 객체 재사용 (매번 생성/삭제 금지)

---

## 11. 참고 자료

### 11.1 물리 관련
- "The Physics of Baseball" - Robert K. Adair
- MLB Statcast 데이터
- NASA 항력 계산 문서

### 11.2 기술 문서
- Three.js 공식 문서
- React Three Fiber 문서
- TypeScript 핸드북

---

## 부록: 주요 타입 정의

```typescript
// src/scenarios/pitch/types.ts

export interface Vector3 {
  x: number
  y: number
  z: number
}

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

export type PitchType =
  | 'fastball'    // 직구
  | 'curveball'   // 커브
  | 'slider'      // 슬라이더
  | 'changeup'    // 체인지업
  | 'knuckleball' // 너클볼

export type UIMode = 'simple' | 'advanced'
```

---

**문서 끝**