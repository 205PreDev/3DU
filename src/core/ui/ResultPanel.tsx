import styled from 'styled-components'
import { SimulationResult } from '@/types'

interface ResultPanelProps {
  result: SimulationResult | null
}

/**
 * 시뮬레이션 결과 표시 패널
 */
export function ResultPanel({ result }: ResultPanelProps) {
  if (!result) {
    return (
      <Panel>
        <Title>시뮬레이션 결과</Title>
        <EmptyMessage>시뮬레이션을 실행하면 결과가 여기에 표시됩니다.</EmptyMessage>
      </Panel>
    )
  }

  const speedKmh = (Math.sqrt(
    result.finalVelocity.x ** 2 +
    result.finalVelocity.y ** 2 +
    result.finalVelocity.z ** 2
  ) * 3.6).toFixed(1)

  return (
    <Panel>
      <Title>시뮬레이션 결과</Title>

      <ResultGrid>
        <ResultItem>
          <Label>비행 시간</Label>
          <Value>{result.flightTime.toFixed(3)}초</Value>
        </ResultItem>

        <ResultItem>
          <Label>최고 높이</Label>
          <Value>{result.maxHeight.toFixed(2)}m</Value>
        </ResultItem>

        <ResultItem>
          <Label>홈플레이트 도달 높이</Label>
          <Value>{result.plateHeight.toFixed(2)}m</Value>
        </ResultItem>

        <ResultItem>
          <Label>최종 속도</Label>
          <Value>{speedKmh} km/h</Value>
        </ResultItem>

        <ResultItem>
          <Label>수평 이동 (←/→)</Label>
          <Value>
            {result.horizontalBreak > 0 ? '→ ' : '← '}
            {Math.abs(result.horizontalBreak).toFixed(2)}m
          </Value>
        </ResultItem>

        <ResultItem>
          <Label>수직 낙차 (↓)</Label>
          <Value>{result.verticalDrop.toFixed(2)}m</Value>
        </ResultItem>
      </ResultGrid>

      <JudgmentSection strike={result.isStrike}>
        <JudgmentLabel>판정</JudgmentLabel>
        <JudgmentValue>{result.isStrike ? '⚾ 스트라이크' : '🚫 볼'}</JudgmentValue>
      </JudgmentSection>
    </Panel>
  )
}

const Panel = styled.div`
  background: #2a2a3e;
  border-radius: 8px;
  padding: 20px;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`

const Title = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
`

const EmptyMessage = styled.p`
  color: #888;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
`

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`

const ResultItem = styled.div`
  background: #1a1a2e;
  padding: 12px;
  border-radius: 6px;
`

const Label = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
`

const Value = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`

const JudgmentSection = styled.div<{ strike: boolean }>`
  background: ${props => props.strike ? '#2d5016' : '#5e1616'};
  padding: 16px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid ${props => props.strike ? '#4caf50' : '#f44336'};
`

const JudgmentLabel = styled.div`
  font-size: 14px;
  color: #ccc;
`

const JudgmentValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
`
