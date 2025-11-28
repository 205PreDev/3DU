import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { TabContainer, Tab } from './TabContainer'
import { TargetChallengePanel } from './enjoy/TargetChallengePanel'
import { MovementGoalPanel } from './enjoy/MovementGoalPanel'
import { ReverseProblemPanel } from './enjoy/ReverseProblemPanel'

/**
 * Enjoy 패널 - 재미 요소 통합 탭
 * 하위에 타겟, 변화량, 역문제 챌린지 포함
 */
export function EnjoyPanel() {
  const enjoyTabs: Tab[] = [
    {
      id: 'target',
      label: '타겟',
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
      <TabContainer tabs={enjoyTabs} defaultTab="target" />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
  height: 100%;
  min-height: 0;
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
