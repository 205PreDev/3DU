import styled from 'styled-components'
import { CameraPreset } from '@/contexts/SimulationContext'

interface CameraPresetButtonsProps {
  currentPreset: CameraPreset
  onPresetChange: (preset: CameraPreset) => void
}

const PRESETS: { key: CameraPreset; label: string; icon: string }[] = [
  { key: 'catcher', label: '포수', icon: '🧤' },
  { key: 'pitcher', label: '투수', icon: '⚾' },
  { key: 'side', label: '측면', icon: '📐' },
  { key: 'follow', label: '추적', icon: '🎯' },
  { key: 'free', label: '자유', icon: '🖱️' }
]

/**
 * 카메라 프리셋 선택 버튼
 */
export function CameraPresetButtons({ currentPreset, onPresetChange }: CameraPresetButtonsProps) {
  return (
    <Container>
      <Title>📹 카메라 시점</Title>
      <ButtonGrid>
        {PRESETS.map(preset => (
          <PresetButton
            key={preset.key}
            $active={currentPreset === preset.key}
            onClick={() => onPresetChange(preset.key)}
          >
            <Icon>{preset.icon}</Icon>
            <Label>{preset.label}</Label>
          </PresetButton>
        ))}
      </ButtonGrid>
    </Container>
  )
}

const Container = styled.div`
  background: #2a2a3e;
  border-radius: 8px;
  padding: 16px;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`

const Title = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #4caf50;
`

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`

const PresetButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid ${props => props.$active ? '#4caf50' : '#444'};
  border-radius: 6px;
  background: ${props => props.$active ? 'rgba(76, 175, 80, 0.2)' : '#1a1a2e'};
  color: ${props => props.$active ? '#4caf50' : '#ccc'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.15);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`

const Icon = styled.div`
  font-size: 20px;
`

const Label = styled.div`
  font-size: 11px;
  font-weight: 500;
`
