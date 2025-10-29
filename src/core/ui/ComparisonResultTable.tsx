import styled from 'styled-components'
import { SimulationResult } from '@/types'

interface ComparisonResultTableProps {
  resultA: SimulationResult | null
  resultB: SimulationResult | null
  nameA: string
  nameB: string
}

export function ComparisonResultTable({ resultA, resultB, nameA, nameB }: ComparisonResultTableProps) {
  if (!resultA || !resultB) return null

  const rows = [
    {
      label: '스트라이크 판정',
      valueA: resultA.isStrike ? '✅ 스트라이크' : '❌ 볼',
      valueB: resultB.isStrike ? '✅ 스트라이크' : '❌ 볼',
      diff: null
    },
    {
      label: '비행 시간',
      valueA: `${resultA.flightTime.toFixed(3)}초`,
      valueB: `${resultB.flightTime.toFixed(3)}초`,
      diff: `${((resultB.flightTime - resultA.flightTime) * 1000).toFixed(0)}ms`
    },
    {
      label: '최고 높이',
      valueA: `${resultA.maxHeight.toFixed(2)}m`,
      valueB: `${resultB.maxHeight.toFixed(2)}m`,
      diff: `${((resultB.maxHeight - resultA.maxHeight) * 100).toFixed(1)}cm`
    },
    {
      label: '수평 변화',
      valueA: `${(resultA.horizontalBreak * 100).toFixed(1)}cm`,
      valueB: `${(resultB.horizontalBreak * 100).toFixed(1)}cm`,
      diff: `${((resultB.horizontalBreak - resultA.horizontalBreak) * 100).toFixed(1)}cm`
    },
    {
      label: '수직 낙차',
      valueA: `${(resultA.verticalDrop * 100).toFixed(1)}cm`,
      valueB: `${(resultB.verticalDrop * 100).toFixed(1)}cm`,
      diff: `${((resultB.verticalDrop - resultA.verticalDrop) * 100).toFixed(1)}cm`
    },
    {
      label: '통과 높이',
      valueA: `${(resultA.plateHeight * 100).toFixed(1)}cm`,
      valueB: `${(resultB.plateHeight * 100).toFixed(1)}cm`,
      diff: `${((resultB.plateHeight - resultA.plateHeight) * 100).toFixed(1)}cm`
    }
  ]

  return (
    <Container>
      <Title>📊 결과 비교</Title>
      <Table>
        <thead>
          <tr>
            <Th></Th>
            <Th className="blue">{nameA}</Th>
            <Th className="red">{nameB}</Th>
            <Th>차이</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <Td className="label">{row.label}</Td>
              <Td className="blue">{row.valueA}</Td>
              <Td className="red">{row.valueB}</Td>
              <Td className="diff">{row.diff || '-'}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`

const Title = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #4caf50;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
`

const Th = styled.th`
  padding: 10px 8px;
  text-align: left;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &.blue {
    color: #4444ff;
  }

  &.red {
    color: #ff4444;
  }
`

const Td = styled.td`
  padding: 10px 8px;
  color: #ccc;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &.label {
    font-weight: 500;
    color: #fff;
  }

  &.blue {
    color: #6666ff;
  }

  &.red {
    color: #ff6666;
  }

  &.diff {
    color: #ffa726;
    font-weight: 500;
  }

  tr:last-child & {
    border-bottom: none;
  }
`
