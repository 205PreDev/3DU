import { ReactNode, useState } from 'react'
import styled from 'styled-components'

export interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface TabContainerProps {
  tabs: Tab[]
  defaultTab?: string
}

/**
 * 탭 컨테이너 컴포넌트
 * 여러 탭 간 전환 UI 제공
 */
export function TabContainer({ tabs, defaultTab }: TabContainerProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const currentTab = tabs.find(tab => tab.id === activeTab)

  return (
    <Container>
      <TabHeader>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
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
  background: #2a2a3e;
  border-radius: 8px;
  overflow: hidden;
`

const TabHeader = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px;
  background: #1a1a2e;
  border-bottom: 1px solid #3a3a4e;
`

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: ${props => props.$active ? '#4caf50' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : '#aaa'};
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#4caf50' : 'rgba(76, 175, 80, 0.2)'};
    color: #ffffff;
  }

  &:active {
    transform: scale(0.98);
  }
`

const TabContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a2e;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4caf50;
    border-radius: 4px;
  }
`
