import styled from 'styled-components'
import { motion } from 'framer-motion'
import { theme } from '@/styles/theme'

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

interface SimpleBarChartProps {
  data: ChartDataPoint[]
  title?: string
  maxValue?: number
  height?: number
}

/**
 * 간단한 막대 차트 컴포넌트
 * 챌린지별 성공률 등을 시각화
 */
export function SimpleBarChart({ data, title, maxValue, height = 200 }: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value))

  return (
    <Container>
      {title && <Title>{title}</Title>}
      <ChartContainer $height={height}>
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100

          return (
            <BarGroup key={item.label}>
              <Bar
                as={motion.div}
                initial={{ height: 0 }}
                animate={{ height: `${percentage}%` }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                $color={item.color || theme.colors.primary.main}
              >
                <BarValue>{item.value.toFixed(1)}%</BarValue>
              </Bar>
              <BarLabel>{item.label}</BarLabel>
            </BarGroup>
          )
        })}
      </ChartContainer>
    </Container>
  )
}

interface SimpleLineChartProps {
  data: ChartDataPoint[]
  title?: string
  color?: string
  height?: number
}

/**
 * 간단한 라인 차트 컴포넌트
 * 시간에 따른 성공률 추이 등을 시각화
 */
export function SimpleLineChart({ data, title, color, height = 150 }: SimpleLineChartProps) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.value - minValue) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <Container>
      {title && <Title>{title}</Title>}
      <LineChartContainer $height={height}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.polyline
            fill="none"
            stroke={color || theme.colors.primary.main}
            strokeWidth="2"
            points={points}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            vectorEffect="non-scaling-stroke"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((item.value - minValue) / range) * 100
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill={color || theme.colors.primary.main}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>
        <LabelsContainer>
          {data.map((item, index) => (
            <Label key={index}>{item.label}</Label>
          ))}
        </LabelsContainer>
      </LineChartContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const Title = styled.h4`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const ChartContainer = styled.div<{ $height: number }>`
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: ${theme.spacing.xs};
  height: ${({ $height }) => $height}px;
  padding: ${theme.spacing.base} ${theme.spacing.sm};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
`

const BarGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex: 1;
  max-width: 80px;
`

const Bar = styled.div<{ $color: string }>`
  width: 100%;
  background: ${({ $color }) => $color};
  border-radius: ${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: ${theme.spacing.xs};
  position: relative;
  min-height: 20px;
`

const BarValue = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`

const BarLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  text-align: center;
  word-break: break-word;
`

const LineChartContainer = styled.div<{ $height: number }>`
  display: flex;
  flex-direction: column;
  height: ${({ $height }) => $height}px;
  padding: ${theme.spacing.base};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
`

const LabelsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${theme.spacing.xs};
`

const Label = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`
