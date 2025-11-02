import { ReactNode, useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'

export interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface TabContainerProps {
  tabs: Tab[]
  defaultTab?: string
  onTabChange?: (tabId: string) => void
}

/**
 * 탭 컨테이너 컴포넌트
 * 여러 탭 간 전환 UI 제공
 */
export function TabContainer({ tabs, defaultTab, onTabChange }: TabContainerProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const currentTab = tabs.find(tab => tab.id === activeTab)

  return (
    <Container>
      <TabHeader>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabHeader>

      <TabContent>
        {currentTab?.content}
      </TabContent>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
  border: 1px solid ${theme.colors.border.light};
`

const TabHeader = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.background.tertiary};
  border-bottom: 1px solid ${theme.colors.border.main};
`

const TabButton = styled.button<{ $active: boolean }>`
  position: relative;
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.$active
    ? theme.colors.background.elevated
    : 'transparent'
  };
  color: ${props => props.$active
    ? theme.colors.primary.main
    : theme.colors.text.secondary
  };
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${props => props.$active
    ? theme.typography.fontWeight.semibold
    : theme.typography.fontWeight.regular
  };
  cursor: pointer;
  transition: ${theme.transitions.normal};
  overflow: hidden;

  /* Active 상태 글로우 효과 */
  ${props => props.$active && `
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: ${theme.colors.primary.gradient};
      opacity: 0.1;
      border-radius: ${theme.borderRadius.md};
    }
  `}

  &:hover {
    background: ${props => props.$active
      ? theme.colors.background.elevated
      : 'rgba(0, 217, 255, 0.1)'
    };
    color: ${props => props.$active
      ? theme.colors.primary.light
      : theme.colors.text.primary
    };
  }

  &:active {
    transform: scale(0.97);
  }
`

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${theme.spacing.base};
  min-height: 0; /* Flexbox 스크롤 버그 방지 */

  /* 스크롤바는 GlobalStyles에서 정의됨 */

  /* 스크롤 페이드 효과 */
  &::before,
  &::after {
    content: '';
    position: sticky;
    display: block;
    height: 20px;
    margin: 0 -${theme.spacing.base};
    pointer-events: none;
    z-index: 10;
  }

  &::before {
    top: 0;
    background: linear-gradient(
      to bottom,
      ${theme.colors.background.secondary},
      transparent
    );
    margin-bottom: -20px;
  }

  &::after {
    bottom: 0;
    background: linear-gradient(
      to top,
      ${theme.colors.background.secondary},
      transparent
    );
    margin-top: -20px;
  }
`
