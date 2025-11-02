import styled from 'styled-components'
import { theme } from '@/styles/theme'

/**
 * 공통 섹션 컴포넌트 (패널 내부 그룹화용)
 */
export const Section = styled.section`
  margin-bottom: ${theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.sm};
`

export const SectionTitle = styled.h4`
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

export const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

/**
 * 접을 수 있는 섹션
 */
interface CollapsibleSectionProps {
  $collapsed?: boolean
}

export const CollapsibleSection = styled(Section)<CollapsibleSectionProps>`
  ${SectionHeader} {
    cursor: pointer;
    user-select: none;
    transition: ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.text.primary};
    }
  }

  ${SectionContent} {
    max-height: ${props => props.$collapsed ? '0' : '1000px'};
    overflow: hidden;
    transition: max-height ${theme.transitions.normal};
  }
`

export const ExpandIcon = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  transform: rotate(${props => props.$expanded ? '180deg' : '0deg'});
  transition: transform ${theme.transitions.fast};
  font-size: ${theme.typography.fontSize.xs};
`
