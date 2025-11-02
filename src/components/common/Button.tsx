import styled, { css } from 'styled-components'
import { theme } from '@/styles/theme'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
}

/**
 * 공통 버튼 컴포넌트
 * variant: primary (기본), secondary, outline, ghost, danger
 * size: sm, md (기본), lg
 */
export const Button = styled.button<ButtonProps>`
  /* 기본 스타일 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  text-decoration: none;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* 크기 변형 */
  ${props => {
    switch (props.size) {
      case 'sm':
        return css`
          padding: ${theme.spacing.xs} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.sm};
          height: 32px;
        `
      case 'lg':
        return css`
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: ${theme.typography.fontSize.md};
          height: 48px;
        `
      default: // md
        return css`
          padding: ${theme.spacing.sm} ${theme.spacing.base};
          font-size: ${theme.typography.fontSize.base};
          height: 40px;
        `
    }
  }}

  /* 전체 너비 */
  ${props => props.fullWidth && css`
    width: 100%;
  `}

  /* 로딩 상태 */
  ${props => props.loading && css`
    pointer-events: none;
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}

  /* 색상 변형 */
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return css`
          background: ${theme.colors.secondary.main};
          color: ${theme.colors.text.primary};

          &:hover:not(:disabled) {
            background: ${theme.colors.secondary.light};
            box-shadow: ${theme.shadows.glow.replace('#00D9FF', theme.colors.secondary.main)};
          }

          &:active:not(:disabled) {
            background: ${theme.colors.secondary.dark};
          }
        `

      case 'outline':
        return css`
          background: transparent;
          border: 1.5px solid ${theme.colors.primary.main};
          color: ${theme.colors.primary.main};

          &:hover:not(:disabled) {
            background: rgba(0, 217, 255, 0.1);
            box-shadow: ${theme.shadows.glow};
          }

          &:active:not(:disabled) {
            background: rgba(0, 217, 255, 0.2);
          }
        `

      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.text.secondary};

          &:hover:not(:disabled) {
            background: ${theme.colors.background.elevated};
            color: ${theme.colors.text.primary};
          }

          &:active:not(:disabled) {
            background: ${theme.colors.background.tertiary};
          }
        `

      case 'danger':
        return css`
          background: ${theme.colors.error};
          color: ${theme.colors.text.primary};

          &:hover:not(:disabled) {
            background: #ff5588;
            box-shadow: 0 0 20px rgba(255, 61, 113, 0.4);
          }

          &:active:not(:disabled) {
            background: #dd1155;
          }
        `

      default: // primary
        return css`
          background: ${theme.colors.primary.gradient};
          color: ${theme.colors.text.primary};
          box-shadow: ${theme.shadows.sm};

          &:hover:not(:disabled) {
            box-shadow: ${theme.shadows.glow};
            transform: translateY(-1px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${theme.shadows.sm};
          }
        `
    }
  }}
`
