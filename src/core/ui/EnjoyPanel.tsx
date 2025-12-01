import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { TabContainer, Tab } from './TabContainer'
import { TargetChallengePanel } from './enjoy/TargetChallengePanel'
import { MovementGoalPanel } from './enjoy/MovementGoalPanel'
import { ReverseProblemPanel } from './enjoy/ReverseProblemPanel'
import { CatcherMittPanel } from './enjoy/CatcherMittPanel'
import { ChallengeHistoryPanel } from './enjoy/ChallengeHistoryPanel'
import { StatsDashboard } from './StatsDashboard'

/**
 * Enjoy 패널 - 재미 요소 통합 탭
 * 다양한 챌린지를 통해 게임처럼 즐기며 배우기
 */
export function EnjoyPanel() {
  const enjoyTabs: Tab[] = [
    {
      id: 'catcher-mitt',
      label: '포수 미트',
      content: <CatcherMittPanel />
    },
    {
      id: 'target',
      label: '구역',
      content: <TargetChallengePanel />
    },
    {
      id: 'movement',
      label: '변화량',
      content: <MovementGoalPanel />
    },
    {
      id: 'reverse',
      label: '역문제',
      content: <ReverseProblemPanel />
    }
  ]

  return (
    <Container>
      <Header>
        <Title>재미있게 배우기</Title>
        <Description>
          다양한 챌린지를 통해 야구 물리학을 체험해보세요!
        </Description>
      </Header>
      <StatsDashboard />
      <Divider />
      <ChallengeHistoryPanel />
      <TabContainer tabs={enjoyTabs} defaultTab="catcher-mitt" />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border.light};
`

const Title = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const Description = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`

const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.border.light};
  margin: ${theme.spacing.base} 0;
`
