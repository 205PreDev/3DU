import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { HiQuestionMarkCircle, HiUser } from 'react-icons/hi2'

interface TopNavigationBarProps {
  scenarioName?: string
  onHelpClick?: () => void
  onUserClick?: () => void
}

/**
 * 상단 네비게이션 바
 * 시나리오 이름, 도움말, 사용자 메뉴 제공
 */
export function TopNavigationBar({
  scenarioName = '야구 투구 시뮬레이터',
  onHelpClick,
  onUserClick
}: TopNavigationBarProps) {
  return (
    <Container>
      <LeftSection>
        <ScenarioTitle>{scenarioName}</ScenarioTitle>
      </LeftSection>

      <RightSection>
        <IconButton onClick={onHelpClick} aria-label="도움말">
          <HelpIcon>
            <HiQuestionMarkCircle />
          </HelpIcon>
        </IconButton>

        <UserMenuButton onClick={onUserClick} aria-label="사용자 메뉴">
          <UserIcon>
            <HiUser />
          </UserIcon>
        </UserMenuButton>
      </RightSection>
    </Container>
  )
}

const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 ${theme.spacing.lg};
  background: ${theme.colors.background.secondary};
  border-bottom: 1px solid ${theme.colors.border.main};
  color: ${theme.colors.text.primary};
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
  box-shadow: ${theme.shadows.md};
  backdrop-filter: blur(10px);
`

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`

const ScenarioTitle = styled.h1`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  background: ${theme.colors.primary.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.full};
  background: transparent;
  color: ${theme.colors.primary.main};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  position: relative;

  &:hover {
    background: rgba(0, 217, 255, 0.1);
    box-shadow: ${theme.shadows.glow};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const HelpIcon = styled.span`
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    display: block;
  }
`

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.background.tertiary};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${theme.colors.primary.gradient};
    opacity: 0;
    transition: ${theme.transitions.normal};
  }

  &:hover {
    &::before {
      opacity: 0.2;
    }
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const UserIcon = styled.span`
  font-size: 20px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.primary};

  svg {
    display: block;
  }
`
