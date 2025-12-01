import { createContext, useContext, useState, ReactNode } from 'react'
import { StrikeZone } from '@/types'

// 챌린지 타입 (포수 미트 추가)
export type ChallengeType = 'target' | 'catcherMitt' | 'movement' | 'reverse'

// 타겟 챌린지 상태
export interface TargetChallengeState {
  active: boolean
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

// 포수 미트 챌린지 상태
export interface CatcherMittChallengeState {
  active: boolean
  levelId: string
  levelTitle: string
  currentTarget: { x: number; y: number } | null
  targetRadius: number
  attemptsLeft: number
  maxAttempts: number
  successCount: number
  totalTargets: number
  lastResult: {
    success: boolean
    distance: number
    accuracy: number
    message: string
  } | null
}

// 변화량 챌린지 상태
export interface MovementChallengeState {
  active: boolean
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
  active: boolean
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
  // 각 챌린지 상태 (Map 대신 개별 상태)
  targetChallenge: TargetChallengeState | null
  catcherMittChallenge: CatcherMittChallengeState | null
  movementChallenge: MovementChallengeState | null
  reverseChallenge: ReverseChallengeState | null

  // 활성화된 챌린지 목록
  getActiveChallenges: () => ChallengeType[]

  // 타겟 챌린지 액션
  startTargetChallenge: (state: Omit<TargetChallengeState, 'active'>) => void
  updateTargetChallenge: (updates: Partial<Omit<TargetChallengeState, 'active'>>) => void
  endTargetChallenge: () => void

  // 포수 미트 챌린지 액션
  startCatcherMittChallenge: (state: Omit<CatcherMittChallengeState, 'active'>) => void
  updateCatcherMittChallenge: (updates: Partial<Omit<CatcherMittChallengeState, 'active'>>) => void
  endCatcherMittChallenge: () => void

  // 변화량 챌린지 액션
  startMovementChallenge: (state: Omit<MovementChallengeState, 'active'>) => void
  updateMovementChallenge: (updates: Partial<Omit<MovementChallengeState, 'active'>>) => void
  endMovementChallenge: () => void

  // 역문제 챌린지 액션
  startReverseChallenge: (state: Omit<ReverseChallengeState, 'active'>) => void
  updateReverseChallenge: (updates: Partial<Omit<ReverseChallengeState, 'active'>>) => void
  endReverseChallenge: () => void
}

const ChallengeContext = createContext<ChallengeContextState | undefined>(undefined)

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [targetChallenge, setTargetChallenge] = useState<TargetChallengeState | null>(null)
  const [catcherMittChallenge, setCatcherMittChallenge] = useState<CatcherMittChallengeState | null>(null)
  const [movementChallenge, setMovementChallenge] = useState<MovementChallengeState | null>(null)
  const [reverseChallenge, setReverseChallenge] = useState<ReverseChallengeState | null>(null)

  // 활성화된 챌린지 목록 반환
  const getActiveChallenges = (): ChallengeType[] => {
    const active: ChallengeType[] = []
    if (targetChallenge?.active) active.push('target')
    if (catcherMittChallenge?.active) active.push('catcherMitt')
    if (movementChallenge?.active) active.push('movement')
    if (reverseChallenge?.active) active.push('reverse')
    return active
  }

  // 타겟 챌린지
  const startTargetChallenge = (state: Omit<TargetChallengeState, 'active'>) => {
    setTargetChallenge({ ...state, active: true })
  }

  const updateTargetChallenge = (updates: Partial<Omit<TargetChallengeState, 'active'>>) => {
    if (targetChallenge) {
      setTargetChallenge({ ...targetChallenge, ...updates })
    }
  }

  const endTargetChallenge = () => {
    setTargetChallenge(null)
  }

  // 포수 미트 챌린지
  const startCatcherMittChallenge = (state: Omit<CatcherMittChallengeState, 'active'>) => {
    setCatcherMittChallenge({ ...state, active: true })
  }

  const updateCatcherMittChallenge = (updates: Partial<Omit<CatcherMittChallengeState, 'active'>>) => {
    if (catcherMittChallenge) {
      setCatcherMittChallenge({ ...catcherMittChallenge, ...updates })
    }
  }

  const endCatcherMittChallenge = () => {
    setCatcherMittChallenge(null)
  }

  // 변화량 챌린지
  const startMovementChallenge = (state: Omit<MovementChallengeState, 'active'>) => {
    setMovementChallenge({ ...state, active: true })
  }

  const updateMovementChallenge = (updates: Partial<Omit<MovementChallengeState, 'active'>>) => {
    if (movementChallenge) {
      setMovementChallenge({ ...movementChallenge, ...updates })
    }
  }

  const endMovementChallenge = () => {
    setMovementChallenge(null)
  }

  // 역문제 챌린지
  const startReverseChallenge = (state: Omit<ReverseChallengeState, 'active'>) => {
    setReverseChallenge({ ...state, active: true })
  }

  const updateReverseChallenge = (updates: Partial<Omit<ReverseChallengeState, 'active'>>) => {
    if (reverseChallenge) {
      setReverseChallenge({ ...reverseChallenge, ...updates })
    }
  }

  const endReverseChallenge = () => {
    setReverseChallenge(null)
  }

  return (
    <ChallengeContext.Provider
      value={{
        targetChallenge,
        catcherMittChallenge,
        movementChallenge,
        reverseChallenge,
        getActiveChallenges,
        startTargetChallenge,
        updateTargetChallenge,
        endTargetChallenge,
        startCatcherMittChallenge,
        updateCatcherMittChallenge,
        endCatcherMittChallenge,
        startMovementChallenge,
        updateMovementChallenge,
        endMovementChallenge,
        startReverseChallenge,
        updateReverseChallenge,
        endReverseChallenge
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
