import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useSimulation } from '@/contexts/SimulationContext'
import { Vector3 } from '@/types'

interface ReleasePointRecord {
  id: string
  timestamp: number
  point: Vector3
  velocity: number
  pitchType?: string
}

/**
 * 릴리즈 포인트 일관성 분석 패널
 * 여러 투구의 릴리즈 포인트를 기록하고 일관성을 분석
 */
export function ReleasePointPanel() {
  const { params, result } = useSimulation()
  const [records, setRecords] = useState<ReleasePointRecord[]>([])
  const [showRecording, setShowRecording] = useState(false)

  // 현재 투구 기록
  const recordCurrentPitch = () => {
    if (!params) return

    const newRecord: ReleasePointRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      point: params.initial.releasePoint,
      velocity: params.initial.velocity,
      pitchType: undefined // 나중에 구종 추가 가능
    }

    setRecords(prev => [...prev, newRecord])
  }

  // 기록 초기화
  const clearRecords = () => {
    if (confirm('모든 기록을 삭제하시겠습니까?')) {
      setRecords([])
    }
  }

  // 통계 계산
  const calculateStats = () => {
    if (records.length === 0) return null

    // 평균 릴리즈 포인트
    const avgX = records.reduce((sum, r) => sum + r.point.x, 0) / records.length
    const avgY = records.reduce((sum, r) => sum + r.point.y, 0) / records.length
    const avgZ = records.reduce((sum, r) => sum + r.point.z, 0) / records.length

    // 표준편차
    const stdX = Math.sqrt(
      records.reduce((sum, r) => sum + (r.point.x - avgX) ** 2, 0) / records.length
    )
    const stdY = Math.sqrt(
      records.reduce((sum, r) => sum + (r.point.y - avgY) ** 2, 0) / records.length
    )
    const stdZ = Math.sqrt(
      records.reduce((sum, r) => sum + (r.point.z - avgZ) ** 2, 0) / records.length
    )

    // 전체 일관성 점수 (0~100, 표준편차가 작을수록 높음)
    const avgStd = (stdX + stdY + stdZ) / 3
    const consistencyScore = Math.max(0, 100 - avgStd * 200) // 0.5m 표준편차 = 0점

    // 가장 일관성 있는 축과 없는 축
    const stds = [
      { axis: 'X (좌우)', value: stdX },
      { axis: 'Y (높이)', value: stdY },
      { axis: 'Z (전후)', value: stdZ }
    ]
    const bestAxis = stds.reduce((min, curr) => curr.value < min.value ? curr : min)
    const worstAxis = stds.reduce((max, curr) => curr.value > max.value ? curr : max)

    return {
      average: { x: avgX, y: avgY, z: avgZ },
      stdDev: { x: stdX, y: stdY, z: stdZ },
      consistencyScore,
      bestAxis,
      worstAxis
    }
  }

  const stats = calculateStats()

  // 일관성 등급
  const getConsistencyGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', color: theme.colors.success, label: '완벽' }
    if (score >= 80) return { grade: 'A', color: theme.colors.primary.main, label: '우수' }
    if (score >= 70) return { grade: 'B', color: theme.colors.info, label: '양호' }
    if (score >= 60) return { grade: 'C', color: theme.colors.warning, label: '보통' }
    return { grade: 'D', color: theme.colors.error, label: '부족' }
  }

  return (
    <Container>
      <Section>
        <SectionHeader>
          <SectionTitle>릴리즈 포인트 기록</SectionTitle>
          <RecordButton onClick={recordCurrentPitch} disabled={!params}>
            ➕ 현재 투구 기록
          </RecordButton>
        </SectionHeader>

        <RecordInfo>
          총 {records.length}개 투구 기록됨
          {records.length > 0 && (
            <ClearButton onClick={clearRecords}>
              🗑️ 전체 삭제
            </ClearButton>
          )}
        </RecordInfo>

        {records.length > 0 && (
          <RecordList>
            {records.slice().reverse().map((record, index) => (
              <RecordItem key={record.id}>
                <RecordNumber>#{records.length - index}</RecordNumber>
                <RecordData>
                  <DataRow>
                    <DataLabel>위치:</DataLabel>
                    <DataValue>
                      ({record.point.x.toFixed(2)}, {record.point.y.toFixed(2)}, {record.point.z.toFixed(2)}) m
                    </DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel>속도:</DataLabel>
                    <DataValue>{record.velocity.toFixed(1)} m/s</DataValue>
                  </DataRow>
                </RecordData>
                <DeleteButton
                  onClick={() => setRecords(prev => prev.filter(r => r.id !== record.id))}
                >
                  ✕
                </DeleteButton>
              </RecordItem>
            ))}
          </RecordList>
        )}
      </Section>

      {stats && records.length >= 2 ? (
        <>
          <Section>
            <SectionTitle>일관성 분석</SectionTitle>

            <ConsistencyScore>
              <ScoreCircle $color={getConsistencyGrade(stats.consistencyScore).color}>
                <ScoreGrade>{getConsistencyGrade(stats.consistencyScore).grade}</ScoreGrade>
                <ScoreValue>{stats.consistencyScore.toFixed(1)}</ScoreValue>
              </ScoreCircle>
              <ScoreLabel>
                {getConsistencyGrade(stats.consistencyScore).label}
              </ScoreLabel>
            </ConsistencyScore>

            <StatsGrid>
              <StatCard>
                <StatTitle>평균 릴리즈 포인트</StatTitle>
                <StatData>
                  <StatRow>
                    <StatAxis>X (좌우):</StatAxis>
                    <StatValue>{stats.average.x.toFixed(3)} m</StatValue>
                  </StatRow>
                  <StatRow>
                    <StatAxis>Y (높이):</StatAxis>
                    <StatValue>{stats.average.y.toFixed(3)} m</StatValue>
                  </StatRow>
                  <StatRow>
                    <StatAxis>Z (전후):</StatAxis>
                    <StatValue>{stats.average.z.toFixed(3)} m</StatValue>
                  </StatRow>
                </StatData>
              </StatCard>

              <StatCard>
                <StatTitle>표준편차 (일관성)</StatTitle>
                <StatData>
                  <StatRow>
                    <StatAxis>X (좌우):</StatAxis>
                    <StatValue $highlight={stats.bestAxis.axis === 'X (좌우)'}>
                      {(stats.stdDev.x * 100).toFixed(1)} cm
                    </StatValue>
                  </StatRow>
                  <StatRow>
                    <StatAxis>Y (높이):</StatAxis>
                    <StatValue $highlight={stats.bestAxis.axis === 'Y (높이)'}>
                      {(stats.stdDev.y * 100).toFixed(1)} cm
                    </StatValue>
                  </StatRow>
                  <StatRow>
                    <StatAxis>Z (전후):</StatAxis>
                    <StatValue $highlight={stats.bestAxis.axis === 'Z (전후)'}>
                      {(stats.stdDev.z * 100).toFixed(1)} cm
                    </StatValue>
                  </StatRow>
                </StatData>
              </StatCard>
            </StatsGrid>

            <InsightBox>
              <InsightIcon>💡</InsightIcon>
              <InsightContent>
                <InsightRow>
                  <strong>가장 일관적:</strong> {stats.bestAxis.axis}
                  ({(stats.bestAxis.value * 100).toFixed(1)}cm 편차)
                </InsightRow>
                <InsightRow>
                  <strong>개선 필요:</strong> {stats.worstAxis.axis}
                  ({(stats.worstAxis.value * 100).toFixed(1)}cm 편차)
                </InsightRow>
              </InsightContent>
            </InsightBox>
          </Section>

          <Section>
            <SectionTitle>릴리즈 포인트 분포</SectionTitle>
            <VisualizationContainer>
              <AxisView>
                <AxisTitle>측면 (X-Y)</AxisTitle>
                <PlotArea>
                  <AxisLabel $position="bottom">X (좌우)</AxisLabel>
                  <AxisLabel $position="left">Y (높이)</AxisLabel>

                  {/* 평균 지점 */}
                  <PlotPoint
                    $x={normalizeCoord(stats.average.x, -2, 2)}
                    $y={normalizeCoord(stats.average.y, 0, 3)}
                    $isAverage
                  />

                  {/* 개별 지점들 */}
                  {records.map(record => (
                    <PlotPoint
                      key={record.id}
                      $x={normalizeCoord(record.point.x, -2, 2)}
                      $y={normalizeCoord(record.point.y, 0, 3)}
                    />
                  ))}

                  {/* 그리드 */}
                  <GridLines />
                </PlotArea>
              </AxisView>

              <AxisView>
                <AxisTitle>상단 (X-Z)</AxisTitle>
                <PlotArea>
                  <AxisLabel $position="bottom">X (좌우)</AxisLabel>
                  <AxisLabel $position="left">Z (전후)</AxisLabel>

                  <PlotPoint
                    $x={normalizeCoord(stats.average.x, -2, 2)}
                    $y={normalizeCoord(stats.average.z, -2, 2)}
                    $isAverage
                  />

                  {records.map(record => (
                    <PlotPoint
                      key={record.id}
                      $x={normalizeCoord(record.point.x, -2, 2)}
                      $y={normalizeCoord(record.point.z, -2, 2)}
                    />
                  ))}

                  <GridLines />
                </PlotArea>
              </AxisView>
            </VisualizationContainer>
          </Section>
        </>
      ) : (
        <EmptyState>
          <EmptyIcon>📍</EmptyIcon>
          <EmptyText>2개 이상의 투구를 기록하면 일관성 분석이 표시됩니다</EmptyText>
          <EmptyHint>여러 번 시뮬레이션을 실행한 후 "현재 투구 기록" 버튼을 눌러보세요</EmptyHint>
        </EmptyState>
      )}

      <EducationalNote>
        <NoteTitle>릴리즈 포인트의 중요성</NoteTitle>
        <NoteContent>
          <li>
            <strong>일관성:</strong> 프로 투수는 릴리즈 포인트가 매우 일관적입니다.
            일관성이 높을수록 제구력이 좋습니다.
          </li>
          <li>
            <strong>속임수:</strong> 서로 다른 구종을 같은 릴리즈 포인트에서 던지면
            타자가 구종을 파악하기 어렵습니다.
          </li>
          <li>
            <strong>목표:</strong> 표준편차가 5cm 이내면 매우 우수한 수준입니다.
            10cm 이내를 목표로 연습하세요.
          </li>
        </NoteContent>
      </EducationalNote>
    </Container>
  )
}

// 좌표 정규화 함수 (0~1 범위로)
const normalizeCoord = (value: number, min: number, max: number): number => {
  return ((value - min) / (max - min)) * 100
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
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

const RecordButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${theme.colors.primary.dark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const RecordInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`

const ClearButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: transparent;
  color: ${theme.colors.error};
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.error}20;
  }
`

const RecordList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  max-height: 300px;
  overflow-y: auto;
`

const RecordItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${theme.colors.primary.main};
`

const RecordNumber = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.main};
  min-width: 30px;
`

const RecordData = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const DataRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
`

const DataLabel = styled.span`
  color: ${theme.colors.text.tertiary};
  min-width: 40px;
`

const DataValue = styled.span`
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.mono};
`

const DeleteButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: ${theme.colors.error};
  cursor: pointer;
  border-radius: 50%;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.error}20;
  }
`

const ConsistencyScore = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.base};
  padding: ${theme.spacing.base};
`

const ScoreCircle = styled.div<{ $color: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.$color}20;
  border: 4px solid ${props => props.$color};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
`

const ScoreGrade = styled.div`
  font-size: 32px;
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`

const ScoreValue = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.mono};
`

const ScoreLabel = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.base};
`

const StatCard = styled.div`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
`

const StatTitle = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`

const StatData = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StatAxis = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`

const StatValue = styled.div<{ $highlight?: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${props => props.$highlight ? theme.typography.fontWeight.bold : theme.typography.fontWeight.medium};
  color: ${props => props.$highlight ? theme.colors.success : theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.mono};
`

const InsightBox = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.info}10;
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${theme.colors.info};
`

const InsightIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`

const InsightContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`

const InsightRow = styled.div`
  strong {
    color: ${theme.colors.text.primary};
  }
`

const VisualizationContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.base};
`

const AxisView = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const AxisTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  text-align: center;
`

const PlotArea = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: ${theme.colors.background.secondary};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.sm};
`

const AxisLabel = styled.div<{ $position: 'left' | 'bottom' }>`
  position: absolute;
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};

  ${props => props.$position === 'bottom' && `
    bottom: 4px;
    right: 4px;
  `}

  ${props => props.$position === 'left' && `
    top: 4px;
    left: 4px;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  `}
`

const GridLines = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(0deg, ${theme.colors.border.light} 1px, transparent 1px),
    linear-gradient(90deg, ${theme.colors.border.light} 1px, transparent 1px);
  background-size: 20% 20%;
  opacity: 0.3;
  pointer-events: none;
`

const PlotPoint = styled.div<{ $x: number; $y: number; $isAverage?: boolean }>`
  position: absolute;
  left: ${props => props.$x}%;
  bottom: ${props => props.$y}%;
  width: ${props => props.$isAverage ? '12px' : '8px'};
  height: ${props => props.$isAverage ? '12px' : '8px'};
  border-radius: 50%;
  background: ${props => props.$isAverage ? theme.colors.error : theme.colors.primary.main};
  border: 2px solid ${props => props.$isAverage ? theme.colors.error : 'white'};
  transform: translate(-50%, 50%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: ${props => props.$isAverage ? 10 : 5};

  ${props => props.$isAverage && `
    animation: pulse 2s ease-in-out infinite;

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, 50%) scale(1); }
      50% { transform: translate(-50%, 50%) scale(1.2); }
    }
  `}
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
  gap: ${theme.spacing.sm};
`

const EmptyIcon = styled.div`
  font-size: 48px;
`

const EmptyText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
`

const EmptyHint = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
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
