import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useSimulation } from '@/contexts/SimulationContext'
import { useChallenge } from '@/contexts/ChallengeContext'

interface MovementGoal {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  requirements: {
    horizontalBreakMin?: number
    horizontalBreakMax?: number
    verticalDropMin?: number
    verticalDropMax?: number
  }
  hint: string
  educationalNote: string
}

const MOVEMENT_GOALS: MovementGoal[] = [
  {
    id: 'basic-curve',
    title: '기본 커브볼',
    difficulty: 'easy',
    description: '수직 낙차 0.3m 이상 달성하기',
    requirements: {
      verticalDropMin: 0.3
    },
    hint: 'Y축 회전을 음수로 설정하면 탑스핀이 걸려 공이 더 많이 떨어집니다.',
    educationalNote: '탑스핀은 마그누스 힘을 아래 방향으로 작용시켜 중력과 함께 공을 급격히 떨어뜨립니다.'
  },
  {
    id: 'slider-movement',
    title: '슬라이더 변화',
    difficulty: 'medium',
    description: '수평 변위 0.2m 이상 달성하기',
    requirements: {
      horizontalBreakMin: 0.2
    },
    hint: 'X축 회전(사이드스핀)을 조절하여 공을 좌우로 휘게 만들 수 있습니다.',
    educationalNote: '사이드스핀은 마그누스 힘을 수평 방향으로 작용시켜 공의 궤적을 좌우로 휘게 만듭니다.'
  },
  {
    id: 'big-break',
    title: '큰 변화구',
    difficulty: 'hard',
    description: '수평 변위 0.3m 이상 + 수직 낙차 0.4m 이상',
    requirements: {
      horizontalBreakMin: 0.3,
      verticalDropMin: 0.4
    },
    hint: 'X축과 Y축 회전을 동시에 활용하여 대각선 방향의 큰 변화를 만들어보세요.',
    educationalNote: '복합 회전은 여러 방향의 마그누스 힘을 동시에 발생시켜 복잡한 궤적을 만들어냅니다.'
  },
  {
    id: 'controlled-movement',
    title: '정밀 제어',
    difficulty: 'hard',
    description: '수평 변위 0.15~0.25m + 수직 낙차 0.25~0.35m',
    requirements: {
      horizontalBreakMin: 0.15,
      horizontalBreakMax: 0.25,
      verticalDropMin: 0.25,
      verticalDropMax: 0.35
    },
    hint: '회전수와 속도의 균형을 맞춰 정확한 변화량을 만들어보세요.',
    educationalNote: '마그누스 힘의 크기는 공의 속도와 회전수에 비례합니다. 두 요소를 조절하여 원하는 변화량을 정밀하게 제어할 수 있습니다.'
  }
]

/**
 * 변화량 목표 패널
 * 수평/수직 변화량 목표 달성 챌린지
 */
export function MovementGoalPanel() {
  const { result } = useSimulation()
  const { movementChallenge, startMovementChallenge, endMovementChallenge } = useChallenge()
  const [selectedGoal, setSelectedGoal] = useState<MovementGoal>(MOVEMENT_GOALS[0])
  const [achievementResult, setAchievementResult] = useState<{
    achieved: boolean
    message: string
    details: string
  } | null>(null)

  const isActive = movementChallenge?.active || false

  // 목표 달성 여부 판정
  const checkAchievement = () => {
    if (!result || !result.reachedPlate) {
      setAchievementResult({
        achieved: false,
        message: '공이 스트라이크 존에 도달하지 못했습니다.',
        details: '먼저 공이 홈플레이트에 도달하도록 해보세요.'
      })
      return
    }

    const req = selectedGoal.requirements
    const hBreak = Math.abs(result.horizontalBreak)
    const vDrop = result.verticalDrop

    let achieved = true
    const failReasons: string[] = []

    // 수평 변위 체크
    if (req.horizontalBreakMin !== undefined && hBreak < req.horizontalBreakMin) {
      achieved = false
      failReasons.push(
        `수평 변위가 부족합니다 (${hBreak.toFixed(2)}m < ${req.horizontalBreakMin}m)`
      )
    }
    if (req.horizontalBreakMax !== undefined && hBreak > req.horizontalBreakMax) {
      achieved = false
      failReasons.push(
        `수평 변위가 너무 큽니다 (${hBreak.toFixed(2)}m > ${req.horizontalBreakMax}m)`
      )
    }

    // 수직 낙차 체크
    if (req.verticalDropMin !== undefined && vDrop < req.verticalDropMin) {
      achieved = false
      failReasons.push(
        `수직 낙차가 부족합니다 (${vDrop.toFixed(2)}m < ${req.verticalDropMin}m)`
      )
    }
    if (req.verticalDropMax !== undefined && vDrop > req.verticalDropMax) {
      achieved = false
      failReasons.push(
        `수직 낙차가 너무 큽니다 (${vDrop.toFixed(2)}m > ${req.verticalDropMax}m)`
      )
    }

    if (achieved) {
      setAchievementResult({
        achieved: true,
        message: `목표 달성! "${selectedGoal.title}" 완료!`,
        details: `수평 변위: ${hBreak.toFixed(2)}m, 수직 낙차: ${vDrop.toFixed(2)}m`
      })
    } else {
      setAchievementResult({
        achieved: false,
        message: '목표 미달성',
        details: failReasons.join('\n')
      })
    }
  }

  // 시뮬레이션 결과가 업데이트되면 자동으로 체크
  useEffect(() => {
    if (isActive && result && result.reachedPlate) {
      checkAchievement()
    }
  }, [result, selectedGoal, isActive])

  // 토글 함수
  const toggleChallenge = () => {
    if (isActive) {
      endMovementChallenge()
      setAchievementResult(null)
    } else {
      startMovementChallenge({
        goalId: selectedGoal.id,
        goalTitle: selectedGoal.title,
        lastResult: null
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return theme.colors.success
      case 'medium':
        return theme.colors.warning
      case 'hard':
        return theme.colors.error
      default:
        return theme.colors.text.secondary
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '쉬움'
      case 'medium':
        return '보통'
      case 'hard':
        return '어려움'
      default:
        return difficulty
    }
  }

  return (
    <Container>
      <Section>
        <SectionHeader>
          <SectionTitle>챌린지 선택</SectionTitle>
          <ToggleButton $active={isActive} onClick={toggleChallenge}>
            {isActive ? '✓ 활성화됨' : '활성화'}
          </ToggleButton>
        </SectionHeader>
        <GoalList>
          {MOVEMENT_GOALS.map((goal) => (
            <GoalCard
              key={goal.id}
              $selected={selectedGoal.id === goal.id}
              onClick={() => setSelectedGoal(goal)}
            >
              <GoalHeader>
                <GoalTitle>{goal.title}</GoalTitle>
                <DifficultyBadge $color={getDifficultyColor(goal.difficulty)}>
                  {getDifficultyLabel(goal.difficulty)}
                </DifficultyBadge>
              </GoalHeader>
              <GoalDescription>{goal.description}</GoalDescription>
            </GoalCard>
          ))}
        </GoalList>
      </Section>

      <Section>
        <SectionTitle>목표 상세</SectionTitle>
        <GoalDetail>
          <DetailTitle>{selectedGoal.title}</DetailTitle>
          <DetailDescription>{selectedGoal.description}</DetailDescription>

          <RequirementBox>
            <RequirementTitle>요구사항</RequirementTitle>
            {selectedGoal.requirements.horizontalBreakMin !== undefined && (
              <Requirement>
                수평 변위: {selectedGoal.requirements.horizontalBreakMin}m 이상
                {selectedGoal.requirements.horizontalBreakMax !== undefined &&
                  ` ~ ${selectedGoal.requirements.horizontalBreakMax}m 이하`}
              </Requirement>
            )}
            {selectedGoal.requirements.verticalDropMin !== undefined && (
              <Requirement>
                수직 낙차: {selectedGoal.requirements.verticalDropMin}m 이상
                {selectedGoal.requirements.verticalDropMax !== undefined &&
                  ` ~ ${selectedGoal.requirements.verticalDropMax}m 이하`}
              </Requirement>
            )}
          </RequirementBox>

          <HintBox>
            <HintIcon>💡</HintIcon>
            <HintText>
              <strong>힌트:</strong> {selectedGoal.hint}
            </HintText>
          </HintBox>
        </GoalDetail>
      </Section>

      {achievementResult && (
        <ResultSection $achieved={achievementResult.achieved}>
          <ResultIcon>{achievementResult.achieved ? '🎉' : '💪'}</ResultIcon>
          <ResultMessage>{achievementResult.message}</ResultMessage>
          <ResultDetails>{achievementResult.details}</ResultDetails>
        </ResultSection>
      )}

      {result && result.reachedPlate && (
        <StatsSection>
          <SectionTitle>현재 투구 변화량</SectionTitle>
          <StatsGrid>
            <StatItem>
              <StatLabel>수평 변위</StatLabel>
              <StatValue>{Math.abs(result.horizontalBreak).toFixed(3)} m</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>수직 낙차</StatLabel>
              <StatValue>{result.verticalDrop.toFixed(3)} m</StatValue>
            </StatItem>
          </StatsGrid>
        </StatsSection>
      )}

      <EducationalNote>
        <NoteTitle>물리학 개념</NoteTitle>
        <NoteContent>{selectedGoal.educationalNote}</NoteContent>
      </EducationalNote>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
  height: 100%;
  overflow-y: auto;
  padding: ${theme.spacing.xs};
`

const Section = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`

const SectionTitle = styled.h4`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.base};
  background: ${props => props.$active ? theme.colors.success : theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${props => props.$active ? theme.colors.success + 'dd' : theme.colors.primary.dark};
    transform: translateY(-1px);
  }
`

const GoalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const GoalCard = styled.div<{ $selected: boolean }>`
  padding: ${theme.spacing.sm};
  background: ${(props) =>
    props.$selected
      ? theme.colors.primary + '15'
      : theme.colors.background.secondary};
  border: 2px solid
    ${(props) =>
      props.$selected ? theme.colors.primary : theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${(props) =>
      props.$selected
        ? theme.colors.primary + '20'
        : theme.colors.background.elevated};
    border-color: ${theme.colors.primary};
  }
`

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};
`

const GoalTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const DifficultyBadge = styled.span<{ $color: string }>`
  font-size: ${theme.typography.fontSize.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${(props) => props.$color}20;
  color: ${(props) => props.$color};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`

const GoalDescription = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`

const GoalDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const DetailTitle = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const DetailDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`

const RequirementBox = styled.div`
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${theme.colors.primary};
`

const RequirementTitle = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`

const Requirement = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: ${theme.spacing.xs} 0;
  font-family: ${theme.typography.fontFamily.mono};
`

const HintBox = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.info}10;
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${theme.colors.info};
`

const HintIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`

const HintText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`

const ResultSection = styled.div<{ $achieved: boolean }>`
  padding: ${theme.spacing.base};
  background: ${(props) =>
    props.$achieved ? theme.colors.success + '10' : theme.colors.warning + '10'};
  border: 2px solid
    ${(props) => (props.$achieved ? theme.colors.success : theme.colors.warning)};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`

const ResultIcon = styled.div`
  font-size: 48px;
`

const ResultMessage = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  text-align: center;
`

const ResultDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  white-space: pre-line;
`

const StatsSection = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.sm};
`

const StatItem = styled.div`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  text-align: center;
`

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.mono};
`

const EducationalNote = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-left: 4px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
`

const NoteTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const NoteContent = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`
