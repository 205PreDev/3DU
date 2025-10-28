# 문서 누락 사항 정리 (신규 기능만)

**작성일**: 2025-10-27
**목적**: CLAUDE.md에 구현된 신규 기능 중 요구사항 명세서 및 설계 명세서에 누락된 사항 정리

---

## 📋 신규 추가된 기능 (문서 미반영)

### 1. 상단 네비게이션 바 (TopNavigationBar)
- **구현 파일**: `src/core/ui/TopNavigationBar.tsx`
- **기능**:
  - 뒤로가기 버튼 (시나리오 선택 화면으로 이동 예정)
  - 시나리오 이름 표시
  - 도움말 버튼 (HelpModal 연동)
  - 사용자 메뉴 버튼 (향후 확장)
- **스타일**: 48px 높이, 고정 위치, 다크 테마
- **현재 문서 상태**: ❌ 미작성

---

### 2. 우측 패널 탭 구조 (TabContainer)
- **구현 파일**: `src/core/ui/TabContainer.tsx`
- **기능**:
  - 재사용 가능한 탭 컴포넌트
  - 4개 탭 구성: 파라미터 / 결과 / 최근 실험 / 비교
  - 탭 전환 애니메이션
  - 스크롤 영역 분리
- **인터페이스**:
  ```typescript
  export interface Tab {
    id: string
    label: string
    content: ReactNode
  }

  export function TabContainer({
    tabs,
    defaultTab
  }: TabContainerProps)
  ```
- **현재 문서 상태**: ❌ 미작성

---

### 3. 도움말 모달 (HelpModal)
- **구현 파일**: `src/core/ui/HelpModal.tsx`
- **기능**:
  - 3개 탭 구성: 시작하기 / 키보드 단축키 / FAQ
  - **시작하기 탭**: 단계별 가이드 (파라미터 입력 → 실행 → 결과 확인)
  - **키보드 단축키 탭**:
    - 시뮬레이션: Space, R, Esc
    - 카메라: 1-5 (프리셋 전환)
    - 리플레이: ←→, [], ,.
  - **FAQ 탭**:
    - 스트라이크 존이란?
    - 회전축 설명 (X/Y/Z)
    - 환경 변수 영향
    - 비교 모드 사용법
- **현재 문서 상태**: ❌ 미작성

---

### 4. 최근 실험 기능 (RecentExperimentsPanel)
- **구현 파일**:
  - `src/core/ui/RecentExperimentsPanel.tsx`
  - `src/utils/recentExperiments.ts`
- **기능**:
  - LocalStorage 기반 저장 (최대 10개)
  - 실험 저장 (이름 지정 모달)
  - 실험 불러오기 (파라미터 자동 복원)
  - 실험 삭제 (개별/전체)
  - 실험 정보 표시 (속도, 회전, 스트라이크 판정)
  - **상세 보기 모달** (ExperimentDetailModal)
- **데이터 구조**:
  ```typescript
  interface RecentExperiment {
    id: string
    name: string
    params: PitchParameters
    result: SimulationResult
    createdAt: number
  }
  ```
- **저장 위치**: LocalStorage (`recentExperiments` 키)
- **현재 문서 상태**: ⚠️ FR-010에 서버 저장 방식만 언급, LocalStorage 구현은 미작성

---

### 5. 실험 상세 보기 모달 (ExperimentDetailModal)
- **구현 파일**: `src/core/ui/ExperimentDetailModal.tsx`
- **기능**:
  - 저장된 실험의 모든 파라미터 및 결과 표시
  - **표시 항목**:
    - 공 물성 (질량, 반지름, 항력계수, 양력계수)
    - 투구 조건 (속도, 각도, 회전 X/Y/Z, 릴리스 포인트)
    - 환경 변수 (중력, 온도, 기압, 습도)
    - 결과 (8가지 계측값, 스트라이크 판정 강조)
  - 2열 그리드 레이아웃
  - 스크롤 가능한 모달
- **현재 문서 상태**: ❌ 미작성

---

## 📝 문서 업데이트 권장 사항

### A. 요구사항 명세서 (`docs/요구사항명세서_문서용.txt`)

#### A.1 섹션 2.2 주요 기능에 추가
```
8. UI 네비게이션 및 사용자 경험 개선
   - 상단 네비게이션 바: 뒤로가기, 시나리오 이름, 도움말, 사용자 메뉴
   - 우측 패널 탭 구조: 파라미터/결과/최근 실험/비교 4개 탭
   - 도움말 모달: 시작하기, 키보드 단축키, FAQ 3개 탭
   - 최근 실험 기능: LocalStorage 기반 클라이언트 저장 (최대 10개)
   - 실험 상세 보기: 모든 파라미터 및 결과 수치 표시
```

#### A.2 새로운 기능 요구사항 추가 (3.3.3절에 추가)

```
FR-015: UI 네비게이션 및 도움말 시스템

[표 삽입: FR-015 상세 기능 명세표]
- 항목: 기능 ID, 기능명, 상세 설명, 우선순위, 주요 컴포넌트, 비고
- 내용:
  - 기능 ID: FR-015
  - 기능명: UI 네비게이션 및 도움말 시스템
  - 상세 설명:
    * 상단 네비게이션 바: 뒤로가기 버튼, 시나리오 이름 표시, 도움말 버튼, 사용자 메뉴
    * 우측 패널 탭 구조: 파라미터/결과/최근 실험/비교 4개 탭으로 구성
    * 도움말 모달: 시작 가이드, 키보드 단축키 (Space/R/Esc/1-5/화살표), FAQ
    * 탭 전환 애니메이션 및 스크롤 영역 분리
  - 우선순위: 중
  - 주요 컴포넌트: TopNavigationBar, TabContainer, HelpModal
  - 입력: 사용자 클릭 이벤트
  - 출력: 탭 전환, 모달 표시, 네비게이션
  - 비고: 사용자 경험 개선을 위한 UI 구조 개선

FR-016: 최근 실험 관리 시스템 (LocalStorage)

[표 삽입: FR-016 상세 기능 명세표]
- 항목: 기능 ID, 기능명, 상세 설명, 우선순위, 저장 방식, 주요 기능, 비고
- 내용:
  - 기능 ID: FR-016
  - 기능명: 최근 실험 관리 시스템 (클라이언트 저장)
  - 상세 설명:
    * LocalStorage 기반 클라이언트 저장 (최대 10개, 초과 시 자동 삭제)
    * 실험 저장: 이름 지정 모달, 파라미터 + 결과 함께 저장
    * 실험 불러오기: 파라미터 자동 복원, 원클릭 재실행
    * 실험 삭제: 개별 삭제, 전체 삭제
    * 상세 보기: 모든 파라미터 및 결과 수치 표시 (모달)
    * 실험 정보 표시: 속도, 회전, 스트라이크 판정 요약
  - 우선순위: 중
  - 저장 방식: LocalStorage (키: recentExperiments)
  - 주요 기능: 저장/불러오기/삭제/상세보기
  - 입력: 실험 이름, 현재 파라미터 및 결과
  - 출력: 저장 완료 메시지, 실험 목록
  - 비고: FR-010 (서버 저장)과 별도로 클라이언트 로컬 저장 지원, 로그인 불필요
```

---

### B. 설계 명세서 (`docs/프로젝트 설계 명세서.md`)

#### B.1 섹션 3.4 UI 모듈에 추가 (3.4.6 이후에 삽입)

```
3.4.6 TopNavigationBar (상단 네비게이션 바)

**모듈 이름**: TopNavigationBar

**모듈 형**: React 함수형 컴포넌트

**인터페이스**:
```typescript
interface TopNavigationBarProps {
  scenarioName?: string
  onBack?: () => void
  onHelpClick: () => void
}
```

**주요 기능**:
- 뒤로가기 버튼: 시나리오 선택 화면으로 이동 (라우터 구현 후)
- 시나리오 이름 표시: 현재 시나리오 식별
- 도움말 버튼: HelpModal 트리거
- 사용자 메뉴 버튼: 향후 확장 예정 (로그인/설정)

**사용하는 파일**:
| 파일명 | 용도 |
|--------|------|
| styled-components | 스타일링 |
| react | useState, MouseEventHandler |

**호출하는 모듈**:
| 모듈명 | 호출 시점 | 목적 |
|--------|----------|------|
| HelpModal | 도움말 버튼 클릭 시 | 사용자 가이드 표시 |

**기능 설명**:

UI 레이아웃:
- 48px 고정 높이
- 좌측 섹션: 뒤로가기 버튼(←) + 시나리오 이름
- 우측 섹션: 도움말 버튼(?) + 사용자 메뉴(👤)
- 전체 화면 상단 고정 배치 (z-index: 1000)

스타일링:
- 배경: #1a1a2e (다크 테마)
- 강조 색상: #4caf50 (녹색)
- 버튼 호버 효과: 배경 밝아짐


3.4.7 TabContainer (탭 컨테이너)

**모듈 이름**: TabContainer

**모듈 형**: React 함수형 컴포넌트 (재사용 가능)

**인터페이스**:
```typescript
export interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface TabContainerProps {
  tabs: Tab[]
  defaultTab?: string
}
```

**주요 기능**:
- 탭 헤더 렌더링: 탭 목록을 수평 배열로 표시
- 활성 탭 콘텐츠 표시: 선택된 탭의 콘텐츠만 렌더링
- 탭 전환 애니메이션: 부드러운 전환 효과
- 스크롤 가능한 콘텐츠 영역: 콘텐츠가 길 경우 스크롤

**사용하는 파일**:
| 파일명 | 용도 |
|--------|------|
| styled-components | 스타일링 |
| react | useState, ReactNode |

**호출하는 모듈**:
없음 (Leaf 컴포넌트)

**기능 설명**:

사용 예시:
```typescript
const tabs: Tab[] = [
  { id: 'parameters', label: '파라미터', content: <PitchInputPanel /> },
  { id: 'results', label: '결과', content: <ResultPanel /> },
  { id: 'recent', label: '최근 실험', content: <RecentExperimentsPanel /> },
  { id: 'comparison', label: '비교', content: <ComparisonPanel /> }
]

<TabContainer tabs={tabs} defaultTab="parameters" />
```

UI 레이아웃:
- 탭 헤더: 상단 고정, 수평 배열
- 활성 탭 강조: 녹색 하단 보더
- 콘텐츠 영역: flex: 1, 스크롤 가능

재사용성:
- 다른 시나리오에서도 동일한 탭 구조 사용 가능
- Tab 인터페이스만 준수하면 모든 콘텐츠 호환


3.4.8 HelpModal (도움말 모달)

**모듈 이름**: HelpModal

**모듈 형**: React 함수형 컴포넌트

**인터페이스**:
```typescript
interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}
```

**주요 기능**:
- 3개 탭 구성: 시작하기 / 키보드 단축키 / FAQ
- **시작하기 탭**:
  - 1단계: 파라미터 입력 방법
  - 2단계: 시뮬레이션 실행
  - 3단계: 결과 확인 방법
- **키보드 단축키 탭**:
  - 시뮬레이션 제어: Space (실행/정지), R (초기화), Esc (정지)
  - 카메라 프리셋: 1 (포수), 2 (투수), 3 (측면), 4 (추적), 5 (자유)
  - 리플레이 제어: ←→ (프레임 이동), [] (속도 조절), ,. (0.1초 이동)
- **FAQ 탭**:
  - 스트라이크 존 정의 및 판정 기준
  - 회전축 (X/Y/Z) 효과 설명
  - 환경 변수 영향 설명
  - 비교 모드 사용법

**사용하는 파일**:
| 파일명 | 용도 |
|--------|------|
| styled-components | 스타일링 |
| react | useState |

**호출하는 모듈**:
없음 (Leaf 컴포넌트)

**기능 설명**:

UI 레이아웃:
- 중앙 정렬 모달 (최대 너비 800px)
- 오버레이 배경: rgba(0, 0, 0, 0.7), 클릭 시 닫기
- 모달 내부 탭 구조 (TabContainer 재사용)
- 스크롤 가능한 콘텐츠 (최대 높이 80vh)

접근성:
- ESC 키로 닫기
- 오버레이 클릭 시 닫기
- 모달 내부 클릭 시 이벤트 전파 차단


3.4.9 RecentExperimentsPanel (최근 실험 패널)

**모듈 이름**: RecentExperimentsPanel

**모듈 형**: React 함수형 컴포넌트

**인터페이스**:
```typescript
interface RecentExperimentsPanelProps {
  onLoad: (params: PitchParameters) => void
  onSave: (name: string) => void
}

interface RecentExperiment {
  id: string
  name: string
  params: PitchParameters
  result: SimulationResult
  createdAt: number
}
```

**주요 기능**:
- 실험 저장:
  - "현재 설정 저장" 버튼 클릭
  - 이름 지정 모달 표시 (기본값: "실험 MM-DD HH:mm")
  - LocalStorage에 저장
- 실험 불러오기:
  - "불러오기" 버튼 클릭
  - 파라미터 자동 복원
  - 원클릭으로 재실행 가능
- 실험 삭제:
  - 개별 삭제: "삭제" 버튼
  - 전체 삭제: "전체 삭제" 버튼 (확인 대화상자)
- 상세 보기:
  - "상세 보기" 버튼 클릭
  - ExperimentDetailModal 표시
- 실험 정보 표시:
  - 이름, 날짜
  - 속도, 회전 Y축, 스트라이크 판정 요약

**사용하는 파일**:
| 파일명 | 용도 |
|--------|------|
| @/utils/recentExperiments | recentExperimentsService (LocalStorage API) |
| styled-components | 스타일링 |
| react | useState, useEffect |

**호출하는 모듈**:
| 모듈명 | 호출 메서드 | 목적 |
|--------|------------|------|
| recentExperimentsService | getAll() | 실험 목록 조회 |
| recentExperimentsService | save() | 실험 저장 |
| recentExperimentsService | delete() | 실험 삭제 |
| ExperimentDetailModal | (렌더링) | 상세 정보 표시 |

**기능 설명**:

데이터 저장 방식:
- LocalStorage 키: `recentExperiments`
- 최대 10개 저장 (초과 시 가장 오래된 항목 자동 삭제)
- 데이터 구조: JSON 배열

UI 레이아웃:
- 헤더: 제목 "📋 최근 실험" + 카운트 (예: 7 / 10)
- 액션 버튼:
  - "💾 현재 설정 저장" (녹색)
  - "🗑️ 전체 삭제" (빨간색, 실험 있을 때만 표시)
- 실험 목록:
  - 스크롤 가능한 카드 리스트 (최대 높이 400px)
  - 각 카드: 이름, 날짜, 주요 파라미터, 액션 버튼 3개
  - 빈 상태: "📭 저장된 실험이 없습니다" 메시지

에러 처리:
- LocalStorage 접근 실패 시 콘솔 에러 출력
- 파싱 오류 시 빈 배열 반환


3.4.10 ExperimentDetailModal (실험 상세 모달)

**모듈 이름**: ExperimentDetailModal

**모듈 형**: React 함수형 컴포넌트

**인터페이스**:
```typescript
interface ExperimentDetailModalProps {
  experiment: RecentExperiment | null
  onClose: () => void
}
```

**주요 기능**:
- 실험 전체 정보 표시:
  - **공 물성 섹션**: 질량, 반지름, 항력계수, 양력계수
  - **투구 조건 섹션**:
    - 기본: 초기 속도, 수평 각도, 수직 각도
    - 회전: X축/Y축/Z축 rpm
    - 릴리스 포인트: X(좌우)/Y(높이)/Z(앞뒤)
  - **환경 변수 섹션**: 중력, 온도, 기압, 습도
  - **시뮬레이션 결과 섹션** (8가지 계측값):
    - 판정 (스트라이크/볼, 강조 표시)
    - 비행 시간, 최고 높이, 플레이트 높이
    - 수평 변화, 수직 낙차
    - 최종 속도, 궤적 포인트 개수

**사용하는 파일**:
| 파일명 | 용도 |
|--------|------|
| @/utils/recentExperiments | RecentExperiment 타입 |
| styled-components | 스타일링 |
| react | (기본 훅) |

**호출하는 모듈**:
없음 (Leaf 컴포넌트)

**기능 설명**:

UI 레이아웃:
- 중앙 정렬 모달 (최대 너비 700px, 최대 높이 90vh)
- 헤더: "📊 실험 상세 정보" + 닫기 버튼(×)
- 콘텐츠: 스크롤 가능
- 섹션별 구분: 녹색 좌측 보더
- 2열 그리드 레이아웃 (각 파라미터 표시)

스타일링:
- 스트라이크 판정: 녹색 배경 + 녹색 보더 강조
- 각 파라미터: 라벨(회색) + 값(흰색)
- 섹션 제목: 녹색 + 이모지
```

---

## 🎯 문서 업데이트 우선순위

### 높은 우선순위 (즉시 반영 권장)
1. ✅ **요구사항 명세서**: FR-015, FR-016 추가
2. ✅ **설계 명세서**: 3.4.6 ~ 3.4.10 UI 컴포넌트 추가

### 선택 사항
- 요구사항 명세서 2.2 주요 기능 섹션에 요약 추가

---

## 📌 참고사항

### 문서 버전 관리
- 요구사항 명세서: v3 (2025-10-27) → v4로 업데이트 권장
- 설계 명세서: v3 (2025-10-27) → v4로 업데이트 권장

### 기존 기능과의 관계
- FR-010 (시뮬레이션 저장 및 공유): 서버 저장 방식
- FR-016 (신규): LocalStorage 클라이언트 저장 방식
- 두 기능은 독립적으로 동작 (서로 배타적이지 않음)
