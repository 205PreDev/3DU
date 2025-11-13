import styled from 'styled-components'
import { SimulationResult, Vector3 } from '@/types'
import { theme } from '@/styles/theme'
import { IoEyeOutline } from 'react-icons/io5'

interface ResultPanelProps {
  result: SimulationResult | null
  showForceVectors?: boolean
  onToggleForceVectors?: (show: boolean) => void
  currentForces?: {
    gravity: Vector3
    drag: Vector3
    magnus: Vector3
  } | null
}

/**
 * 시뮬레이션 결과 표시 패널
 */
export function ResultPanel({ result, showForceVectors = false, onToggleForceVectors, currentForces }: ResultPanelProps) {
  if (!result) {
    return (
      <Panel>
        <Title>시뮬레이션 결과</Title>
        <EmptyMessage>시뮬레이션을 실행하면 결과가 여기에 표시됩니다.</EmptyMessage>
      </Panel>
    )
  }

  const initialSpeedKmh = (result.initialSpeed * 3.6).toFixed(1)
  const finalSpeedMs = Math.sqrt(
    result.finalVelocity.x ** 2 +
    result.finalVelocity.y ** 2 +
    result.finalVelocity.z ** 2
  ).toFixed(2)

  return (
    <Panel>
      <Title>시뮬레이션 결과</Title>

      <ResultGrid>
        <ResultItem>
          <Label>초기 속도</Label>
          <Value>{initialSpeedKmh} km/h</Value>
        </ResultItem>

        <ResultItem>
          <Label>회전수</Label>
          <Value>{result.spinRate.toFixed(0)} rpm</Value>
        </ResultItem>

        <ResultItem>
          <Label>비행 시간</Label>
          <Value>{result.flightTime.toFixed(3)} s</Value>
        </ResultItem>

        <ResultItem>
          <Label>수평 이동 거리</Label>
          <Value>{result.horizontalDistance.toFixed(2)} m</Value>
        </ResultItem>

        <ResultItem>
          <Label>최고 높이</Label>
          <Value>{result.maxHeight.toFixed(2)} m</Value>
        </ResultItem>

        <ResultItem>
          <Label>종단 속도</Label>
          <Value>{finalSpeedMs} m/s</Value>
        </ResultItem>

        <ResultItem>
          <Label>도달 높이</Label>
          <Value>{result.plateHeight.toFixed(2)} m</Value>
        </ResultItem>

        <ResultItem>
          <Label>수평 변위 (←/→)</Label>
          <Value>
            {result.horizontalBreak > 0 ? '→ ' : '← '}
            {Math.abs(result.horizontalBreak).toFixed(2)} m
          </Value>
        </ResultItem>

        <ResultItem>
          <Label>수직 낙차 (↓)</Label>
          <Value>{result.verticalDrop.toFixed(2)} m</Value>
        </ResultItem>
      </ResultGrid>

      {/* 힘 벡터 시각화 토글 */}
      {onToggleForceVectors && (
        <ForceVectorToggle>
          <ToggleLabel>
            <IoEyeOutline size={18} />
            힘 벡터 표시
          </ToggleLabel>
          <ToggleCheckbox
            type="checkbox"
            checked={showForceVectors}
            onChange={(e) => onToggleForceVectors(e.target.checked)}
          />
          <ForceVectorLegend show={showForceVectors}>
            <LegendItem>
              <LegendColor color="#ff0000" /> 중력
            </LegendItem>
            <LegendItem>
              <LegendColor color="#0066ff" /> 항력
            </LegendItem>
            <LegendItem>
              <LegendColor color="#00ff00" /> 마그누스
            </LegendItem>
          </ForceVectorLegend>

          {/* 힘 벡터 수치 표 */}
          {showForceVectors && currentForces && (
            <ForceVectorTable>
              <TableTitle>현재 시점 힘 벡터 (N)</TableTitle>
              <Table>
                <thead>
                  <tr>
                    <Th>힘</Th>
                    <Th>X축</Th>
                    <Th>Y축</Th>
                    <Th>Z축</Th>
                    <Th>크기</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <TdLabel>
                      <LegendColor color="#ff0000" /> 중력
                    </TdLabel>
                    <TdValue>{currentForces.gravity.x.toFixed(3)}</TdValue>
                    <TdValue>{currentForces.gravity.y.toFixed(3)}</TdValue>
                    <TdValue>{currentForces.gravity.z.toFixed(3)}</TdValue>
                    <TdValue bold>
                      {Math.sqrt(
                        currentForces.gravity.x ** 2 +
                        currentForces.gravity.y ** 2 +
                        currentForces.gravity.z ** 2
                      ).toFixed(3)}
                    </TdValue>
                  </tr>
                  <tr>
                    <TdLabel>
                      <LegendColor color="#0066ff" /> 항력
                    </TdLabel>
                    <TdValue>{currentForces.drag.x.toFixed(3)}</TdValue>
                    <TdValue>{currentForces.drag.y.toFixed(3)}</TdValue>
                    <TdValue>{currentForces.drag.z.toFixed(3)}</TdValue>
                    <TdValue bold>
                      {Math.sqrt(
                        currentForces.drag.x ** 2 +
                        currentForces.drag.y ** 2 +
                        currentForces.drag.z ** 2
                      ).toFixed(3)}
                    </TdValue>
                  </tr>
                  <tr>
                    <TdLabel>
                      <LegendColor color="#00ff00" /> 마그누스
                    </TdLabel>
                    <TdValue>{currentForces.magnus.x.toFixed(3)}</TdValue>
                    <TdValue>{currentForces.magnus.y.toFixed(3)}</TdValue>
                    <TdValue>{currentForces.magnus.z.toFixed(3)}</TdValue>
                    <TdValue bold>
                      {Math.sqrt(
                        currentForces.magnus.x ** 2 +
                        currentForces.magnus.y ** 2 +
                        currentForces.magnus.z ** 2
                      ).toFixed(3)}
                    </TdValue>
                  </tr>
                </tbody>
              </Table>
            </ForceVectorTable>
          )}
        </ForceVectorToggle>
      )}
    </Panel>
  )
}

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
  min-height: 0; /* Flexbox 스크롤 허용 */
`

const Title = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border.light};
`

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.text.tertiary};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  line-height: ${theme.typography.lineHeight.relaxed};

  &::before {
    content: '📊';
    font-size: 48px;
    margin-bottom: ${theme.spacing.base};
    opacity: 0.5;
  }
`

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.base};

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const ResultItem = styled.div`
  background: ${theme.colors.background.tertiary};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
  transition: ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.border.main};
    background: ${theme.colors.background.elevated};
  }
`

const Label = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${theme.typography.fontWeight.medium};
`

const Value = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.mono};
`

const ForceVectorToggle = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.base};
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
  margin-top: ${theme.spacing.sm};
`

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  user-select: none;
`

const ToggleCheckbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${theme.colors.primary};
`

const ForceVectorLegend = styled.div<{ show: boolean }>`
  display: ${props => props.show ? 'flex' : 'none'};
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${theme.colors.primary};
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  background: ${props => props.color};
  border-radius: 50%;
  flex-shrink: 0;
`

const ForceVectorTable = styled.div`
  margin-top: ${theme.spacing.sm};
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.sm};
  border-left: 3px solid ${theme.colors.primary};
`

const TableTitle = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${theme.typography.fontSize.xs};
  font-family: ${theme.typography.fontFamily.mono};
`

const Th = styled.th`
  text-align: left;
  padding: ${theme.spacing.xs};
  color: ${theme.colors.text.tertiary};
  font-weight: ${theme.typography.fontWeight.medium};
  border-bottom: 1px solid ${theme.colors.border.light};
  font-size: ${theme.typography.fontSize.xs};
`

const TdLabel = styled.td`
  padding: ${theme.spacing.xs};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`

const TdValue = styled.td<{ bold?: boolean }>`
  padding: ${theme.spacing.xs};
  text-align: right;
  color: ${theme.colors.text.primary};
  font-weight: ${props => props.bold ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.regular};
`
