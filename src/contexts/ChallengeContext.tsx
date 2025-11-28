import { createContext, useContext, useState, ReactNode } from 'react'
import { SimulationResult, StrikeZone } from '@/types'

// 챌린지 타입
export type ChallengeType = 'target' | 'movement' | 'reverse' | null

// 타겟 챌린지 상태
export interface TargetChallengeState {
  levelId: string
  levelTitle: string
  currentTarget: StrikeZone | null
  attemptsLeft: number
  maxAttempts: number
  successCount: number
  totalTargets: number
  lastResult: {
    success: boolean
    actualZone: StrikeZone | null
    message: string
  } | null
}

// 변화량 챌린지 상태
export interface MovementChallengeState {
  goalId: string
  goalTitle: string
  lastResult: {
    achieved: boolean
    message: string
    details: string
  } | null
}

// 역문제 챌린지 상태
export interface ReverseChallengeState {
  problemId: string
  problemTitle: string
  lastResult: {
    solved: boolean
    score: number
    feedback: string[]
  } | null
}

// 통합 챌린지 상태
interface ChallengeContextState {
  // 현재 활성화된 챌린지 타입
  activeChallenge: ChallengeType

  // 각 챌린지 상태
  targetChallenge: TargetChallengeState | null
  movementChallenge: MovementChallengeState | null
  reverseChallenge: ReverseChallengeState | null

  // 액션
  startTargetChallenge: (state: TargetChallengeState) => void
  updateTargetChallenge: (updates: Partial<TargetChallengeState>) => void
  endTargetChallenge: () => void

  startMovementChallenge: (state: MovementChallengeState) => void
  updateMovementChallenge: (updates: Partial<MovementChallengeState>) => void
  endMovementChallenge: () => void

  startReverseChallenge: (state: ReverseChallengeState) => void
  updateReverseChallenge: (updates: Partial<ReverseChallengeState>) => void
  endReverseChallenge: () => void

  // 시뮬레이션 결과 처리 (각 챌린지에서 호출)
  checkChallengeResult: (result: SimulationResult) => void
}

const ChallengeContext = createContext<ChallengeContextState | undefined>(undefined)

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [activeChallenge, setActiveChallenge] = useState<ChallengeType>(null)
  const [targetChallenge, setTargetChallenge] = useState<TargetChallengeState | null>(null)
  const [movementChallenge, setMovementChallenge] = useState<MovementChallengeState | null>(null)
  const [reverseChallenge, setReverseChallenge] = useState<ReverseChallengeState | null>(null)

  // 타겟 챌린지
  const startTargetChallenge = (state: TargetChallengeState) => {
    setActiveChallenge('target')
    setTargetChallenge(state)
  }

  const updateTargetChallenge = (updates: Partial<TargetChallengeState>) => {
    if (targetChallenge) {
      setTargetChallenge({ ...targetChallenge, ...updates })
    }
  }

  const endTargetChallenge = () => {
    setActiveChallenge(null)
    setTargetChallenge(null)
  }

  // 변화량 챌린지
  const startMovementChallenge = (state: MovementChallengeState) => {
    setActiveChallenge('movement')
    setMovementChallenge(state)
  }

  const updateMovementChallenge = (updates: Partial<MovementChallengeState>) => {
    if (movementChallenge) {
      setMovementChallenge({ ...movementChallenge, ...updates })
    }
  }

  const endMovementChallenge = () => {
    setActiveChallenge(null)
    setMovementChallenge(null)
  }

  // 역문제 챌린지
  const startReverseChallenge = (state: ReverseChallengeState) => {
    setActiveChallenge('reverse')
    setReverseChallenge(state)
  }

  const updateReverseChallenge = (updates: Partial<ReverseChallengeState>) => {
    if (reverseChallenge) {
      setReverseChallenge({ ...reverseChallenge, ...updates })
    }
  }

  const endReverseChallenge = () => {
    setActiveChallenge(null)
    setReverseChallenge(null)
  }

  // 시뮬레이션 결과 체크 (각 챌린지 패널에서 직접 처리하므로 여기서는 빈 함수)
  const checkChallengeResult = (_result: SimulationResult) => {
    // 각 챌린지 패널에서 useEffect로 직접 처리
    // 이 함수는 확장성을 위해 남겨둠
  }

  return (
    <ChallengeContext.Provider
      value={{
        activeChallenge,
        targetChallenge,
        movementChallenge,
        reverseChallenge,
        startTargetChallenge,
        updateTargetChallenge,
        endTargetChallenge,
        startMovementChallenge,
        updateMovementChallenge,
        endMovementChallenge,
        startReverseChallenge,
        updateReverseChallenge,
        endReverseChallenge,
        checkChallengeResult
      }}
    >
      {children}
    </ChallengeContext.Provider>
  )
}

export function useChallenge() {
  const context = useContext(ChallengeContext)
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider')
  }
  return context
}
