import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '@/styles/theme'
import { challengeHistoryApi, type ChallengeStats } from '@/lib/supabaseApi'
import type { ChallengeType } from '@/contexts/ChallengeContext'
import { StatsCardSkeleton } from '../Skeleton'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2'

/**
 * 챌린지 히스토리 패널
 * 각 챌린지별 최고 기록, 성공률, 진행도 차트 표시
 */
export function ChallengeHistoryPanel() {
  const [stats, setStats] = useState<ChallengeStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ChallengeType | 'all'>('all')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadStats()
  }, [selectedType])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await challengeHistoryApi.getStats(
        selectedType === 'all' ? undefined : selectedType
      )
      setStats(data)
    } catch (err) {
      console.error('챌린지 통계 로드 실패:', err)
      setError('챌린지 통계를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getChallengeTypeLabel = (type: ChallengeType) => {
    switch (type) {
      case 'target':
        return '🎯 구역'
      case 'catcherMitt':
        return '🧤 포수 미트'
      case 'movement':
        return '📈 변화량'
      case 'reverse':
        return '🔄 역문제'
      default:
        return type
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  if (loading) {
    return (
      <Container>
        <TitleBar onClick={() => setIsExpanded(!isExpanded)}>
          <Title>챌린지 기록</Title>
          <ToggleIcon>
            {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
          </ToggleIcon>
        </TitleBar>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <Content>
                <FilterButtons>
                  <FilterButton $active={selectedType === 'all'} disabled>
                    전체
                  </FilterButton>
                  <FilterButton $active={false} disabled>
                    🎯 구역
                  </FilterButton>
                  <FilterButton $active={false} disabled>
                    🧤 미트
                  </FilterButton>
                  <FilterButton $active={false} disabled>
                    📈 변화량
                  </FilterButton>
                  <FilterButton $active={false} disabled>
                    🔄 역문제
                  </FilterButton>
                </FilterButtons>
                <StatsGrid>
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                </StatsGrid>
              </Content>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <TitleBar onClick={() => setIsExpanded(!isExpanded)}>
          <Title>챌린지 기록</Title>
          <ToggleIcon>
            {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
          </ToggleIcon>
        </TitleBar>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <Content>
                <ErrorMessage>{error}</ErrorMessage>
                <RetryButton onClick={loadStats}>다시 시도</RetryButton>
              </Content>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    )
  }

  if (stats.length === 0) {
    return (
      <Container>
        <TitleBar onClick={() => setIsExpanded(!isExpanded)}>
          <Title>챌린지 기록</Title>
          <ToggleIcon>
            {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
          </ToggleIcon>
        </TitleBar>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <Content>
                <EmptyMessage>
                  <EmptyIcon>📊</EmptyIcon>
                  <EmptyText>아직 완료한 챌린지가 없습니다.</EmptyText>
                  <EmptySubText>챌린지를 시작하고 기록을 쌓아보세요!</EmptySubText>
                </EmptyMessage>
              </Content>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    )
  }

  return (
    <Container>
      <TitleBar onClick={() => setIsExpanded(!isExpanded)}>
        <Title>챌린지 기록</Title>
        <ToggleIcon>
          {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
        </ToggleIcon>
      </TitleBar>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <Content>
              <FilterButtons>
                <FilterButton
                  $active={selectedType === 'all'}
                  onClick={() => setSelectedType('all')}
                >
                  전체
                </FilterButton>
                <FilterButton
                  $active={selectedType === 'target'}
                  onClick={() => setSelectedType('target')}
                >
                  🎯 구역
                </FilterButton>
                <FilterButton
                  $active={selectedType === 'catcherMitt'}
                  onClick={() => setSelectedType('catcherMitt')}
                >
                  🧤 미트
                </FilterButton>
                <FilterButton
                  $active={selectedType === 'movement'}
                  onClick={() => setSelectedType('movement')}
                >
                  📈 변화량
                </FilterButton>
                <FilterButton
                  $active={selectedType === 'reverse'}
                  onClick={() => setSelectedType('reverse')}
                >
                  🔄 역문제
                </FilterButton>
              </FilterButtons>

              <StatsGrid>
                {stats.map((stat) => (
                  <StatCard key={`${stat.challenge_type}-${stat.level_id}`}>
                    <StatHeader>
                      <StatTypeLabel>{getChallengeTypeLabel(stat.challenge_type)}</StatTypeLabel>
                      <StatLevel>{stat.level_title}</StatLevel>
                    </StatHeader>

                    <StatBody>
                      <ProgressBarContainer>
                        <ProgressBar $percent={stat.success_rate}>
                          <ProgressFill $percent={stat.success_rate} />
                        </ProgressBar>
                        <ProgressLabel>{stat.success_rate.toFixed(1)}% 성공률</ProgressLabel>
                      </ProgressBarContainer>

                      <StatRow>
                        <StatItem>
                          <StatItemLabel>총 시도</StatItemLabel>
                          <StatItemValue>{stat.total_attempts}회</StatItemValue>
                        </StatItem>
                        <StatItem>
                          <StatItemLabel>성공</StatItemLabel>
                          <StatItemValue>{stat.total_successes}회</StatItemValue>
                        </StatItem>
                      </StatRow>

                      {stat.best_score !== null && (
                        <StatRow>
                          <StatItem>
                            <StatItemLabel>최고 점수</StatItemLabel>
                            <StatItemValue $highlight>{stat.best_score}점</StatItemValue>
                          </StatItem>
                          {stat.best_attempts !== null && (
                            <StatItem>
                              <StatItemLabel>최소 시도</StatItemLabel>
                              <StatItemValue $highlight>{stat.best_attempts}회</StatItemValue>
                            </StatItem>
                          )}
                        </StatRow>
                      )}

                      {stat.last_success_at && (
                        <LastSuccess>
                          마지막 성공: {formatDate(stat.last_success_at)}
                        </LastSuccess>
                      )}
                    </StatBody>
                  </StatCard>
                ))}
              </StatsGrid>
            </Content>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.base};
`

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.md};
  transition: ${theme.transitions.normal};

  &:hover {
    background: ${theme.colors.background.secondary};
  }
`

const Title = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const ToggleIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${theme.colors.text.secondary};
  transition: ${theme.transitions.normal};

  svg {
    display: block;
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
  padding-top: ${theme.spacing.sm};
`

const FilterButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`

const FilterButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${(props) =>
    props.$active ? theme.colors.primary.main : theme.colors.background.tertiary};
  color: ${(props) => (props.$active ? 'white' : theme.colors.text.secondary)};
  border: 1px solid
    ${(props) => (props.$active ? theme.colors.primary.main : theme.colors.border.light)};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    background: ${(props) =>
      props.$active ? theme.colors.primary.dark : theme.colors.background.elevated};
    border-color: ${theme.colors.primary.main};
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.base};
`

const StatCard = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
  transition: ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary.main};
    box-shadow: ${theme.shadows.md};
  }
`

const StatHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.sm};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border.light};
`

const StatTypeLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`

const StatLevel = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const StatBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const ProgressBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const ProgressBar = styled.div<{ $percent: number }>`
  width: 100%;
  height: 8px;
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`

const ProgressFill = styled.div<{ $percent: number }>`
  width: ${(props) => props.$percent}%;
  height: 100%;
  background: ${(props) => {
    if (props.$percent >= 80) return theme.colors.success
    if (props.$percent >= 50) return theme.colors.warning
    return theme.colors.error
  }};
  transition: width 0.5s ease;
`

const ProgressLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: center;
`

const StatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.sm};
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const StatItemLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`

const StatItemValue = styled.div<{ $highlight?: boolean }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${(props) =>
    props.$highlight ? theme.colors.primary.main : theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.mono};
`

const LastSuccess = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  padding-top: ${theme.spacing.xs};
  border-top: 1px solid ${theme.colors.border.light};
  text-align: center;
`

// const LoadingMessage = styled.div`
//   text-align: center;
//   padding: ${theme.spacing.xl};
//   color: ${theme.colors.text.secondary};
// `

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.base};
  color: ${theme.colors.error};
  background: ${theme.colors.error}10;
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.md};
`

const RetryButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.base};
  background: ${theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${theme.transitions.fast};
  margin: ${theme.spacing.base} auto 0;
  display: block;

  &:hover {
    background: ${theme.colors.primary.dark};
  }
`

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xl};
  text-align: center;
`

const EmptyIcon = styled.div`
  font-size: 48px;
`

const EmptyText = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const EmptySubText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`
