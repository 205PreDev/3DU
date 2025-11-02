import styled from 'styled-components'
import { theme } from '@/styles/theme'

/**
 * 폼 필드 그룹 컴포넌트 (라벨 + 입력 + 툴팁)
 */
interface FormFieldProps {
  label: string
  tooltip?: string
  children: React.ReactNode
  htmlFor?: string
}

export function FormField({ label, tooltip, children, htmlFor }: FormFieldProps) {
  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlFor}>
        <LabelText>{label}</LabelText>
        {tooltip && <Tooltip title={tooltip}>?</Tooltip>}
      </FieldLabel>
      {children}
    </FieldContainer>
  )
}

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const FieldLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`

const LabelText = styled.span`
  flex: 1;
`

const Tooltip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.background.tertiary};
  color: ${theme.colors.text.tertiary};
  font-size: 11px;
  font-weight: ${theme.typography.fontWeight.bold};
  cursor: help;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.primary.main};
    color: ${theme.colors.text.primary};
    box-shadow: ${theme.shadows.glow};
  }
`

/**
 * 숫자 입력 필드 (슬라이더 + 입력)
 */
interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  disabled?: boolean
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  disabled
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <NumberInputContainer>
      <Slider
        type="range"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
      <ValueDisplay>
        <ValueInput
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
        {unit && <Unit>{unit}</Unit>}
      </ValueDisplay>
    </NumberInputContainer>
  )
}

const NumberInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`

const Slider = styled.input`
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: ${theme.colors.background.tertiary};
  border-radius: ${theme.borderRadius.full};
  outline: none;
  transition: ${theme.transitions.fast};

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: ${theme.borderRadius.full};
    background: ${theme.colors.primary.main};
    cursor: pointer;
    box-shadow: ${theme.shadows.sm};
    transition: ${theme.transitions.fast};

    &:hover {
      box-shadow: ${theme.shadows.glow};
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: none;
    border-radius: ${theme.borderRadius.full};
    background: ${theme.colors.primary.main};
    cursor: pointer;
    box-shadow: ${theme.shadows.sm};
    transition: ${theme.transitions.fast};

    &:hover {
      box-shadow: ${theme.shadows.glow};
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &::-webkit-slider-thumb,
    &::-moz-range-thumb {
      cursor: not-allowed;
    }
  }
`

const ValueDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  min-width: 80px;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.borderRadius.md};
`

const ValueInput = styled.input`
  width: 50px;
  background: transparent;
  border: none;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.mono};
  outline: none;
  text-align: right;

  /* 숫자 입력 스피너 제거 */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`

const Unit = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  font-weight: ${theme.typography.fontWeight.medium};
`
