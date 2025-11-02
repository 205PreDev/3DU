import styled from 'styled-components'
import { CameraPreset } from '@/contexts/SimulationContext'
import { theme } from '@/styles/theme'
import { MdVideocam } from 'react-icons/md'
import { GiBaseballGlove, GiBaseballBat } from 'react-icons/gi'
import { TbViewfinder } from 'react-icons/tb'
import { BiTargetLock } from 'react-icons/bi'
import { PiCursorClickFill } from 'react-icons/pi'

interface CameraPresetButtonsProps {
  currentPreset: CameraPreset
  onPresetChange: (preset: CameraPreset) => void
}

const PRESETS: { key: CameraPreset; label: string; icon: React.ReactNode }[] = [
  { key: 'catcher', label: '포수', icon: <GiBaseballGlove /> },
  { key: 'pitcher', label: '투수', icon: <GiBaseballBat /> },
  { key: 'side', label: '측면', icon: <TbViewfinder /> },
  { key: 'follow', label: '추적', icon: <BiTargetLock /> },
  { key: 'free', label: '자유', icon: <PiCursorClickFill /> }
]

/**
 * 카메라 프리셋 선택 버튼
 */
export function CameraPresetButtons({ currentPreset, onPresetChange }: CameraPresetButtonsProps) {
  return (
    <Container>
      <Title>
        <MdVideocam /> 카메라 시점
      </Title>
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
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const Title = styled.h4`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.xs};
`

const PresetButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm};
  border: 1.5px solid ${props =>
    props.$active
      ? theme.colors.primary.main
      : theme.colors.border.main
  };
  border-radius: ${theme.borderRadius.md};
  background: ${props =>
    props.$active
      ? 'rgba(0, 217, 255, 0.1)'
      : theme.colors.background.tertiary
  };
  color: ${props =>
    props.$active
      ? theme.colors.primary.main
      : theme.colors.text.secondary
  };
  cursor: pointer;
  transition: ${theme.transitions.fast};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${theme.colors.primary.gradient};
    opacity: 0;
    transition: ${theme.transitions.fast};
  }

  &:hover {
    border-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.light};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};

    &::before {
      opacity: 0.05;
    }
  }

  &:active {
    transform: translateY(0);
  }

  ${props => props.$active && `
    box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.2);
  `}
`

const Icon = styled.div`
  font-size: 20px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`

const Label = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  position: relative;
  z-index: 1;
`
