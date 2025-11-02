import styled from 'styled-components'
import { theme } from '@/styles/theme'

interface CardProps {
  padding?: string
  noBorder?: boolean
  elevated?: boolean
}

/**
 * 공통 카드 컴포넌트
 */
export const Card = styled.div<CardProps>`
  background: ${theme.colors.background.secondary};
  border: ${props => props.noBorder ? 'none' : `1px solid ${theme.colors.border.main}`};
  border-radius: ${theme.borderRadius.lg};
  padding: ${props => props.padding || theme.spacing.base};
  box-shadow: ${props => props.elevated ? theme.shadows.lg : theme.shadows.md};
  transition: ${theme.transitions.normal};

  &:hover {
    border-color: ${props => props.noBorder ? 'transparent' : theme.colors.border.strong};
  }
`

export const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.base};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border.light};
`

export const CardTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`

export const CardSubtitle = styled.p`
  margin: ${theme.spacing.xs} 0 0 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.normal};
`

export const CardBody = styled.div`
  /* 기본 스타일 없음, 필요시 추가 */
`

export const CardFooter = styled.div`
  margin-top: ${theme.spacing.base};
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.light};
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
`

/**
 * 인터랙티브 카드 (클릭 가능)
 */
export const InteractiveCard = styled(Card)`
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${theme.colors.primary.gradient};
    opacity: 0;
    transition: ${theme.transitions.normal};
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};

    &::before {
      opacity: 0.05;
    }
  }

  &:active {
    transform: translateY(0);
  }
`

/**
 * 그리드 카드 컨테이너
 */
export const CardGrid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
  gap: ${props => props.gap || theme.spacing.base};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

/**
 * 카드 리스트 컨테이너
 */
export const CardList = styled.div<{ gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.gap || theme.spacing.base};
`
