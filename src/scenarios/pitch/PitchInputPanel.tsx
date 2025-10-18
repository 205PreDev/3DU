import { useState } from 'react'
import styled from 'styled-components'
import { useSimulation } from '@/contexts/SimulationContext'
import { PitchType } from '@/types'
import { PITCH_NAMES, PITCH_DESCRIPTIONS } from './presets'

/**
 * 투구 파라미터 입력 패널
 */
export function PitchInputPanel() {
  const { uiMode, setUIMode, setPreset, setSimpleModeInputs, runSimulation, isSimulating } = useSimulation()

  // 단순 모드 상태
  const [throwPower, setThrowPower] = useState(5)
  const [pitchType, setPitchType] = useState<PitchType>('fastball')

  const handleSimulate = () => {
    if (uiMode === 'simple') {
      setSimpleModeInputs({
        throwPower,
        pitchType,
        targetZone: 'center'
      })
    }
    runSimulation()
  }

  return (
    <Panel>
      <Header>
        <Title>투구 설정</Title>
        <ModeToggle>
          <ModeButton
            active={uiMode === 'simple'}
            onClick={() => setUIMode('simple')}
          >
            단순 모드
          </ModeButton>
          <ModeButton
            active={uiMode === 'advanced'}
            onClick={() => setUIMode('advanced')}
          >
            전문가 모드
          </ModeButton>
        </ModeToggle>
      </Header>

      {uiMode === 'simple' ? (
        <SimpleModeInputs
          throwPower={throwPower}
          setThrowPower={setThrowPower}
          pitchType={pitchType}
          setPitchType={setPitchType}
        />
      ) : (
        <AdvancedModeInputs
          pitchType={pitchType}
          setPitchType={setPitchType}
          setPreset={setPreset}
        />
      )}

      <SimulateButton onClick={handleSimulate} disabled={isSimulating}>
        {isSimulating ? '시뮬레이션 중...' : '⚾ 시뮬레이션 시작'}
      </SimulateButton>
    </Panel>
  )
}

function SimpleModeInputs({
  throwPower,
  setThrowPower,
  pitchType,
  setPitchType
}: {
  throwPower: number
  setThrowPower: (v: number) => void
  pitchType: PitchType
  setPitchType: (v: PitchType) => void
}) {
  return (
    <InputSection>
      <InputGroup>
        <InputLabel>던지는 세기</InputLabel>
        <SliderContainer>
          <Slider
            type="range"
            min="1"
            max="10"
            step="1"
            value={throwPower}
            onChange={(e) => setThrowPower(Number(e.target.value))}
          />
          <SliderValue>{throwPower} / 10</SliderValue>
        </SliderContainer>
      </InputGroup>

      <InputGroup>
        <InputLabel>구종 선택</InputLabel>
        <Select value={pitchType} onChange={(e) => setPitchType(e.target.value as PitchType)}>
          {(Object.keys(PITCH_NAMES) as PitchType[]).map(type => (
            <option key={type} value={type}>
              {PITCH_NAMES[type]}
            </option>
          ))}
        </Select>
        <Description>{PITCH_DESCRIPTIONS[pitchType]}</Description>
      </InputGroup>
    </InputSection>
  )
}

function AdvancedModeInputs({
  pitchType,
  setPitchType,
  setPreset
}: {
  pitchType: PitchType
  setPitchType: (v: PitchType) => void
  setPreset: (v: PitchType) => void
}) {
  const handlePresetChange = (type: PitchType) => {
    setPitchType(type)
    setPreset(type)
  }

  return (
    <InputSection>
      <InputGroup>
        <InputLabel>프리셋 선택</InputLabel>
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
        전문가 모드에서는 프리셋을 선택하면 해당 구종의 파라미터가 자동으로 설정됩니다.
      </InfoText>
    </InputSection>
  )
}

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

const ModeToggle = styled.div`
  display: flex;
  gap: 8px;
`

const ModeButton = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: ${props => props.active ? '#4caf50' : '#1a1a2e'};
  color: #ffffff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#45a049' : '#252538'};
  }
`

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

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Slider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #1a1a2e;
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4caf50;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4caf50;
    cursor: pointer;
    border: none;
  }
`

const SliderValue = styled.span`
  min-width: 50px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #4caf50;
`

const Select = styled.select`
  padding: 10px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #1a1a2e;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`

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
