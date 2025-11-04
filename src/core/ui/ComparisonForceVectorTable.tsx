import { useMemo } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { SupabaseExperiment } from '@/utils/supabaseExperiments'
import { Vector3 } from '@/types'

interface ComparisonForceVectorTableProps {
  experimentA: SupabaseExperiment
  experimentB: SupabaseExperiment
  replayTime: number
  onTimeChange: (time: number) => void
}

/**
 * 비교 모드 힘 벡터 표
 * 두 실험의 힘 벡터를 나란히 비교
 */
export function ComparisonForceVectorTable({
  experimentA,
  experimentB,
  replayTime,
  onTimeChange
}: ComparisonForceVectorTableProps) {
  // 현재 시점의 궤적 포인트 가져오기
  const currentPointA = useMemo(() => {
    const index = Math.min(
      Math.floor(replayTime * 30),
      experimentA.result.trajectory.length - 1
    )
    return experimentA.result.trajectory[index]
  }, [experimentA, replayTime])

  const currentPointB = useMemo(() => {
    const index = Math.min(
      Math.floor(replayTime * 30),
      experimentB.result.trajectory.length - 1
    )
    return experimentB.result.trajectory[index]
  }, [experimentB, replayTime])

  // 최대 시간 계산
  const maxTime = Math.max(
    experimentA.result.trajectory.length / 30,
    experimentB.result.trajectory.length / 30
  )

  // 힘 벡터 크기 계산
  const getMagnitude = (v: Vector3) => Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2)

  // 차이값 계산
  const getDiff = (a: number, b: number) => a - b

  if (!currentPointA?.forces || !currentPointB?.forces) {
    return (
      <Container>
        <Title>힘 벡터 비교</Title>
        <EmptyMessage>힘 벡터 데이터가 없습니다.</EmptyMessage>
      </Container>
    )
  }

  const forcesA = currentPointA.forces
  const forcesB = currentPointB.forces

  return (
    <Container>
      <Header>
        <Title>힘 벡터 비교 (N)</Title>
        <TimeDisplay>시간: {replayTime.toFixed(2)}초</TimeDisplay>
      </Header>

      {/* 타임라인 슬라이더 */}
      <TimelineSlider
        type="range"
        min={0}
        max={maxTime}
        step={0.01}
        value={replayTime}
        onChange={(e) => onTimeChange(parseFloat(e.target.value))}
      />

      {/* 중력 */}
      <ForceSection>
        <ForceName>
          <LegendColor color="#ff0000" /> 중력
        </ForceName>
        <Table>
          <thead>
            <tr>
              <Th>실험</Th>
              <Th>X축</Th>
              <Th>Y축</Th>
              <Th>Z축</Th>
              <Th>크기</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <TdLabel color="#4444ff">{experimentA.name}</TdLabel>
              <Td>{forcesA.gravity.x.toFixed(3)}</Td>
              <Td>{forcesA.gravity.y.toFixed(3)}</Td>
              <Td>{forcesA.gravity.z.toFixed(3)}</Td>
              <Td bold>{getMagnitude(forcesA.gravity).toFixed(3)}</Td>
            </tr>
            <tr>
              <TdLabel color="#ff4444">{experimentB.name}</TdLabel>
              <Td>{forcesB.gravity.x.toFixed(3)}</Td>
              <Td>{forcesB.gravity.y.toFixed(3)}</Td>
              <Td>{forcesB.gravity.z.toFixed(3)}</Td>
              <Td bold>{getMagnitude(forcesB.gravity).toFixed(3)}</Td>
            </tr>
            <tr>
              <TdDiff>차이 (A-B)</TdDiff>
              <TdDiff>{getDiff(forcesA.gravity.x, forcesB.gravity.x).toFixed(3)}</TdDiff>
              <TdDiff>{getDiff(forcesA.gravity.y, forcesB.gravity.y).toFixed(3)}</TdDiff>
              <TdDiff>{getDiff(forcesA.gravity.z, forcesB.gravity.z).toFixed(3)}</TdDiff>
              <TdDiff bold>
                {getDiff(getMagnitude(forcesA.gravity), getMagnitude(forcesB.gravity)).toFixed(3)}
              </TdDiff>
            </tr>
          </tbody>
        </Table>
      </ForceSection>

      {/* 항력 */}
      <ForceSection>
        <ForceName>
          <LegendColor color="#0066ff" /> 항력
        </ForceName>
        <Table>
          <tbody>
            <tr>
              <TdLabel color="#4444ff">{experimentA.name}</TdLabel>
              <Td>{forcesA.drag.x.toFixed(3)}</Td>
              <Td>{forcesA.drag.y.toFixed(3)}</Td>
              <Td>{forcesA.drag.z.toFixed(3)}</Td>
              <Td bold>{getMagnitude(forcesA.drag).toFixed(3)}</Td>
            </tr>
            <tr>
              <TdLabel color="#ff4444">{experimentB.name}</TdLabel>
              <Td>{forcesB.drag.x.toFixed(3)}</Td>
              <Td>{forcesB.drag.y.toFixed(3)}</Td>
              <Td>{forcesB.drag.z.toFixed(3)}</Td>
              <Td bold>{getMagnitude(forcesB.drag).toFixed(3)}</Td>
            </tr>
            <tr>
              <TdDiff>차이 (A-B)</TdDiff>
              <TdDiff>{getDiff(forcesA.drag.x, forcesB.drag.x).toFixed(3)}</TdDiff>
              <TdDiff>{getDiff(forcesA.drag.y, forcesB.drag.y).toFixed(3)}</TdDiff>
              <TdDiff>{getDiff(forcesA.drag.z, forcesB.drag.z).toFixed(3)}</TdDiff>
              <TdDiff bold>
                {getDiff(getMagnitude(forcesA.drag), getMagnitude(forcesB.drag)).toFixed(3)}
              </TdDiff>
            </tr>
          </tbody>
        </Table>
      </ForceSection>

      {/* 마그누스 */}
      <ForceSection>
        <ForceName>
          <LegendColor color="#00ff00" /> 마그누스
        </ForceName>
        <Table>
          <tbody>
            <tr>
              <TdLabel color="#4444ff">{experimentA.name}</TdLabel>
              <Td>{forcesA.magnus.x.toFixed(3)}</Td>
              <Td>{forcesA.magnus.y.toFixed(3)}</Td>
              <Td>{forcesA.magnus.z.toFixed(3)}</Td>
              <Td bold>{getMagnitude(forcesA.magnus).toFixed(3)}</Td>
            </tr>
            <tr>
              <TdLabel color="#ff4444">{experimentB.name}</TdLabel>
              <Td>{forcesB.magnus.x.toFixed(3)}</Td>
              <Td>{forcesB.magnus.y.toFixed(3)}</Td>
              <Td>{forcesB.magnus.z.toFixed(3)}</Td>
              <Td bold>{getMagnitude(forcesB.magnus).toFixed(3)}</Td>
            </tr>
            <tr>
              <TdDiff>차이 (A-B)</TdDiff>
              <TdDiff>{getDiff(forcesA.magnus.x, forcesB.magnus.x).toFixed(3)}</TdDiff>
              <TdDiff>{getDiff(forcesA.magnus.y, forcesB.magnus.y).toFixed(3)}</TdDiff>
              <TdDiff>{getDiff(forcesA.magnus.z, forcesB.magnus.z).toFixed(3)}</TdDiff>
              <TdDiff bold>
                {getDiff(getMagnitude(forcesA.magnus), getMagnitude(forcesB.magnus)).toFixed(3)}
              </TdDiff>
            </tr>
          </tbody>
        </Table>
      </ForceSection>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
  padding: ${theme.spacing.base};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
  margin-top: ${theme.spacing.base};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.h4`
  margin: 0;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const TimeDisplay = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
  font-family: ${theme.typography.fontFamily.mono};
`

const TimelineSlider = styled.input`
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, ${theme.colors.background.secondary}, ${theme.colors.primary});
  border-radius: 3px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 8px ${theme.colors.primary}80;
    transition: transform ${theme.transitions.fast};

    &:hover {
      transform: scale(1.15);
    }
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: ${theme.colors.primary};
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 8px ${theme.colors.primary}80;
    transition: transform ${theme.transitions.fast};

    &:hover {
      transform: scale(1.15);
    }
  }
`

const ForceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const ForceName = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
`

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  background: ${props => props.color};
  border-radius: 50%;
  flex-shrink: 0;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${theme.typography.fontSize.xs};
  font-family: ${theme.typography.fontFamily.mono};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
`

const Th = styled.th`
  text-align: left;
  padding: ${theme.spacing.xs};
  color: ${theme.colors.text.tertiary};
  font-weight: ${theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${theme.colors.border.light};
  font-size: ${theme.typography.fontSize.xs};
`

const Td = styled.td<{ bold?: boolean }>`
  padding: ${theme.spacing.xs};
  text-align: right;
  color: ${theme.colors.text.primary};
  font-weight: ${props => props.bold ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.regular};
`

const TdLabel = styled.td<{ color?: string }>`
  padding: ${theme.spacing.xs};
  color: ${props => props.color || theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: left;
`

const TdDiff = styled.td<{ bold?: boolean }>`
  padding: ${theme.spacing.xs};
  text-align: right;
  color: ${theme.colors.warning};
  font-weight: ${props => props.bold ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.regular};
  background: rgba(255, 152, 0, 0.1);
`

const EmptyMessage = styled.div`
  padding: ${theme.spacing.lg};
  text-align: center;
  color: ${theme.colors.text.tertiary};
  font-size: ${theme.typography.fontSize.sm};
`
