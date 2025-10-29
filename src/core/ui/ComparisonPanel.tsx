import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { supabaseExperimentsService, SupabaseExperiment } from '@/utils/supabaseExperiments'
import { useComparison } from '@/contexts/ComparisonContext'
import { ComparisonResultTable } from './ComparisonResultTable'

/**
 * 비교 모드 패널
 * 2개 실험 선택 및 비교
 */
export function ComparisonPanel() {
  const [experiments, setExperiments] = useState<SupabaseExperiment[]>([])
  const [selectedA, setSelectedA] = useState<SupabaseExperiment | null>(null)
  const [selectedB, setSelectedB] = useState<SupabaseExperiment | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const comparison = useComparison()

  useEffect(() => {
    loadExperiments()
  }, [])

  const loadExperiments = async () => {
    setIsLoading(true)
    try {
      const data = await supabaseExperimentsService.getAll(20)
      setExperiments(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompare = () => {
    if (!selectedA || !selectedB) {
      alert('비교할 실험 2개를 선택하세요.')
      return
    }

    comparison.setExperimentA({
      id: selectedA.id,
      name: selectedA.name,
      params: selectedA.params,
      result: selectedA.result
    })
    comparison.setExperimentB({
      id: selectedB.id,
      name: selectedB.name,
      params: selectedB.params,
      result: selectedB.result
    })
    comparison.startComparison()
  }

  return (
    <Container>
      <Title>🔄 비교 모드</Title>
      <Description>
        저장된 실험 중 2개를 선택하여 궤적과 결과를 비교합니다.
      </Description>

      <SelectionSection>
        <SelectBox>
          <SelectLabel>실험 A (파랑)</SelectLabel>
          <Select
            value={selectedA?.id || ''}
            onChange={(e) => {
              const exp = experiments.find(ex => ex.id === e.target.value)
              setSelectedA(exp || null)
            }}
          >
            <option value="">선택하세요</option>
            {experiments.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.name}
              </option>
            ))}
          </Select>
          {selectedA && (
            <PreviewInfo>
              <InfoRow>
                <InfoLabel>속도:</InfoLabel>
                <InfoValue>{selectedA.params.initial.velocity} m/s</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>회전:</InfoLabel>
                <InfoValue>{selectedA.params.initial.spin.y} rpm</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>결과:</InfoLabel>
                <InfoValue className={selectedA.result.isStrike ? 'strike' : 'ball'}>
                  {selectedA.result.isStrike ? '스트라이크' : '볼'}
                </InfoValue>
              </InfoRow>
            </PreviewInfo>
          )}
        </SelectBox>

        <SelectBox>
          <SelectLabel>실험 B (빨강)</SelectLabel>
          <Select
            value={selectedB?.id || ''}
            onChange={(e) => {
              const exp = experiments.find(ex => ex.id === e.target.value)
              setSelectedB(exp || null)
            }}
          >
            <option value="">선택하세요</option>
            {experiments.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.name}
              </option>
            ))}
          </Select>
          {selectedB && (
            <PreviewInfo>
              <InfoRow>
                <InfoLabel>속도:</InfoLabel>
                <InfoValue>{selectedB.params.initial.velocity} m/s</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>회전:</InfoLabel>
                <InfoValue>{selectedB.params.initial.spin.y} rpm</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>결과:</InfoLabel>
                <InfoValue className={selectedB.result.isStrike ? 'strike' : 'ball'}>
                  {selectedB.result.isStrike ? '스트라이크' : '볼'}
                </InfoValue>
              </InfoRow>
            </PreviewInfo>
          )}
        </SelectBox>
      </SelectionSection>

      <CompareButton
        onClick={handleCompare}
        disabled={!selectedA || !selectedB || isLoading}
      >
        {isLoading ? '로딩 중...' : '비교 시작'}
      </CompareButton>

      {comparison.isComparing && selectedA && selectedB && (
        <>
          <StopButton onClick={() => comparison.stopComparison()}>
            비교 종료
          </StopButton>
          <ComparisonResultTable
            resultA={selectedA.result}
            resultB={selectedB.result}
            nameA={selectedA.name}
            nameB={selectedB.name}
          />
        </>
      )}

      {experiments.length === 0 && !isLoading && (
        <EmptyMessage>
          저장된 실험이 없습니다. 먼저 실험을 저장하세요.
        </EmptyMessage>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #4caf50;
`

const Description = styled.p`
  margin: 0;
  font-size: 13px;
  color: #ccc;
  line-height: 1.5;
`

const SelectionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
`

const SelectBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const SelectLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #fff;
`

const Select = styled.select`
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
`

const PreviewInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
`

const InfoLabel = styled.span`
  color: #999;
`

const InfoValue = styled.span`
  color: #fff;
  font-weight: 500;

  &.strike {
    color: #4caf50;
  }

  &.ball {
    color: #ff9800;
  }
`

const CompareButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: #666;
    cursor: not-allowed;
  }
`

const StopButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;

  &:hover {
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  }
`

const EmptyMessage = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: #999;
  font-size: 13px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
`
