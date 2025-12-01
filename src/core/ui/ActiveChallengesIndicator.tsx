import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useChallenge } from '@/contexts/ChallengeContext'

/**
 * 활성 챌린지 상태 표시 컴포넌트
 * 현재 활성화된 챌린지 목록을 보여줌
 */
export function ActiveChallengesIndicator() {
  const {
    targetChallenge,
    catcherMittChallenge,
    movementChallenge,
    reverseChallenge,
    getActiveChallenges
  } = useChallenge()

  const activeChallenges = getActiveChallenges()

  if (activeChallenges.length === 0) {
    return null
  }

  const getChallengeInfo = (type: string) => {
    switch (type) {
      case 'target':
        return {
          icon: '🎯',
          name: '구역',
          detail: targetChallenge?.levelTitle || ''
        }
      case 'catcherMitt':
        return {
          icon: '🧤',
          name: '포수 미트',
          detail: catcherMittChallenge?.levelTitle || ''
        }
      case 'movement':
        return {
          icon: '📈',
          name: '변화량',
          detail: movementChallenge?.goalTitle || ''
        }
      case 'reverse':
        return {
          icon: '🔄',
          name: '역문제',
          detail: reverseChallenge?.problemTitle || ''
        }
      default:
        return { icon: '✨', name: '챌린지', detail: '' }
    }
  }

  return (
    <Container>
      <Header>
        <Title>활성 챌린지 ({activeChallenges.length})</Title>
      </Header>
      <ChallengeList>
        {activeChallenges.map((type) => {
          const info = getChallengeInfo(type)
          return (
            <ChallengeItem key={type}>
              <ChallengeIcon>{info.icon}</ChallengeIcon>
              <ChallengeInfo>
                <ChallengeName>{info.name}</ChallengeName>
                <ChallengeDetail>{info.detail}</ChallengeDetail>
              </ChallengeInfo>
            </ChallengeItem>
          )
        })}
      </ChallengeList>
    </Container>
  )
}

const Container = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.success};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.base};
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.xs};
`

const Title = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.success};
`

const ChallengeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const ChallengeItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xs};
  background: ${theme.colors.success}10;
  border-radius: ${theme.borderRadius.sm};
`

const ChallengeIcon = styled.div`
  font-size: 20px;
`

const ChallengeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`

const ChallengeName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const ChallengeDetail = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`
