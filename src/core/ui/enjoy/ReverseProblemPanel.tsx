import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useSimulation } from '@/contexts/SimulationContext'

interface ReverseProblem {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  targetResult: {
    plateHeight: { min: number; max: number }
    horizontalBreak: { min: number; max: number }
    verticalDrop: { min: number; max: number }
    speedRange?: { min: number; max: number } // km/h
  }
  hint: string
  educationalNote: string
  visualization: string
}

const REVERSE_PROBLEMS: ReverseProblem[] = [
  {
    id: 'high-strike',
    title: '높은 스트라이크',
    difficulty: 'easy',
    description: '공이 높은 위치로 통과하도록 만들기',
    targetResult: {
      plateHeight: { min: 0.9, max: 1.1 },
      horizontalBreak: { min: -0.1, max: 0.1 },
      verticalDrop: { min: 0, max: 0.3 }
    },
    hint: '백스핀과 높은 릴리스 각도를 활용하면 공이 덜 떨어집니다.',
    educationalNote: '백스핀(양의 Y축 회전)은 마그누스 힘을 위쪽으로 작용시켜 중력을 상쇄하는 효과를 만듭니다. 이를 "라이즈 효과"라고 부릅니다.',
    visualization: '목표: 스트라이크 존 상단 (높이 0.9~1.1m)'
  },
  {
    id: 'low-strike',
    title: '낮은 스트라이크',
    difficulty: 'easy',
    description: '공이 낮은 위치로 떨어지도록 만들기',
    targetResult: {
      plateHeight: { min: 0.5, max: 0.7 },
      horizontalBreak: { min: -0.1, max: 0.1 },
      verticalDrop: { min: 0.4, max: 1.0 }
    },
    hint: '탑스핀이나 낮은 릴리스 각도를 사용하면 공이 더 많이 떨어집니다.',
    educationalNote: '탑스핀(음의 Y축 회전)은 마그누스 힘을 아래쪽으로 작용시켜 중력과 함께 공을 급격히 떨어뜨립니다.',
    visualization: '목표: 스트라이크 존 하단 (높이 0.5~0.7m)'
  },
  {
    id: 'outside-corner',
    title: '바깥쪽 코너',
    difficulty: 'medium',
    description: '공이 우타자 바깥쪽 코너로 휘도록 만들기',
    targetResult: {
      plateHeight: { min: 0.65, max: 0.95 },
      horizontalBreak: { min: 0.15, max: 0.30 },
      verticalDrop: { min: 0.2, max: 0.5 }
    },
    hint: '오른쪽으로 휘려면 양의 X축 회전(사이드스핀)이 필요합니다.',
    educationalNote: '사이드스핀은 공을 수평 방향으로 휘게 만듭니다. 회전 방향에 따라 공이 휘는 방향이 결정됩니다.',
    visualization: '목표: 오른쪽으로 15~30cm 이동'
  },
  {
    id: 'diagonal-break',
    title: '대각선 변화',
    difficulty: 'hard',
    description: '공이 오른쪽 아래로 휘면서 떨어지도록 만들기',
    targetResult: {
      plateHeight: { min: 0.55, max: 0.75 },
      horizontalBreak: { min: 0.20, max: 0.35 },
      verticalDrop: { min: 0.35, max: 0.55 }
    },
    hint: 'X축과 Y축 회전을 동시에 활용하여 복합적인 변화를 만들어보세요.',
    educationalNote: '복합 회전은 여러 방향의 마그누스 힘을 동시에 발생시킵니다. 각 성분의 크기를 조절하여 원하는 방향으로 공을 휘게 할 수 있습니다.',
    visualization: '목표: 우하향 대각선 (우측 20~35cm, 낙차 35~55cm)'
  },
  {
    id: 'precise-control',
    title: '정밀 제어 마스터',
    difficulty: 'hard',
    description: '스트라이크 존 정중앙을 정확히 통과시키기',
    targetResult: {
      plateHeight: { min: 0.75, max: 0.85 },
      horizontalBreak: { min: -0.05, max: 0.05 },
      verticalDrop: { min: 0.25, max: 0.35 }
    },
    hint: '회전과 각도의 균형을 정밀하게 맞춰야 합니다. 작은 변화에도 민감하게 반응합니다.',
    educationalNote: '정확한 제어는 모든 파라미터의 균형을 요구합니다. 속도, 각도, 회전이 모두 조화를 이뤄야 원하는 결과를 얻을 수 있습니다.',
    visualization: '목표: 정중앙 (높이 0.8m, 수평 변위 ±5cm)'
  }
]

/**
 * 역문제 패널
 * 목표 결과를 주고 그에 맞는 파라미터를 찾는 챌린지
 */
export function ReverseProblemPanel() {
  const { result } = useSimulation()
  const [selectedProblem, setSelectedProblem] = useState<ReverseProblem>(REVERSE_PROBLEMS[0])
  const [solveResult, setSolveResult] = useState<{
    solved: boolean
    score: number
    feedback: string[]
  } | null>(null)

  // 문제 해결 여부 판정
  const checkSolution = () => {
    if (!result || !result.reachedPlate) {
      setSolveResult({
        solved: false,
        score: 0,
        feedback: ['공이 스트라이크 존에 도달하지 못했습니다.']
      })
      return
    }

    const target = selectedProblem.targetResult
    const plateH = result.plateHeight
    const hBreak = result.horizontalBreak
    const vDrop = result.verticalDrop

    let score = 0
    const feedback: string[] = []
    let solved = true

    // 높이 체크 (33점)
    if (plateH >= target.plateHeight.min && plateH <= target.plateHeight.max) {
      score += 33
      feedback.push(`✅ 높이: ${plateH.toFixed(2)}m (목표 범위 내)`)
    } else {
      solved = false
      const diff = plateH < target.plateHeight.min
        ? target.plateHeight.min - plateH
        : plateH - target.plateHeight.max
      feedback.push(
        `❌ 높이: ${plateH.toFixed(2)}m (목표 ${target.plateHeight.min.toFixed(2)}~${target.plateHeight.max.toFixed(2)}m, 차이: ${diff.toFixed(2)}m)`
      )
    }

    // 수평 변위 체크 (33점)
    if (hBreak >= target.horizontalBreak.min && hBreak <= target.horizontalBreak.max) {
      score += 33
      feedback.push(
        `✅ 수평 변위: ${hBreak > 0 ? '→' : '←'} ${Math.abs(hBreak).toFixed(2)}m (목표 범위 내)`
      )
    } else {
      solved = false
      const diff = hBreak < target.horizontalBreak.min
        ? target.horizontalBreak.min - hBreak
        : hBreak - target.horizontalBreak.max
      feedback.push(
        `❌ 수평 변위: ${hBreak > 0 ? '→' : '←'} ${Math.abs(hBreak).toFixed(2)}m (차이: ${Math.abs(diff).toFixed(2)}m)`
      )
    }

    // 수직 낙차 체크 (34점)
    if (vDrop >= target.verticalDrop.min && vDrop <= target.verticalDrop.max) {
      score += 34
      feedback.push(`✅ 수직 낙차: ${vDrop.toFixed(2)}m (목표 범위 내)`)
    } else {
      solved = false
      const diff = vDrop < target.verticalDrop.min
        ? target.verticalDrop.min - vDrop
        : vDrop - target.verticalDrop.max
      feedback.push(
        `❌ 수직 낙차: ${vDrop.toFixed(2)}m (차이: ${diff.toFixed(2)}m)`
      )
    }

    setSolveResult({
      solved,
      score,
      feedback
    })
  }

  // 시뮬레이션 결과 업데이트 시 자동 체크
  useEffect(() => {
    if (result && result.reachedPlate) {
      checkSolution()
    }
  }, [result, selectedProblem])

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
      <IntroSection>
        <IntroTitle>역문제 챌린지</IntroTitle>
        <IntroText>
          목표 궤적이 주어집니다. 이 궤적을 만들어내는 파라미터를 찾아보세요!
          물리 법칙을 이해하고 역으로 추론하는 능력을 키울 수 있습니다.
        </IntroText>
      </IntroSection>

      <Section>
        <SectionTitle>문제 선택</SectionTitle>
        <ProblemList>
          {REVERSE_PROBLEMS.map((problem) => (
            <ProblemCard
              key={problem.id}
              $selected={selectedProblem.id === problem.id}
              onClick={() => setSelectedProblem(problem)}
            >
              <ProblemHeader>
                <ProblemTitle>{problem.title}</ProblemTitle>
                <DifficultyBadge $color={getDifficultyColor(problem.difficulty)}>
                  {getDifficultyLabel(problem.difficulty)}
                </DifficultyBadge>
              </ProblemHeader>
              <ProblemDescription>{problem.description}</ProblemDescription>
            </ProblemCard>
          ))}
        </ProblemList>
      </Section>

      <Section>
        <SectionTitle>문제 상세</SectionTitle>
        <ProblemDetail>
          <DetailTitle>{selectedProblem.title}</DetailTitle>
          <DetailDescription>{selectedProblem.description}</DetailDescription>

          <VisualizationBox>
            <VisualizationIcon>🎯</VisualizationIcon>
            <VisualizationText>{selectedProblem.visualization}</VisualizationText>
          </VisualizationBox>

          <TargetBox>
            <TargetTitle>목표 조건</TargetTitle>
            <TargetList>
              <TargetItem>
                도달 높이: {selectedProblem.targetResult.plateHeight.min.toFixed(2)}m ~{' '}
                {selectedProblem.targetResult.plateHeight.max.toFixed(2)}m
              </TargetItem>
              <TargetItem>
                수평 변위: {selectedProblem.targetResult.horizontalBreak.min.toFixed(2)}m ~{' '}
                {selectedProblem.targetResult.horizontalBreak.max.toFixed(2)}m
              </TargetItem>
              <TargetItem>
                수직 낙차: {selectedProblem.targetResult.verticalDrop.min.toFixed(2)}m ~{' '}
                {selectedProblem.targetResult.verticalDrop.max.toFixed(2)}m
              </TargetItem>
            </TargetList>
          </TargetBox>

          <HintBox>
            <HintIcon>💡</HintIcon>
            <HintText>
              <strong>힌트:</strong> {selectedProblem.hint}
            </HintText>
          </HintBox>
        </ProblemDetail>
      </Section>

      {solveResult && (
        <ResultSection $solved={solveResult.solved}>
          <ResultHeader>
            <ResultIcon>{solveResult.solved ? '🎉' : '🔧'}</ResultIcon>
            <ResultTitle>
              {solveResult.solved ? '문제 해결!' : `진행 중... (${solveResult.score}/100)`}
            </ResultTitle>
          </ResultHeader>
          <ScoreBar>
            <ScoreProgress $score={solveResult.score} />
          </ScoreBar>
          <FeedbackList>
            {solveResult.feedback.map((fb, idx) => (
              <FeedbackItem key={idx}>{fb}</FeedbackItem>
            ))}
          </FeedbackList>
        </ResultSection>
      )}

      <EducationalNote>
        <NoteTitle>물리학 개념</NoteTitle>
        <NoteContent>{selectedProblem.educationalNote}</NoteContent>
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

const IntroSection = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.primary}05);
  border: 1px solid ${theme.colors.primary}40;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
`

const IntroTitle = styled.h3`
  margin: 0 0 ${theme.spacing.xs} 0;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`

const IntroText = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
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

const ProblemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const ProblemCard = styled.div<{ $selected: boolean }>`
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

const ProblemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};
`

const ProblemTitle = styled.div`
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

const ProblemDescription = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`

const ProblemDetail = styled.div`
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

const VisualizationBox = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.primary}10;
  border-radius: ${theme.borderRadius.sm};
  border: 1px dashed ${theme.colors.primary};
`

const VisualizationIcon = styled.div`
  font-size: 32px;
  flex-shrink: 0;
`

const VisualizationText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`

const TargetBox = styled.div`
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${theme.colors.primary};
`

const TargetTitle = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`

const TargetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const TargetItem = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
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

const ResultSection = styled.div<{ $solved: boolean }>`
  padding: ${theme.spacing.base};
  background: ${(props) =>
    props.$solved ? theme.colors.success + '10' : theme.colors.warning + '10'};
  border: 2px solid
    ${(props) => (props.$solved ? theme.colors.success : theme.colors.warning)};
  border-radius: ${theme.borderRadius.md};
`

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
`

const ResultIcon = styled.div`
  font-size: 32px;
`

const ResultTitle = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`

const ScoreBar = styled.div`
  width: 100%;
  height: 24px;
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
  margin-bottom: ${theme.spacing.sm};
`

const ScoreProgress = styled.div<{ $score: number }>`
  width: ${(props) => props.$score}%;
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.success}, ${theme.colors.primary});
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
`

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const FeedbackItem = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.mono};
  padding: ${theme.spacing.xs};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
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
