import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useSimulation } from '@/contexts/SimulationContext'
import { analyzeSensitivity, type SensitivityResult } from '@/lib/sensitivityAnalysis'

/**
 * 파라미터 민감도 분석 패널
 * Jacobian Matrix 기반 gradient 표시
 */
export function SensitivityPanel() {
  const { params } = useSimulation()
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeSensitivity> | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<'plateHeight' | 'horizontalBreak' | 'verticalDrop' | 'finalPositionX'>('plateHeight')

  useEffect(() => {
    if (!params) return
    const result = analyzeSensitivity(params)
    setAnalysis(result)
  }, [params])

  if (!analysis) {
    return (
      <Container>
        <LoadingMessage>민감도 분석 중...</LoadingMessage>
      </Container>
    )
  }

  const getSensitivityValue = (sens: SensitivityResult, metric: string) => {
    switch (metric) {
      case 'plateHeight':
        return sens.plateHeightSensitivity
      case 'horizontalBreak':
        return sens.horizontalBreakSensitivity
      case 'verticalDrop':
        return sens.verticalDropSensitivity
      case 'finalPositionX':
        return sens.finalPositionXSensitivity
      default:
        return 0
    }
  }

  const getChangeValue = (sens: SensitivityResult, metric: string) => {
    switch (metric) {
      case 'plateHeight':
        return sens.plateHeightChange
      case 'horizontalBreak':
        return sens.horizontalBreakChange
      case 'verticalDrop':
        return sens.verticalDropChange
      case 'finalPositionX':
        return sens.finalPositionXChange
      default:
        return 0
    }
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'plateHeight':
        return '홈플레이트 높이'
      case 'horizontalBreak':
        return '수평 변화량'
      case 'verticalDrop':
        return '수직 낙차'
      case 'finalPositionX':
        return '최종 X 위치'
      default:
        return metric
    }
  }

  const sortedSensitivities = [...analysis.sensitivities].sort((a, b) => {
    const aValue = Math.abs(getSensitivityValue(a, selectedMetric))
    const bValue = Math.abs(getSensitivityValue(b, selectedMetric))
    return bValue - aValue
  })

  return (
    <Container>
      <Header>
        <Title>파라미터 민감도 분석</Title>
        <Subtitle>각 파라미터 변화가 결과에 미치는 영향</Subtitle>
      </Header>

      <MetricSelector>
        <MetricLabel>분석 지표:</MetricLabel>
        <MetricButtons>
          <MetricButton
            $active={selectedMetric === 'plateHeight'}
            onClick={() => setSelectedMetric('plateHeight')}
          >
            높이
          </MetricButton>
          <MetricButton
            $active={selectedMetric === 'horizontalBreak'}
            onClick={() => setSelectedMetric('horizontalBreak')}
          >
            수평 변화
          </MetricButton>
          <MetricButton
            $active={selectedMetric === 'verticalDrop'}
            onClick={() => setSelectedMetric('verticalDrop')}
          >
            수직 낙차
          </MetricButton>
          <MetricButton
            $active={selectedMetric === 'finalPositionX'}
            onClick={() => setSelectedMetric('finalPositionX')}
          >
            X 위치
          </MetricButton>
        </MetricButtons>
      </MetricSelector>

      <InfoBox>
        <InfoIcon>💡</InfoIcon>
        <InfoText>
          <strong>민감도 해석:</strong> 파라미터를 1단위 변경했을 때 {getMetricLabel(selectedMetric)}이(가) 얼마나 변화하는지를 나타냅니다.
          절대값이 클수록 영향이 큽니다.
        </InfoText>
      </InfoBox>

      <SensitivityList>
        {sortedSensitivities.map((sens) => {
          const sensitivity = getSensitivityValue(sens, selectedMetric)
          const change = getChangeValue(sens, selectedMetric)
          const maxSensitivity = Math.max(...sortedSensitivities.map(s =>
            Math.abs(getSensitivityValue(s, selectedMetric))
          ))
          const barWidth = Math.abs(sensitivity) / maxSensitivity * 100

          return (
            <SensitivityItem key={sens.parameter}>
              <ParamInfo>
                <ParamName>{sens.displayName}</ParamName>
                <ParamValue>
                  현재: {sens.currentValue.toFixed(2)} {sens.unit}
                </ParamValue>
              </ParamInfo>

              <SensitivityBar>
                <BarBackground>
                  <BarFill
                    $width={barWidth}
                    $positive={sensitivity >= 0}
                  />
                </BarBackground>
                <BarLabel>
                  <SensitivityValue $positive={sensitivity >= 0}>
                    {sensitivity >= 0 ? '+' : ''}{sensitivity.toFixed(4)} m/{sens.unit}
                  </SensitivityValue>
                </BarLabel>
              </SensitivityBar>

              <ImpactDescription>
                {sens.displayName}를 <strong>{sens.delta.toFixed(3)} {sens.unit}</strong> 증가시키면
                {' '}{getMetricLabel(selectedMetric)}이(가){' '}
                <ImpactValue $positive={change >= 0}>
                  {change >= 0 ? '+' : ''}{(change * 100).toFixed(1)}cm
                </ImpactValue>{' '}변화
              </ImpactDescription>
            </SensitivityItem>
          )
        })}
      </SensitivityList>

      <SummaryCard>
        <SummaryTitle>요약</SummaryTitle>
        <SummaryGrid>
          <SummaryItem>
            <SummaryLabel>가장 민감한 파라미터</SummaryLabel>
            <SummaryValue>
              {analysis.mostSensitiveParam.displayName}
            </SummaryValue>
            <SummaryDetail>
              종합 민감도: {(analysis.mostSensitiveParam.totalSensitivity * 100).toFixed(1)}%
            </SummaryDetail>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>가장 둔감한 파라미터</SummaryLabel>
            <SummaryValue>
              {analysis.leastSensitiveParam.displayName}
            </SummaryValue>
            <SummaryDetail>
              종합 민감도: {(analysis.leastSensitiveParam.totalSensitivity * 100).toFixed(1)}%
            </SummaryDetail>
          </SummaryItem>
        </SummaryGrid>
      </SummaryCard>
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

const MetricSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
`

const MetricLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`

const MetricButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`

const MetricButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.base};
  background: ${(props) =>
    props.$active ? theme.colors.primary.main : theme.colors.background.secondary};
  color: ${(props) => (props.$active ? 'white' : theme.colors.text.secondary)};
  border: 1px solid
    ${(props) => (props.$active ? theme.colors.primary.main : theme.colors.border.main)};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${(props) =>
      props.$active ? theme.colors.primary.dark : theme.colors.background.elevated};
    border-color: ${theme.colors.primary.main};
  }
`

const InfoBox = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.info}10;
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${theme.colors.info};
`

const InfoIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`

const InfoText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};

  strong {
    color: ${theme.colors.text.primary};
  }
`

const SensitivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
`

const SensitivityItem = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const ParamInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ParamName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const ParamValue = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  font-family: ${theme.typography.fontFamily.mono};
`

const SensitivityBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const BarBackground = styled.div`
  width: 100%;
  height: 24px;
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
  position: relative;
`

const BarFill = styled.div<{ $width: number; $positive: boolean }>`
  width: ${(props) => props.$width}%;
  height: 100%;
  background: ${(props) =>
    props.$positive
      ? `linear-gradient(90deg, ${theme.colors.success}80, ${theme.colors.success})`
      : `linear-gradient(90deg, ${theme.colors.error}80, ${theme.colors.error})`};
  transition: width 0.5s ease;
`

const BarLabel = styled.div`
  display: flex;
  justify-content: center;
`

const SensitivityValue = styled.div<{ $positive: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${(props) => (props.$positive ? theme.colors.success : theme.colors.error)};
  font-family: ${theme.typography.fontFamily.mono};
`

const ImpactDescription = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};

  strong {
    color: ${theme.colors.text.primary};
  }
`

const ImpactValue = styled.span<{ $positive: boolean }>`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${(props) => (props.$positive ? theme.colors.success : theme.colors.error)};
  font-family: ${theme.typography.fontFamily.mono};
`

const SummaryCard = styled.div`
  background: ${theme.colors.primary.main}10;
  border: 1px solid ${theme.colors.primary.main}30;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
`

const SummaryTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.base};
`

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const SummaryLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`

const SummaryValue = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary.main};
`

const SummaryDetail = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamily.mono};
`

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`
