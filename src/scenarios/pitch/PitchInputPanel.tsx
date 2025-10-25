import { useState } from 'react'
import styled from 'styled-components'
import { useSimulation } from '@/contexts/SimulationContext'
import { PitchType } from '@/types'
import { PITCH_NAMES, PITCH_DESCRIPTIONS } from './presets'

/**
 * 투구 파라미터 입력 패널 (v2: 단일 모드)
 */
export function PitchInputPanel() {
  const { setPreset, runSimulation, isSimulating } = useSimulation()
  const [pitchType, setPitchType] = useState<PitchType>('fastball')

  const handlePresetChange = (type: PitchType) => {
    setPitchType(type)
    setPreset(type)
  }

  return (
    <Panel>
      <Header>
        <Title>투구 설정</Title>
      </Header>

      <InputSection>
        <InputGroup>
          <InputLabel>구종 선택</InputLabel>
          <PresetGrid>
            {(Object.keys(PITCH_NAMES) as PitchType[]).map(type => (
              <PresetButton
                key={type}
                active={pitchType === type}
                onClick={() => handlePresetChange(type)}
              >
                {PITCH_NAMES[type]}
              </PresetButton>
            ))}
          </PresetGrid>
          <Description>{PITCH_DESCRIPTIONS[pitchType]}</Description>
        </InputGroup>

        <InfoText>
          구종을 선택하면 해당 구종의 물리 파라미터(속도, 회전, 각도)가 자동으로 설정됩니다.
        </InfoText>
      </InputSection>

      <SimulateButton onClick={runSimulation} disabled={isSimulating}>
        {isSimulating ? '시뮬레이션 중...' : '⚾ 시뮬레이션 시작'}
      </SimulateButton>
    </Panel>
  )
}

// v2: SimpleModeInputs, AdvancedModeInputs 제거 (단일 모드 통합)

const Panel = styled.div`
  background: #2a2a3e;
  border-radius: 8px;
  padding: 20px;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`

// v2: ModeToggle, ModeButton 제거 (단일 모드)

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #ccc;
`

// v2: Slider, SliderContainer, SliderValue, Select 제거 (단순 모드 UI 제거)

const Description = styled.p`
  margin: 0;
  font-size: 12px;
  color: #888;
  font-style: italic;
`

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`

const PresetButton = styled.button<{ active: boolean }>`
  padding: 12px;
  border: 2px solid ${props => props.active ? '#4caf50' : '#444'};
  border-radius: 6px;
  background: ${props => props.active ? '#2d5016' : '#1a1a2e'};
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4caf50;
    background: ${props => props.active ? '#356320' : '#252538'};
  }
`

const InfoText = styled.p`
  margin: 0;
  padding: 12px;
  background: #1a1a2e;
  border-radius: 4px;
  font-size: 12px;
  color: #888;
  line-height: 1.5;
`

const SimulateButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
