import styled, { css } from 'styled-components'
import { theme } from '@/styles/theme'

interface InputProps {
  error?: boolean
  icon?: React.ReactNode
}

/**
 * 공통 입력 컴포넌트
 */
export const Input = styled.input<InputProps>`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.base};
  background: ${theme.colors.background.tertiary};
  border: 1.5px solid ${props =>
    props.error ? theme.colors.error : theme.colors.border.main
  };
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  transition: all ${theme.transitions.normal};
  outline: none;

  &::placeholder {
    color: ${theme.colors.text.tertiary};
  }

  &:hover:not(:disabled) {
    border-color: ${props =>
      props.error ? theme.colors.error : theme.colors.border.strong
    };
  }

  &:focus {
    border-color: ${props =>
      props.error ? theme.colors.error : theme.colors.primary.main
    };
    background: ${theme.colors.background.elevated};
    box-shadow: ${props =>
      props.error
        ? '0 0 0 3px rgba(255, 61, 113, 0.1)'
        : '0 0 0 3px rgba(0, 217, 255, 0.1)'
    };
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${props => props.icon && css`
    padding-left: ${theme.spacing.xl};
  `}
`

export const Label = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`

export const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.base};
`

export const ErrorMessage = styled.div`
  margin-top: ${theme.spacing.xs};
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &::before {
    content: '⚠';
  }
`

export const HelperText = styled.div`
  margin-top: ${theme.spacing.xs};
  color: ${theme.colors.text.tertiary};
  font-size: ${theme.typography.fontSize.xs};
`

interface InputWrapperProps {
  icon?: React.ReactNode
  children: React.ReactNode
}

export const InputWrapper = styled.div<{ hasIcon?: boolean }>`
  position: relative;
  width: 100%;

  ${props => props.hasIcon && css`
    svg, .icon {
      position: absolute;
      left: ${theme.spacing.md};
      top: 50%;
      transform: translateY(-50%);
      color: ${theme.colors.text.tertiary};
      pointer-events: none;
    }
  `}
`
