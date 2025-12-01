import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useSimulation } from '@/contexts/SimulationContext'
import { useChallenge } from '@/contexts/ChallengeContext'
import { STRIKE_ZONE } from '@/types'

interface MittPosition {
  x: number // -1 to 1 (normalized)
  y: number // -1 to 1 (normalized)
}

interface ImpactPoint {
  id: number
  x: number // 실제 좌표
  y: number // 실제 좌표
  success: boolean
  timestamp: number
}

interface ChallengeLevel {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  description: string
  targetRadius: number // 정확도 허용 범위 (normalized 0~1)
  attempts: number
  hint: string
}

const CHALLENGE_LEVELS: ChallengeLevel[] = [
  {
    id: 'beginner',
    title: '초급: 넓은 미트',
    difficulty: 'easy',
    description: '포수 미트에 공을 넣으세요 (큰 타겟)',
    targetRadius: 0.25,
    attempts: 3,
    hint: '미트 중심을 향해 던지세요. 수평각과 수직각으로 방향을 조절합니다.'
  },
  {
    id: 'intermediate',
    title: '중급: 보통 미트',
    difficulty: 'medium',
    description: '포수 미트에 정확히 넣으세요 (중간 타겟)',
    targetRadius: 0.15,
    attempts: 5,
    hint: '회전을 활용해 궤적을 미세 조정하세요.'
  },
  {
    id: 'advanced',
    title: '고급: 작은 미트',
    difficulty: 'hard',
    description: '포수 미트 중심에 정확히 넣으세요 (작은 타겟)',
    targetRadius: 0.1,
    attempts: 7,
    hint: '모든 파라미터를 정밀하게 조절해야 합니다.'
  },
  {
    id: 'expert',
    title: '전문가: 코너 워크',
    difficulty: 'expert',
    description: '4개 코너를 연속으로 맞추세요',
    targetRadius: 0.12,
    attempts: 10,
    hint: '각 코너마다 다른 파라미터 조합이 필요합니다.'
  }
]

/**
 * 포수 미트 타겟 챌린지
 * 실제 야구처럼 포수 미트 위치에 정확히 던지기
 */
export function CatcherMittPanel() {
  const { result } = useSimulation()
  const { catcherMittChallenge, startCatcherMittChallenge, updateCatcherMittChallenge, endCatcherMittChallenge } = useChallenge()
  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel>(CHALLENGE_LEVELS[0])
  const [impactPoints, setImpactPoints] = useState<ImpactPoint[]>([])

  const isActive = catcherMittChallenge?.active || false

  // 랜덤 미트 위치 생성
  const generateRandomMittPosition = (successCount: number): MittPosition => {
    if (selectedLevel.id === 'expert') {
      const corners = [
        { x: -0.7, y: 0.7 },
        { x: 0.7, y: 0.7 },
        { x: -0.7, y: -0.7 },
        { x: 0.7, y: -0.7 }
      ]
      return corners[successCount % 4]
    }

    return {
      x: (Math.random() - 0.5) * 1.6,
      y: (Math.random() - 0.5) * 1.6
    }
  }

  // 미트 위치를 실제 좌표로 변환
  const mittToWorldPosition = (mitt: MittPosition) => {
    const width = STRIKE_ZONE.WIDTH
    const height = STRIKE_ZONE.HEIGHT.TOP - STRIKE_ZONE.HEIGHT.BOTTOM
    const centerY = (STRIKE_ZONE.HEIGHT.TOP + STRIKE_ZONE.HEIGHT.BOTTOM) / 2

    return {
      x: mitt.x * (width / 2),
      y: centerY + mitt.y * (height / 2)
    }
  }

  // 챌린지 활성화 토글
  const toggleChallenge = () => {
    if (isActive) {
      endCatcherMittChallenge()
    } else {
      const target = generateRandomMittPosition(0)
      startCatcherMittChallenge({
        levelId: selectedLevel.id,
        levelTitle: selectedLevel.title,
        currentTarget: target,
        targetRadius: selectedLevel.targetRadius,
        attemptsLeft: selectedLevel.attempts,
        maxAttempts: selectedLevel.attempts,
        successCount: 0,
        totalTargets: selectedLevel.id === 'expert' ? 4 : 1,
        lastResult: null
      })
    }
  }

  // 레벨 변경
  const handleLevelChange = (level: ChallengeLevel) => {
    setSelectedLevel(level)
    if (isActive) {
      endCatcherMittChallenge()
    }
  }

  // 거리 및 정확도 계산
  const calculateAccuracy = (targetPos: MittPosition, actualX: number, actualY: number) => {
    const worldTarget = mittToWorldPosition(targetPos)
    const dx = actualX - worldTarget.x
    const dy = actualY - worldTarget.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    const maxDistance = STRIKE_ZONE.WIDTH / 2
    const accuracy = Math.max(0, 100 - (distance / maxDistance) * 100)

    return { distance, accuracy }
  }

  // 시뮬레이션 결과 확인
  useEffect(() => {
    if (!isActive || !catcherMittChallenge || !result || !result.reachedPlate) return
    if (!catcherMittChallenge.currentTarget) return

    const { distance, accuracy } = calculateAccuracy(
      catcherMittChallenge.currentTarget,
      result.finalPosition.x,
      result.plateHeight
    )

    const width = STRIKE_ZONE.WIDTH
    const height = STRIKE_ZONE.HEIGHT.TOP - STRIKE_ZONE.HEIGHT.BOTTOM
    const maxDim = Math.max(width, height)
    const normalizedDistance = distance / maxDim

    const success = normalizedDistance < catcherMittChallenge.targetRadius

    // 탄착점 추가
    const newImpactPoint: ImpactPoint = {
      id: impactPoints.length + 1,
      x: result.finalPosition.x,
      y: result.plateHeight,
      success,
      timestamp: Date.now()
    }
    setImpactPoints(prev => [...prev, newImpactPoint])

    if (success) {
      const newSuccessCount = catcherMittChallenge.successCount + 1

      if (selectedLevel.id === 'expert' && newSuccessCount < 4) {
        updateCatcherMittChallenge({
          successCount: newSuccessCount,
          lastResult: {
            success: true,
            distance,
            accuracy,
            message: `성공! ${newSuccessCount}/4 완료. 정확도: ${accuracy.toFixed(1)}점`
          }
        })

        setTimeout(() => {
          const newTarget = generateRandomMittPosition(newSuccessCount)
          updateCatcherMittChallenge({
            currentTarget: newTarget,
            lastResult: null
          })
        }, 2000)
      } else {
        updateCatcherMittChallenge({
          successCount: newSuccessCount,
          lastResult: {
            success: true,
            distance,
            accuracy,
            message: `완벽합니다! 정확도: ${accuracy.toFixed(1)}점 - 초기화 버튼을 눌러 다시 시작하세요`
          }
        })
      }
    } else {
      const newAttemptsLeft = catcherMittChallenge.attemptsLeft - 1
      updateCatcherMittChallenge({
        attemptsLeft: newAttemptsLeft,
        lastResult: {
          success: false,
          distance,
          accuracy,
          message: `미트를 벗어났습니다. 거리: ${(distance * 100).toFixed(1)}cm, 정확도: ${accuracy.toFixed(1)}점`
        }
      })

      if (newAttemptsLeft <= 0) {
        updateCatcherMittChallenge({
          lastResult: {
            success: false,
            distance,
            accuracy,
            message: `실패! 시도 횟수 소진. 초기화 버튼을 눌러 다시 시작하세요`
          }
        })
      }
    }
  }, [result])

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
        <SectionHeader>
          <SectionTitle>챌린지 선택</SectionTitle>
          <ToggleButton $active={isActive} onClick={toggleChallenge}>
            {isActive ? '✓ 활성화됨' : '활성화'}
          </ToggleButton>
        </SectionHeader>
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

      {isActive && catcherMittChallenge ? (
        <>
          <TargetSection>
            <TargetHeader>
              <TargetTitle>포수 미트 타겟</TargetTitle>
              <AttemptsInfo>
                남은 시도: {catcherMittChallenge.attemptsLeft}/{catcherMittChallenge.maxAttempts}
                {selectedLevel.id === 'expert' && (
                  <span> | 진행: {catcherMittChallenge.successCount}/4</span>
                )}
              </AttemptsInfo>
            </TargetHeader>

            <StrikeZoneDisplay>
              <ZoneBackground />

              {catcherMittChallenge.currentTarget && (
                <CatcherMitt
                  style={{
                    left: `${(catcherMittChallenge.currentTarget.x + 1) * 50}%`,
                    top: `${(1 - catcherMittChallenge.currentTarget.y) * 50}%`
                  }}
                  $radius={catcherMittChallenge.targetRadius}
                >
                  <MittIcon>🧤</MittIcon>
                  <TargetCircle $radius={catcherMittChallenge.targetRadius} />
                </CatcherMitt>
              )}

              {/* 탄착군 표시 */}
              {impactPoints.map((point) => {
                const centerY = (STRIKE_ZONE.HEIGHT.TOP + STRIKE_ZONE.HEIGHT.BOTTOM) / 2
                const height = STRIKE_ZONE.HEIGHT.TOP - STRIKE_ZONE.HEIGHT.BOTTOM
                const normalizedX = (point.x / (STRIKE_ZONE.WIDTH / 2) + 1) * 50
                const normalizedY = (1 - (point.y - centerY) / (height / 2)) * 50

                return (
                  <ImpactPointMarker
                    key={point.id}
                    style={{
                      left: `${normalizedX}%`,
                      top: `${normalizedY}%`
                    }}
                    $success={point.success}
                  >
                    <ImpactNumber>{point.id}</ImpactNumber>
                  </ImpactPointMarker>
                )
              })}

              {catcherMittChallenge.lastResult && result && (
                <BallMark
                  style={{
                    left: `${((result.finalPosition.x / (STRIKE_ZONE.WIDTH / 2)) + 1) * 50}%`,
                    top: `${(1 - ((result.plateHeight - (STRIKE_ZONE.HEIGHT.TOP + STRIKE_ZONE.HEIGHT.BOTTOM) / 2) / ((STRIKE_ZONE.HEIGHT.TOP - STRIKE_ZONE.HEIGHT.BOTTOM) / 2))) * 50}%`
                  }}
                  $success={catcherMittChallenge.lastResult.success}
                >
                  ⚾
                </BallMark>
              )}
            </StrikeZoneDisplay>

            <TargetInstruction>
              포수 미트 중심을 향해 정확히 던지세요!
            </TargetInstruction>

            {impactPoints.length > 0 && (
              <ClearButton onClick={() => setImpactPoints([])}>
                탄착군 초기화
              </ClearButton>
            )}
          </TargetSection>

          {catcherMittChallenge.lastResult && (
            <ResultSection $success={catcherMittChallenge.lastResult.success}>
              <ResultIcon>{catcherMittChallenge.lastResult.success ? '🎯' : '❌'}</ResultIcon>
              <ResultMessage>{catcherMittChallenge.lastResult.message}</ResultMessage>
              <AccuracyBar>
                <AccuracyFill $accuracy={catcherMittChallenge.lastResult.accuracy} />
                <AccuracyText>{catcherMittChallenge.lastResult.accuracy.toFixed(1)}점</AccuracyText>
              </AccuracyBar>
            </ResultSection>
          )}
        </>
      ) : (
        <InactiveState>
          <InactiveIcon>🧤</InactiveIcon>
          <InactiveText>챌린지를 활성화하고 파라미터를 조정한 뒤 시뮬레이션을 실행하세요</InactiveText>
          <HintBox>
            <HintIcon>💡</HintIcon>
            <HintText>
              <strong>힌트:</strong> {selectedLevel.hint}
            </HintText>
          </HintBox>
        </InactiveState>
      )}

      <EducationalNote>
        <NoteTitle>야구 포수의 역할</NoteTitle>
        <NoteContent>
          실제 야구에서 포수는 투수에게 미트로 목표 위치를 제시합니다.
          투수는 이 미트를 향해 정확히 던지는 능력(제구력)이 중요합니다.
          제구력이 좋을수록 원하는 위치에 공을 던져 타자를 효과적으로 상대할 수 있습니다.
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

const StrikeZoneDisplay = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
`

const ZoneBackground = styled.div`
  position: absolute;
  inset: 10%;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1));
  border: 2px solid ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.sm};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(0deg, ${theme.colors.border.light} 1px, transparent 1px),
      linear-gradient(90deg, ${theme.colors.border.light} 1px, transparent 1px);
    background-size: 33.33% 33.33%;
    opacity: 0.3;
  }
`

const CatcherMitt = styled.div<{ $radius: number }>`
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
`

const MittIcon = styled.div`
  font-size: 48px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: float 2s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
`

const TargetCircle = styled.div<{ $radius: number }>`
  position: absolute;
  width: ${props => props.$radius * 200}%;
  height: ${props => props.$radius * 200}%;
  border: 2px dashed ${theme.colors.primary.main};
  border-radius: 50%;
  opacity: 0.5;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.7; }
  }
`

const BallMark = styled.div<{ $success: boolean }>`
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 24px;
  z-index: 20;
  filter: ${props => props.$success
    ? 'drop-shadow(0 0 8px #4caf50)'
    : 'drop-shadow(0 0 8px #f44336)'};
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
  gap: ${theme.spacing.sm};
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

const AccuracyBar = styled.div`
  position: relative;
  width: 100%;
  height: 30px;
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
`

const AccuracyFill = styled.div<{ $accuracy: number }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${props => props.$accuracy}%;
  background: linear-gradient(90deg,
    ${theme.colors.error},
    ${theme.colors.warning},
    ${theme.colors.success}
  );
  transition: width 0.5s ease;
`

const AccuracyText = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`

const InactiveState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.tertiary};
  border: 2px dashed ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  gap: ${theme.spacing.sm};
`

const InactiveIcon = styled.div`
  font-size: 64px;
  opacity: 0.5;
`

const InactiveText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  max-width: 300px;
`

const HintBox = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.info}10;
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${theme.colors.info};
  align-self: stretch;
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

const NoteContent = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`

const ImpactPointMarker = styled.div<{ $success: boolean }>`
  position: absolute;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.$success ? theme.colors.success : theme.colors.error};
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  opacity: 0.85;
  transition: ${theme.transitions.fast};

  &:hover {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
`

const ImpactNumber = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`

const ClearButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.background.elevated};
    border-color: ${theme.colors.primary.main};
    color: ${theme.colors.text.primary};
  }
`
