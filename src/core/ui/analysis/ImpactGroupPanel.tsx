import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useSimulation } from '@/contexts/SimulationContext'

interface ImpactPoint {
  id: number
  x: number
  y: number
  timestamp: number
}

/**
 * 탄착군 분석 패널
 * 여러 투구의 도착 지점을 기록하고 일관성을 분석
 */
export function ImpactGroupPanel() {
  const { result } = useSimulation()
  const [impactPoints, setImpactPoints] = useState<ImpactPoint[]>([])

  // 시뮬레이션 결과가 있고 플레이트에 도달했을 때 기록
  useEffect(() => {
    if (result && result.reachedPlate && result.finalPosition) {
      const timestamp = Date.now()
      const newPoint: ImpactPoint = {
        id: timestamp, // 고유한 ID로 timestamp 사용
        x: result.finalPosition.x,
        y: result.plateHeight,
        timestamp
      }
      setImpactPoints(prev => [...prev, newPoint])
    }
  }, [result])

  // 기록 초기화
  const clearPoints = () => {
    if (confirm('모든 탄착점을 삭제하시겠습니까?')) {
      setImpactPoints([])
    }
  }

  // 통계 계산
  const calculateStats = () => {
    if (impactPoints.length === 0) return null

    const avgX = impactPoints.reduce((sum, p) => sum + p.x, 0) / impactPoints.length
    const avgY = impactPoints.reduce((sum, p) => sum + p.y, 0) / impactPoints.length

    const stdDevX = Math.sqrt(
      impactPoints.reduce((sum, p) => sum + Math.pow(p.x - avgX, 2), 0) / impactPoints.length
    )
    const stdDevY = Math.sqrt(
      impactPoints.reduce((sum, p) => sum + Math.pow(p.y - avgY, 2), 0) / impactPoints.length
    )

    // 최대 편차
    const maxDeviationX = Math.max(...impactPoints.map(p => Math.abs(p.x - avgX)))
    const maxDeviationY = Math.max(...impactPoints.map(p => Math.abs(p.y - avgY)))

    return {
      count: impactPoints.length,
      avgX,
      avgY,
      stdDevX,
      stdDevY,
      maxDeviationX,
      maxDeviationY,
      groupSize: Math.sqrt(Math.pow(maxDeviationX * 2, 2) + Math.pow(maxDeviationY * 2, 2))
    }
  }

  const stats = calculateStats()

  // 스트라이크 존 좌표를 화면 좌표로 변환
  const toScreenCoords = (x: number, y: number) => {
    // 스트라이크 존: 가로 0.43m (-0.215 ~ 0.215), 세로 약 0.5m
    const zoneWidth = 0.43
    const zoneHeight = 0.6
    const centerX = 150 // SVG 중심 X
    const centerY = 150 // SVG 중심 Y
    const scale = 250 // 스케일 팩터

    return {
      x: centerX + (x / zoneWidth) * scale,
      y: centerY - (y / zoneHeight) * scale
    }
  }

  return (
    <Container>
      {impactPoints.length > 0 ? (
        <>
          <Section>
            <SectionTitle>탄착군 시각화</SectionTitle>
            <VisualizationContainer>
              <StrikeZoneSVG viewBox="0 0 300 300">
                {/* 스트라이크 존 */}
                <rect
                  x="50"
                  y="50"
                  width="200"
                  height="200"
                  fill="none"
                  stroke={theme.colors.border.main}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />

                {/* 중심선 */}
                <line x1="150" y1="50" x2="150" y2="250" stroke={theme.colors.border.light} strokeWidth="1" />
                <line x1="50" y1="150" x2="250" y2="150" stroke={theme.colors.border.light} strokeWidth="1" />

                {/* 탄착점들 */}
                {impactPoints.map((point, index) => {
                  const coords = toScreenCoords(point.x, point.y)
                  return (
                    <g key={point.id}>
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="8"
                        fill={theme.colors.primary.main}
                        opacity="0.7"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={coords.x}
                        y={coords.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {index + 1}
                      </text>
                    </g>
                  )
                })}

                {/* 평균 지점 */}
                {stats && (
                  <g>
                    <circle
                      cx={toScreenCoords(stats.avgX, stats.avgY).x}
                      cy={toScreenCoords(stats.avgX, stats.avgY).y}
                      r="6"
                      fill="none"
                      stroke={theme.colors.success}
                      strokeWidth="3"
                    />
                    <text
                      x={toScreenCoords(stats.avgX, stats.avgY).x}
                      y={toScreenCoords(stats.avgX, stats.avgY).y - 15}
                      textAnchor="middle"
                      fill={theme.colors.success}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      평균
                    </text>
                  </g>
                )}
              </StrikeZoneSVG>
              <Legend>
                <LegendItem>
                  <ColorCircle $color={theme.colors.primary.main} />
                  탄착점 (순서)
                </LegendItem>
                <LegendItem>
                  <ColorCircle $color={theme.colors.success} $outline />
                  평균 지점
                </LegendItem>
              </Legend>
            </VisualizationContainer>
          </Section>

          <Section>
            <SectionTitle>일관성 분석</SectionTitle>
            <StatsGrid>
              <StatCard>
                <StatLabel>총 투구 수</StatLabel>
                <StatValue>{stats!.count}회</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>평균 위치</StatLabel>
                <StatValue>
                  ({(stats!.avgX * 100).toFixed(1)}cm, {(stats!.avgY * 100).toFixed(1)}cm)
                </StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>좌우 표준편차</StatLabel>
                <StatValue $color={stats!.stdDevX < 0.05 ? theme.colors.success : stats!.stdDevX < 0.1 ? theme.colors.warning : theme.colors.error}>
                  ±{(stats!.stdDevX * 100).toFixed(1)}cm
                </StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>상하 표준편차</StatLabel>
                <StatValue $color={stats!.stdDevY < 0.05 ? theme.colors.success : stats!.stdDevY < 0.1 ? theme.colors.warning : theme.colors.error}>
                  ±{(stats!.stdDevY * 100).toFixed(1)}cm
                </StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>최대 좌우 편차</StatLabel>
                <StatValue>{(stats!.maxDeviationX * 100).toFixed(1)}cm</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>최대 상하 편차</StatLabel>
                <StatValue>{(stats!.maxDeviationY * 100).toFixed(1)}cm</StatValue>
              </StatCard>
            </StatsGrid>

            <ConsistencyRating>
              <RatingLabel>일관성 평가:</RatingLabel>
              <RatingValue $rating={getRating(stats!)}>
                {getRatingText(stats!)}
              </RatingValue>
            </ConsistencyRating>
          </Section>

          <Section>
            <SectionTitle>기록 목록</SectionTitle>
            <PointsList>
              {impactPoints.map((point, index) => (
                <PointItem key={point.id}>
                  <PointNumber>{index + 1}</PointNumber>
                  <PointInfo>
                    <PointCoords>
                      X: {(point.x * 100).toFixed(1)}cm, Y: {(point.y * 100).toFixed(1)}cm
                    </PointCoords>
                    <PointTime>
                      {new Date(point.timestamp).toLocaleTimeString('ko-KR')}
                    </PointTime>
                  </PointInfo>
                </PointItem>
              ))}
            </PointsList>
            <ClearButton onClick={clearPoints}>모두 초기화</ClearButton>
          </Section>
        </>
      ) : (
        <EmptyState>
          <EmptyIcon>🎯</EmptyIcon>
          <EmptyText>시뮬레이션을 실행하여 탄착점을 기록하세요</EmptyText>
          <EmptySubText>
            여러 번 투구하여 일관성을 분석할 수 있습니다
          </EmptySubText>
        </EmptyState>
      )}

      <EducationalNote>
        <NoteTitle>탄착군 분석이란?</NoteTitle>
        <NoteContent>
          <li>
            <strong>탄착군 (Group):</strong> 여러 투구의 도착 지점 분포를 나타냅니다.
            작을수록 일관성이 높습니다.
          </li>
          <li>
            <strong>표준편차:</strong> 평균으로부터의 흩어진 정도를 측정합니다.
            ±5cm 이하면 우수, ±10cm 이하면 양호입니다.
          </li>
          <li>
            <strong>활용:</strong> 특정 파라미터 조합의 재현성을 검증하거나,
            제어력을 향상시키는 데 도움이 됩니다.
          </li>
        </NoteContent>
      </EducationalNote>
    </Container>
  )
}

function getRating(stats: { stdDevX: number; stdDevY: number }): 'excellent' | 'good' | 'average' | 'poor' {
  const avgStdDev = (stats.stdDevX + stats.stdDevY) / 2
  if (avgStdDev < 0.05) return 'excellent'
  if (avgStdDev < 0.1) return 'good'
  if (avgStdDev < 0.15) return 'average'
  return 'poor'
}

function getRatingText(stats: { stdDevX: number; stdDevY: number }): string {
  const rating = getRating(stats)
  const ratings = {
    excellent: '⭐ 우수 - 매우 일관된 제어력',
    good: '✅ 양호 - 안정적인 제어력',
    average: '⚠️ 보통 - 개선 여지 있음',
    poor: '❌ 미흡 - 제어력 향상 필요'
  }
  return ratings[rating]
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
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

const VisualizationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  align-items: center;
`

const StrikeZoneSVG = styled.svg`
  width: 100%;
  max-width: 400px;
  height: auto;
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.light};
`

const Legend = styled.div`
  display: flex;
  gap: ${theme.spacing.base};
  justify-content: center;
  flex-wrap: wrap;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`

const ColorCircle = styled.div<{ $color: string; $outline?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$outline ? 'none' : props.$color};
  border: ${props => props.$outline ? `3px solid ${props.$color}` : `2px solid white`};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.base};
`

const StatCard = styled.div`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  text-align: center;
  border: 1px solid ${theme.colors.border.light};
`

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`

const StatValue = styled.div<{ $color?: string }>`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.$color || theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.mono};
`

const ConsistencyRating = styled.div`
  background: ${theme.colors.primary.main}10;
  padding: ${theme.spacing.base};
  border-radius: ${theme.borderRadius.sm};
  border-left: 4px solid ${theme.colors.primary.main};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`

const RatingLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`

const RatingValue = styled.div<{ $rating: string }>`
  flex: 1;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props =>
    props.$rating === 'excellent' ? theme.colors.success :
    props.$rating === 'good' ? theme.colors.primary.main :
    props.$rating === 'average' ? theme.colors.warning :
    theme.colors.error
  };
`

const PointsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  max-height: 300px;
  overflow-y: auto;
`

const PointItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.light};
`

const PointNumber = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.primary.main};
  color: white;
  border-radius: 50%;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.sm};
  flex-shrink: 0;
`

const PointInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`

const PointCoords = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.mono};
`

const PointTime = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`

const ClearButton = styled.button`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.base};
  background: ${theme.colors.error};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${theme.transitions.fast};
  width: 100%;

  &:hover {
    background: ${theme.colors.error}cc;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.tertiary};
  border: 2px dashed ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
`

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.sm};
`

const EmptyText = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  text-align: center;
`

const EmptySubText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-top: ${theme.spacing.xs};
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
