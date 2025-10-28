import styled from 'styled-components'

interface TopNavigationBarProps {
  scenarioName?: string
  onBack?: () => void
  onHelpClick?: () => void
}

/**
 * 상단 네비게이션 바
 * 뒤로가기, 시나리오 이름, 도움말, 사용자 메뉴 제공
 */
export function TopNavigationBar({
  scenarioName = '야구 투구 시뮬레이터',
  onBack,
  onHelpClick
}: TopNavigationBarProps) {
  return (
    <Container>
      <LeftSection>
        {onBack && (
          <BackButton onClick={onBack} aria-label="뒤로가기">
            ←
          </BackButton>
        )}
        <ScenarioTitle>{scenarioName}</ScenarioTitle>
      </LeftSection>

      <RightSection>
        <IconButton onClick={onHelpClick} aria-label="도움말">
          ?
        </IconButton>

        <UserMenuButton aria-label="사용자 메뉴">
          <UserIcon>👤</UserIcon>
        </UserMenuButton>
      </RightSection>
    </Container>
  )
}

const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: #1a1a2e;
  border-bottom: 1px solid #2a2a3e;
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #ffffff;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(76, 175, 80, 0.2);
  }

  &:active {
    background: rgba(76, 175, 80, 0.3);
  }
`

const ScenarioTitle = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #4caf50;
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #4caf50;
  border-radius: 50%;
  background: transparent;
  color: #4caf50;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(76, 175, 80, 0.2);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #2a2a3e;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3a3a4e;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const UserIcon = styled.span`
  font-size: 18px;
`
