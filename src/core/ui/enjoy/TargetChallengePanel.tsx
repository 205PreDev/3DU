import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useSimulation } from '@/contexts/SimulationContext'
import { useChallenge } from '@/contexts/ChallengeContext'
import { StrikeZone, STRIKE_ZONE } from '@/types'

// 챌린지 단계 정의
interface ChallengeLevel {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  description: string
  allowedZones: StrikeZone[] // 목표로 제시될 수 있는 구역들
  attempts: number // 시도 횟수
  hint: string
}

const CHALLENGE_LEVELS: ChallengeLevel[] = [
  {
    id: 'beginner-center',
    title: '초급: 중앙 맞추기',
    difficulty: 'easy',
    description: '스트라이크 존 중앙(5번)을 맞추세요',
    allowedZones: [5],
    attempts: 3,
    hint: '정면으로 던지고, 회전을 최소화하세요. 수직각을 약간 조절해 높이를 맞춥니다.'
  },
  {
    id: 'beginner-middle-row',
    title: '초급: 중단 맞추기',
    difficulty: 'easy',
    description: '중단 구역(4, 5, 6번) 중 하나를 맞추세요',
    allowedZones: [4, 5, 6],
    attempts: 3,
    hint: '높이는 0.7~0.9m 정도로 유지하면 됩니다. 좌우 위치는 수평각과 X축 회전으로 조절합니다.'
  },
  {
    id: 'intermediate-corners',
    title: '중급: 코너 맞추기',
    difficulty: 'medium',
    description: '4개 코너(1, 3, 7, 9번) 중 하나를 맞추세요',
    allowedZones: [1, 3, 7, 9],
    attempts: 5,
    hint: '코너는 높이와 좌우 변화를 모두 제어해야 합니다. 수직각과 회전을 함께 활용하세요.'
  },
  {
    id: 'intermediate-edges',
    title: '중급: 엣지 맞추기',
    difficulty: 'medium',
    description: '상하좌우 엣지(2, 4, 6, 8번) 중 하나를 맞추세요',
    allowedZones: [2, 4, 6, 8],
    attempts: 5,
    hint: '한 방향으로만 변화를 주면 됩니다. 상하는 수직각, 좌우는 수평각과 회전으로 조절합니다.'
  },
  {
    id: 'advanced-random',
    title: '고급: 랜덤 구역',
    difficulty: 'hard',
    description: '무작위로 제시되는 구역을 맞추세요',
    allowedZones: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    attempts: 7,
    hint: '모든 파라미터를 능숙하게 다룰 수 있어야 합니다. 목표 구역을 보고 역으로 필요한 변화량을 계산하세요.'
  },
  {
    id: 'expert-sequential',
    title: '전문가: 연속 도전',
    difficulty: 'expert',
    description: '3개 구역을 연속으로 맞추세요',
    allowedZones: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    attempts: 10,
    hint: '각 구역마다 파라미터를 빠르게 조정하는 능력이 필요합니다. 패턴을 파악하면 쉬워집니다.'
  }
]

/**
 * 타겟 챌린지 패널
 * 9구역으로 나눈 스트라이크 존에서 특정 구역 맞추기
 */
export function TargetChallengePanel() {
  const { result } = useSimulation()
  const { startTargetChallenge, updateTargetChallenge, endTargetChallenge } = useChallenge()
  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel>(CHALLENGE_LEVELS[0])
  const [currentTarget, setCurrentTarget] = useState<StrikeZone | null>(null)
  const [attemptsLeft, setAttemptsLeft] = useState(selectedLevel.attempts)
  const [successCount, setSuccessCount] = useState(0)
  const [totalTargets] = useState(3) // 전문가 모드용
  const [challengeActive, setChallengeActive] = useState(false)
  const [lastAttemptResult, setLastAttemptResult] = useState<{
    success: boolean
    actualZone: StrikeZone | null
    message: string
  } | null>(null)

  // 랜덤 목표 구역 생성
  const generateRandomTarget = () => {
    const zones = selectedLevel.allowedZones
    const randomIndex = Math.floor(Math.random() * zones.length)
    return zones[randomIndex]
  }

  // 챌린지 시작
  const startChallenge = () => {
    const target = generateRandomTarget()
    setChallengeActive(true)
    setAttemptsLeft(selectedLevel.attempts)
    setSuccessCount(0)
    setCurrentTarget(target)
    setLastAttemptResult(null)

    // Context에 챌린지 상태 저장
    startTargetChallenge({
      levelId: selectedLevel.id,
      levelTitle: selectedLevel.title,
      currentTarget: target,
      attemptsLeft: selectedLevel.attempts,
      maxAttempts: selectedLevel.attempts,
      successCount: 0,
      totalTargets: selectedLevel.id === 'expert-sequential' ? 3 : 1,
      lastResult: null
    })
  }

  // 챌린지 레벨 변경
  const handleLevelChange = (level: ChallengeLevel) => {
    setSelectedLevel(level)
    setChallengeActive(false)
    setCurrentTarget(null)
    setLastAttemptResult(null)
    endTargetChallenge()
  }

  // 공이 어느 구역에 도달했는지 판정
  const getZoneFromPosition = (x: number, y: number): StrikeZone | null => {
    const width = STRIKE_ZONE.WIDTH
    const top = STRIKE_ZONE.HEIGHT.TOP
    const bottom = STRIKE_ZONE.HEIGHT.BOTTOM
    const height = top - bottom

    // 스트라이크 존 범위 체크
    if (x < -width / 2 || x > width / 2 || y < bottom || y > top) {
      return null // 존 밖
    }

    // 좌우 위치 (1=왼쪽, 2=중앙, 3=오른쪽)
    const colWidth = width / 3
    let col: number
    if (x < -width / 2 + colWidth) col = 1
    else if (x < -width / 2 + colWidth * 2) col = 2
    else col = 3

    // 상하 위치 (1=상단, 2=중앙, 3=하단)
    const rowHeight = height / 3
    let row: number
    if (y > top - rowHeight) row = 1
    else if (y > top - rowHeight * 2) row = 2
    else row = 3

    // 구역 번호 계산 (1~9)
    return ((row - 1) * 3 + col) as StrikeZone
  }

  // 시뮬레이션 결과 확인
  useEffect(() => {
    if (!challengeActive || !currentTarget || !result || !result.reachedPlate) return

    const actualZone = getZoneFromPosition(
      result.finalPosition.x,
      result.plateHeight
    )

    const resultObj = {
      success: actualZone === currentTarget,
      actualZone,
      message: ''
    }

    if (actualZone === null) {
      resultObj.success = false
      resultObj.message = '볼입니다! 스트라이크 존 밖으로 빗나갔습니다.'
      setLastAttemptResult(resultObj)
      const newAttemptsLeft = attemptsLeft - 1
      setAttemptsLeft(newAttemptsLeft)

      // Context 업데이트
      updateTargetChallenge({
        attemptsLeft: newAttemptsLeft,
        lastResult: resultObj
      })
      return
    }

    const success = actualZone === currentTarget

    if (success) {
      const newSuccessCount = successCount + 1
      setSuccessCount(newSuccessCount)

      if (selectedLevel.id === 'expert-sequential' && newSuccessCount < totalTargets) {
        // 연속 챌린지: 다음 목표 생성
        resultObj.message = `성공! ${newSuccessCount}/${totalTargets} 완료. 다음 목표를 준비하세요!`
        setLastAttemptResult(resultObj)

        // Context 업데이트
        updateTargetChallenge({
          successCount: newSuccessCount,
          lastResult: resultObj
        })

        setTimeout(() => {
          const newTarget = generateRandomTarget()
          setCurrentTarget(newTarget)
          setLastAttemptResult(null)

          // Context 업데이트 - 새 목표
          updateTargetChallenge({
            currentTarget: newTarget
          })
        }, 2000)
      } else {
        // 챌린지 완료
        resultObj.message = `챌린지 완료! ${selectedLevel.title}을(를) 클리어했습니다!`
        setLastAttemptResult(resultObj)
        setChallengeActive(false)

        // Context 업데이트 및 종료
        updateTargetChallenge({
          successCount: newSuccessCount,
          lastResult: resultObj
        })
        endTargetChallenge()
      }
    } else {
      resultObj.message = `${actualZone}번 구역에 도달했습니다. 목표는 ${currentTarget}번입니다.`
      setLastAttemptResult(resultObj)
      const newAttemptsLeft = attemptsLeft - 1
      setAttemptsLeft(newAttemptsLeft)

      // Context 업데이트
      updateTargetChallenge({
        attemptsLeft: newAttemptsLeft,
        lastResult: resultObj
      })
    }
  }, [result])

  // 시도 횟수 소진
  useEffect(() => {
    if (challengeActive && attemptsLeft <= 0) {
      const failResult = {
        success: false,
        actualZone: null,
        message: '시도 횟수를 모두 소진했습니다. 다시 도전하세요!'
      }
      setLastAttemptResult(failResult)
      setChallengeActive(false)

      // Context 종료
      endTargetChallenge()
    }
  }, [attemptsLeft, challengeActive, endTargetChallenge])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.success
      case 'medium': return theme.colors.warning
      case 'hard': return theme.colors.error
      case 'expert': return theme.colors.primary.main
      default: return theme.colors.text.secondary
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움'
      case 'medium': return '보통'
      case 'hard': return '어려움'
      case 'expert': return '전문가'
      default: return difficulty
    }
  }

  return (
    <Container>
      <Section>
        <SectionTitle>챌린지 선택</SectionTitle>
        <LevelList>
          {CHALLENGE_LEVELS.map((level) => (
            <LevelCard
              key={level.id}
              $selected={selectedLevel.id === level.id}
              onClick={() => handleLevelChange(level)}
            >
              <LevelHeader>
                <LevelTitle>{level.title}</LevelTitle>
                <DifficultyBadge $color={getDifficultyColor(level.difficulty)}>
                  {getDifficultyLabel(level.difficulty)}
                </DifficultyBadge>
              </LevelHeader>
              <LevelDescription>{level.description}</LevelDescription>
              <LevelInfo>시도 횟수: {level.attempts}회</LevelInfo>
            </LevelCard>
          ))}
        </LevelList>
      </Section>

      {!challengeActive ? (
        <StartSection>
          <StartButton onClick={startChallenge}>
            챌린지 시작
          </StartButton>
          <HintBox>
            <HintIcon>💡</HintIcon>
            <HintText>
              <strong>힌트:</strong> {selectedLevel.hint}
            </HintText>
          </HintBox>
        </StartSection>
      ) : (
        <>
          <TargetSection>
            <TargetHeader>
              <TargetTitle>목표 구역</TargetTitle>
              <AttemptsInfo>
                남은 시도: {attemptsLeft}/{selectedLevel.attempts}
                {selectedLevel.id === 'expert-sequential' && (
                  <span> | 진행: {successCount}/{totalTargets}</span>
                )}
              </AttemptsInfo>
            </TargetHeader>
            <ZoneDisplay>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((zone) => (
                <ZoneBox
                  key={zone}
                  $isTarget={currentTarget === zone}
                  $wasHit={lastAttemptResult?.actualZone === zone}
                >
                  {zone}
                </ZoneBox>
              ))}
            </ZoneDisplay>
            {currentTarget && (
              <TargetInstruction>
                <strong>{currentTarget}번 구역</strong>을 맞추세요!
              </TargetInstruction>
            )}
          </TargetSection>

          {lastAttemptResult && (
            <ResultSection $success={lastAttemptResult.success}>
              <ResultIcon>{lastAttemptResult.success ? '🎯' : '❌'}</ResultIcon>
              <ResultMessage>{lastAttemptResult.message}</ResultMessage>
            </ResultSection>
          )}
        </>
      )}

      <EducationalNote>
        <NoteTitle>학습 포인트</NoteTitle>
        <NoteContent>
          <li>
            <strong>수평 이동:</strong> 회전의 X축 성분(사이드스핀)과 수평각이 좌우 변화를 만듭니다.
          </li>
          <li>
            <strong>수직 이동:</strong> 회전의 Y축 성분(백스핀/탑스핀)과 수직각이 높이를 결정합니다.
          </li>
          <li>
            <strong>마그누스 효과:</strong> 공의 회전이 공기와 상호작용하여 궤적을 휘게 만듭니다.
          </li>
        </NoteContent>
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

const SectionTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const LevelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  max-height: 300px;
  overflow-y: auto;
`

const LevelCard = styled.div<{ $selected: boolean }>`
  padding: ${theme.spacing.sm};
  background: ${(props) =>
    props.$selected ? theme.colors.primary.main + '15' : theme.colors.background.secondary};
  border: 2px solid
    ${(props) => (props.$selected ? theme.colors.primary.main : theme.colors.border.light)};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${(props) =>
      props.$selected ? theme.colors.primary.main + '20' : theme.colors.background.elevated};
    border-color: ${theme.colors.primary.main};
  }
`

const LevelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};
`

const LevelTitle = styled.div`
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

const LevelDescription = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`

const LevelInfo = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  font-family: ${theme.typography.fontFamily.mono};
`

const StartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const StartButton = styled.button`
  padding: ${theme.spacing.base} ${theme.spacing.xl};
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark});
  color: white;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.bold};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.glow};
  }

  &:active {
    transform: translateY(0);
  }
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

const TargetSection = styled(Section)``

const TargetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`

const TargetTitle = styled.h4`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const AttemptsInfo = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.mono};

  span {
    margin-left: ${theme.spacing.xs};
  }
`

const ZoneDisplay = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.sm};
`

const ZoneBox = styled.div<{ $isTarget: boolean; $wasHit: boolean }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  border-radius: ${theme.borderRadius.sm};
  border: 2px solid
    ${(props) =>
      props.$isTarget
        ? theme.colors.primary.main
        : props.$wasHit
        ? theme.colors.error
        : theme.colors.border.main};
  background: ${(props) =>
    props.$isTarget
      ? theme.colors.primary.main + '30'
      : props.$wasHit
      ? theme.colors.error + '20'
      : theme.colors.background.secondary};
  color: ${(props) =>
    props.$isTarget || props.$wasHit
      ? theme.colors.text.primary
      : theme.colors.text.secondary};
  transition: ${theme.transitions.fast};
  ${(props) =>
    props.$isTarget &&
    `
    animation: pulse 1.5s ease-in-out infinite;
    box-shadow: ${theme.shadows.glow};
  `}

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`

const TargetInstruction = styled.div`
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`

const ResultSection = styled.div<{ $success: boolean }>`
  padding: ${theme.spacing.base};
  background: ${(props) =>
    props.$success ? theme.colors.success + '10' : theme.colors.error + '10'};
  border: 2px solid
    ${(props) => (props.$success ? theme.colors.success : theme.colors.error)};
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

const EducationalNote = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-left: 4px solid ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
`

const NoteTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const NoteContent = styled.ul`
  margin: 0;
  padding-left: ${theme.spacing.base};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};

  li {
    margin: ${theme.spacing.xs} 0;
  }

  strong {
    color: ${theme.colors.text.primary};
  }
`
