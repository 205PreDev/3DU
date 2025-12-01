import { useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useSimulation } from '@/contexts/SimulationContext'
import { solveIK, type IKTarget, type IKSolution } from '@/lib/inverseKinematics'
import { STRIKE_ZONE } from '@/types'

/**
 * 역운동학(Inverse Kinematics) 패널
 * 목표 위치를 클릭하면 필요한 파라미터를 자동 계산
 */
export function InverseKinematicsPanel() {
  const { params, setParams } = useSimulation()
  const [target, setTarget] = useState<IKTarget>({
    plateHeight: 0.8, // 기본값: 스트라이크 존 중앙
    finalPositionX: 0
  })
  const [solutions, setSolutions] = useState<IKSolution[]>([])
  const [solving, setSolving] = useState(false)
  const [selectedSolution, setSelectedSolution] = useState<number | null>(null)

  const handleSolve = async () => {
    if (!params) return

    setSolving(true)
    setSolutions([])
    setSelectedSolution(null)

    try {
      // 비동기로 실행 (UI 블로킹 방지)
      await new Promise(resolve => setTimeout(resolve, 100))

      const result = solveIK(params, target)
      setSolutions(result.solutions)

      if (result.solutions.length > 0) {
        setSelectedSolution(0)
      }
    } catch (err) {
      console.error('IK 솔버 오류:', err)
    } finally {
      setSolving(false)
    }
  }

  const handleApplySolution = (index: number) => {
    if (solutions[index] && setParams) {
      setParams(solutions[index].params)
      setSelectedSolution(index)
    }
  }

  const handleStrikeZoneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 클릭 위치를 실제 좌표로 변환
    const width = rect.width
    const height = rect.height

    const zoneWidth = STRIKE_ZONE.WIDTH
    const zoneTop = STRIKE_ZONE.HEIGHT.TOP
    const zoneBottom = STRIKE_ZONE.HEIGHT.BOTTOM
    const zoneHeight = zoneTop - zoneBottom

    const targetX = ((x / width) - 0.5) * zoneWidth
    const targetY = zoneTop - (y / height) * zoneHeight

    setTarget({
      plateHeight: targetY,
      finalPositionX: targetX
    })
  }

  return (
    <Container>
      <Header>
        <Title>역운동학 솔버</Title>
        <Subtitle>목표 위치를 설정하면 필요한 파라미터를 자동으로 계산합니다</Subtitle>
      </Header>

      <Section>
        <SectionTitle>1. 목표 위치 설정</SectionTitle>
        <StrikeZoneContainer onClick={handleStrikeZoneClick}>
          <StrikeZoneVisual>
            <StrikeZoneGrid>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((zone) => (
                <ZoneCell key={zone}>{zone}</ZoneCell>
              ))}
            </StrikeZoneGrid>
            <TargetMarker
              style={{
                left: `${((target.finalPositionX ?? 0) / STRIKE_ZONE.WIDTH + 0.5) * 100}%`,
                top: `${((STRIKE_ZONE.HEIGHT.TOP - (target.plateHeight ?? STRIKE_ZONE.HEIGHT.TOP)) /
                  (STRIKE_ZONE.HEIGHT.TOP - STRIKE_ZONE.HEIGHT.BOTTOM)) * 100}%`
              }}
            >
              🎯
            </TargetMarker>
          </StrikeZoneVisual>
          <StrikeZoneLabel>클릭하여 목표 위치 설정</StrikeZoneLabel>
        </StrikeZoneContainer>

        <TargetInput>
          <InputGroup>
            <InputLabel>X 위치 (m)</InputLabel>
            <Input
              type="number"
              step="0.01"
              value={target.finalPositionX?.toFixed(2) ?? '0.00'}
              onChange={(e) => setTarget({ ...target, finalPositionX: parseFloat(e.target.value) })}
            />
          </InputGroup>
          <InputGroup>
            <InputLabel>높이 (m)</InputLabel>
            <Input
              type="number"
              step="0.01"
              value={target.plateHeight?.toFixed(2) ?? '0.80'}
              onChange={(e) => setTarget({ ...target, plateHeight: parseFloat(e.target.value) })}
            />
          </InputGroup>
        </TargetInput>

        <SolveButton onClick={handleSolve} disabled={solving}>
          {solving ? '계산 중...' : '솔루션 계산'}
        </SolveButton>
      </Section>

      {solving && (
        <LoadingSection>
          <LoadingSpinner />
          <LoadingText>최적의 파라미터를 찾고 있습니다...</LoadingText>
          <LoadingSubText>Gradient Descent와 Genetic Algorithm을 사용하여 여러 솔루션을 탐색합니다</LoadingSubText>
        </LoadingSection>
      )}

      {!solving && solutions.length > 0 && (
        <Section>
          <SectionTitle>2. 솔루션 선택 ({solutions.length}가지 방법)</SectionTitle>
          <SolutionsList>
            {solutions.map((solution, index) => (
              <SolutionCard
                key={index}
                $selected={selectedSolution === index}
                onClick={() => setSelectedSolution(index)}
              >
                <SolutionHeader>
                  <SolutionRank>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    {index === 0 && <BestBadge>최적</BestBadge>}
                  </SolutionRank>
                  <SolutionFitness>
                    적합도: {(solution.fitness * 100).toFixed(1)}%
                  </SolutionFitness>
                </SolutionHeader>

                <SolutionBody>
                  <ParamGrid>
                    <ParamItem>
                      <ParamLabel>초기 속도</ParamLabel>
                      <ParamValue>{solution.params.initial.velocity.toFixed(1)} m/s</ParamValue>
                    </ParamItem>
                    <ParamItem>
                      <ParamLabel>수평각</ParamLabel>
                      <ParamValue>{solution.params.initial.angle.horizontal.toFixed(2)}°</ParamValue>
                    </ParamItem>
                    <ParamItem>
                      <ParamLabel>수직각</ParamLabel>
                      <ParamValue>{solution.params.initial.angle.vertical.toFixed(2)}°</ParamValue>
                    </ParamItem>
                    <ParamItem>
                      <ParamLabel>X축 회전</ParamLabel>
                      <ParamValue>{solution.params.initial.spin.x.toFixed(0)} rpm</ParamValue>
                    </ParamItem>
                    <ParamItem>
                      <ParamLabel>Y축 회전</ParamLabel>
                      <ParamValue>{solution.params.initial.spin.y.toFixed(0)} rpm</ParamValue>
                    </ParamItem>
                    <ParamItem>
                      <ParamLabel>Z축 회전</ParamLabel>
                      <ParamValue>{solution.params.initial.spin.z.toFixed(0)} rpm</ParamValue>
                    </ParamItem>
                  </ParamGrid>

                  <ResultPreview>
                    <ResultItem>
                      <ResultLabel>예상 높이</ResultLabel>
                      <ResultValue>{(solution.result.plateHeight * 100).toFixed(1)}cm</ResultValue>
                    </ResultItem>
                    <ResultItem>
                      <ResultLabel>예상 X 위치</ResultLabel>
                      <ResultValue>{(solution.result.finalPosition.x * 100).toFixed(1)}cm</ResultValue>
                    </ResultItem>
                    <ResultItem>
                      <ResultLabel>오차</ResultLabel>
                      <ResultValue $error>{(solution.error * 100).toFixed(1)}cm</ResultValue>
                    </ResultItem>
                  </ResultPreview>
                </SolutionBody>

                <ApplyButton
                  onClick={(e) => {
                    e.stopPropagation()
                    handleApplySolution(index)
                  }}
                  $selected={selectedSolution === index}
                >
                  {selectedSolution === index ? '✓ 적용됨' : '이 솔루션 적용'}
                </ApplyButton>
              </SolutionCard>
            ))}
          </SolutionsList>
        </Section>
      )}

      <InfoBox>
        <InfoTitle>💡 사용법</InfoTitle>
        <InfoList>
          <li>스트라이크 존을 클릭하거나 좌표를 직접 입력하여 목표 위치를 설정하세요</li>
          <li>솔루션 계산 버튼을 누르면 여러 가지 파라미터 조합을 찾습니다</li>
          <li>각 솔루션은 다른 방식으로 목표에 도달하며, 적합도가 높을수록 정확합니다</li>
          <li>원하는 솔루션을 클릭한 후 적용 버튼을 누르면 파라미터가 자동으로 설정됩니다</li>
        </InfoList>
      </InfoBox>
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

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border.light};
`

const Title = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`

const Section = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
`

const SectionTitle = styled.h4`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const StrikeZoneContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  cursor: crosshair;
`

const StrikeZoneVisual = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 300px;
  margin: 0 auto;
  background: ${theme.colors.background.secondary};
  border: 2px solid ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.sm};
`

const StrikeZoneGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  width: 100%;
  height: 100%;
  background: ${theme.colors.border.main};
`

const ZoneCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.background.secondary};
  color: ${theme.colors.text.tertiary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`

const TargetMarker = styled.div`
  position: absolute;
  font-size: 24px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
`

const StrikeZoneLabel = styled.div`
  text-align: center;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`

const TargetInput = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.sm};
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const InputLabel = styled.label`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
`

const Input = styled.input`
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.mono};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
  }
`

const SolveButton = styled.button`
  padding: ${theme.spacing.base} ${theme.spacing.xl};
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark});
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.glow};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.base};
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
`

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid ${theme.colors.border.light};
  border-top-color: ${theme.colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const LoadingText = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const LoadingSubText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
`

const SolutionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
`

const SolutionCard = styled.div<{ $selected: boolean }>`
  background: ${theme.colors.background.secondary};
  border: 2px solid
    ${(props) => (props.$selected ? theme.colors.primary.main : theme.colors.border.light)};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary.main};
    box-shadow: ${theme.shadows.md};
  }
`

const SolutionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SolutionRank = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`

const BestBadge = styled.span`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.success};
  color: white;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
`

const SolutionFitness = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.mono};
`

const SolutionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const ParamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${theme.spacing.sm};
`

const ParamItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const ParamLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`

const ParamValue = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.mono};
`

const ResultPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.light};
`

const ResultItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const ResultLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`

const ResultValue = styled.div<{ $error?: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${(props) => (props.$error ? theme.colors.warning : theme.colors.success)};
  font-family: ${theme.typography.fontFamily.mono};
`

const ApplyButton = styled.button<{ $selected: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.base};
  background: ${(props) =>
    props.$selected ? theme.colors.success : theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${(props) =>
      props.$selected ? theme.colors.success + 'dd' : theme.colors.primary.dark};
  }
`

const InfoBox = styled.div`
  background: ${theme.colors.info}10;
  border: 1px solid ${theme.colors.info}30;
  border-left: 4px solid ${theme.colors.info};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
`

const InfoTitle = styled.h5`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const InfoList = styled.ul`
  margin: 0;
  padding-left: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};

  li {
    margin: ${theme.spacing.xs} 0;
  }
`
