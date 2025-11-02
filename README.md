# 교육용 3D 물리 시뮬레이터

물리 법칙을 시각적으로 확인하고 변수를 직접 제어할 수 있는 웹 기반 3D 시뮬레이션 애플리케이션입니다.

## 🎯 프로젝트 개요

초기 버전은 **투구 시뮬레이터** 모듈을 포함하여, 야구공 투구에 적용되는 물리 현상(중력, 항력, 마그누스 효과)을 3D 환경에서 재현합니다.

## 🚀 주요 기능

- **순방향 시뮬레이션**: 사용자가 정의한 초기 조건에 따라 궤적 계산 및 시각화
- **단순/전문가 모드**: 초보자를 위한 직관적 UI와 고급 사용자를 위한 상세 파라미터 제어
- **프리셋 시스템**: 프로 투수의 다양한 구종 프리셋 제공
- **실시간 3D 렌더링**: Three.js 기반 부드러운 애니메이션
- **물리 법칙 시각화**: 중력, 항력, 마그누스 효과를 정확히 계산

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript
- **3D 렌더링**: Three.js + @react-three/fiber + @react-three/drei
- **물리 계산**: 자체 구현 (Euler/RK4 적분)
- **상태 관리**: Zustand
- **스타일링**: Styled Components
- **빌드 도구**: Vite

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix
```

## 🏗 프로젝트 구조

```
EDU/
├── src/
│   ├── core/                   # 코어 모듈
│   │   ├── physics/            # 물리 계산 엔진
│   │   ├── renderer/           # 3D 렌더링
│   │   └── ui/                 # 공통 UI 컴포넌트
│   ├── scenarios/              # 시나리오 모듈
│   │   └── pitch/              # 투구 시뮬레이터
│   ├── contexts/               # React Context
│   ├── types/                  # TypeScript 타입
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── models/                 # 3D 모델 파일
├── package.json
└── vite.config.ts
```

## 📋 물리 계산

### 적용된 물리 법칙

1. **중력**: F_gravity = m × g × [0, -1, 0]
2. **항력**: F_drag = -0.5 × ρ × C_d × A × |v|² × v̂
3. **마그누스 효과**: F_magnus = 0.5 × C_L × ρ × A × |v|² × (ω × v̂)

### 수치 적분

- 초기 구현: Euler Method
- 향후 개선: Runge-Kutta 4차 (RK4)

## 🎮 사용법

### 단순 모드
1. 던지는 세기를 슬라이더로 조절
2. 구종 선택 (직구, 커브, 슬라이더 등)
3. "시뮬레이션 시작" 버튼 클릭

### 전문가 모드
1. 초기 속도, 릴리즈 각도, 회전수 등 상세 파라미터 입력
2. 각 파라미터 옆의 "?" 아이콘에 마우스를 올려 용어 설명 확인
3. "시뮬레이션 시작" 버튼 클릭

## 📈 개발 로드맵

- [x] Phase 1: 기반 구축 (프로젝트 설정, 3D 씬)
- [ ] Phase 2: 물리 완성 (중력, 항력, 마그누스)
- [ ] Phase 3: UI 구현 (단순/전문가 모드)
- [ ] Phase 4: 프리셋 & 고도화
- [ ] Phase 5: 테스트 & 문서화

## 📄 라이선스

MIT License

## 👥 팀

Educational Physics Simulator Team
