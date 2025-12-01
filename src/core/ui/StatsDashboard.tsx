import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '@/styles/theme'
import { challengeHistoryApi, experimentsApi } from '@/lib/supabaseApi'
import { Skeleton } from './Skeleton'
import { HiTrophy, HiChartBar, HiClock, HiFire, HiChevronDown, HiChevronUp } from 'react-icons/hi2'
import { SimpleBarChart } from './charts/SimpleChart'

interface OverallStats {
  totalChallenges: number
  totalSuccesses: number
  overallSuccessRate: number
  totalExperiments: number
  bestChallengeType: string | null
  recentActivityDays: number
  challengeSuccessRates: Array<{ type: string; rate: number }>
}

/**
 * 통계 대시보드
 * 전체 활동 통계를 한눈에 보여줌
 */
export function StatsDashboard() {
  const [stats, setStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const [challengeStats, experiments] = await Promise.all([
        challengeHistoryApi.getStats(),
        experimentsApi.list(100)
      ])

      // 전체 통계 계산
      const totalChallenges = challengeStats.reduce((sum, stat) => sum + stat.total_attempts, 0)
      const totalSuccesses = challengeStats.reduce((sum, stat) => sum + stat.total_successes, 0)
      const overallSuccessRate = totalChallenges > 0 ? (totalSuccesses / totalChallenges) * 100 : 0

      // 가장 잘하는 챌린지 타입
      const bestType = challengeStats.reduce((best, stat) => {
        if (!best || stat.success_rate > best.success_rate) {
          return stat
        }
        return best
      }, challengeStats[0])

      // 최근 활동 일수 계산
      const recentDates = experiments
        .map(exp => new Date(exp.created_at).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index)

      // 챌린지별 성공률 데이터
      const challengeSuccessRates = challengeStats.map(stat => ({
        type: stat.challenge_type,
        rate: stat.success_rate
      }))

      setStats({
        totalChallenges,
        totalSuccesses,
        overallSuccessRate,
        totalExperiments: experiments.length,
        bestChallengeType: bestType?.challenge_type || null,
        recentActivityDays: recentDates.length,
        challengeSuccessRates
      })
    } catch (err) {
      console.error('통계 로드 실패:', err)
      setError('통계를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'target':
        return '구역 챌린지'
      case 'catcherMitt':
        return '포수 미트'
      case 'movement':
        return '변화량 챌린지'
      case 'reverse':
        return '역문제 챌린지'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <Container>
        <TitleBar onClick={() => setIsExpanded(!isExpanded)}>
          <Title>전체 통계</Title>
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
              <StatsGrid>
                <StatCard>
                  <Skeleton height="24px" width="60%" />
                  <Skeleton height="40px" width="80%" />
                  <Skeleton height="14px" width="50%" />
                </StatCard>
                <StatCard>
                  <Skeleton height="24px" width="60%" />
                  <Skeleton height="40px" width="80%" />
                  <Skeleton height="14px" width="50%" />
                </StatCard>
                <StatCard>
                  <Skeleton height="24px" width="60%" />
                  <Skeleton height="40px" width="80%" />
                  <Skeleton height="14px" width="50%" />
                </StatCard>
                <StatCard>
                  <Skeleton height="24px" width="60%" />
                  <Skeleton height="40px" width="80%" />
                  <Skeleton height="14px" width="50%" />
                </StatCard>
              </StatsGrid>
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
          <Title>전체 통계</Title>
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
              <ErrorMessage>{error}</ErrorMessage>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    )
  }

  if (!stats) return null

  const chartData = stats.challengeSuccessRates.map(item => ({
    label: getChallengeTypeLabel(item.type).replace(' 챌린지', '').replace('포수 ', ''),
    value: item.rate,
    color: getChartColor(item.type)
  }))

  return (
    <Container>
      <TitleBar onClick={() => setIsExpanded(!isExpanded)}>
        <Title>전체 통계</Title>
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
            <StatsContent>
              <StatsGrid>
        <StatCard
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <StatIcon $color={theme.colors.primary.main}>
            <HiChartBar />
          </StatIcon>
          <StatLabel>총 챌린지 시도</StatLabel>
          <StatValue>{stats.totalChallenges.toLocaleString()}회</StatValue>
          <StatSubtext>{stats.totalSuccesses}회 성공</StatSubtext>
        </StatCard>

        <StatCard
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatIcon $color={theme.colors.success}>
            <HiTrophy />
          </StatIcon>
          <StatLabel>전체 성공률</StatLabel>
          <StatValue>{stats.overallSuccessRate.toFixed(1)}%</StatValue>
          <ProgressBar>
            <ProgressFill
              as={motion.div}
              initial={{ width: 0 }}
              animate={{ width: `${stats.overallSuccessRate}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              $percent={stats.overallSuccessRate}
            />
          </ProgressBar>
        </StatCard>

        <StatCard
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatIcon $color={theme.colors.secondary.main}>
            <HiClock />
          </StatIcon>
          <StatLabel>총 실험 횟수</StatLabel>
          <StatValue>{stats.totalExperiments.toLocaleString()}회</StatValue>
          <StatSubtext>투구 시뮬레이션</StatSubtext>
        </StatCard>

        <StatCard
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatIcon $color={theme.colors.warning}>
            <HiFire />
          </StatIcon>
          <StatLabel>가장 잘하는 챌린지</StatLabel>
          <StatValue>
            {stats.bestChallengeType
              ? getChallengeTypeLabel(stats.bestChallengeType)
              : '-'}
          </StatValue>
          <StatSubtext>최근 {stats.recentActivityDays}일 활동</StatSubtext>
        </StatCard>
      </StatsGrid>

              {chartData.length > 0 && (
                <ChartSection
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <SimpleBarChart
                    data={chartData}
                    title="챌린지별 성공률"
                    maxValue={100}
                    height={180}
                  />
                </ChartSection>
              )}
            </StatsContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}

function getChartColor(type: string): string {
  switch (type) {
    case 'target':
      return theme.colors.primary.main
    case 'catcherMitt':
      return theme.colors.secondary.main
    case 'movement':
      return theme.colors.success
    case 'reverse':
      return theme.colors.warning
    default:
      return theme.colors.primary.main
  }
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
  font-size: ${theme.typography.fontSize.lg};
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

const StatsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
  padding-top: ${theme.spacing.sm};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.base};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  transition: ${theme.transitions.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }
`

const StatIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${({ $color }) => $color}20;
  border-radius: ${theme.borderRadius.md};
  color: ${({ $color }) => $color};
  font-size: 24px;
  margin-bottom: ${theme.spacing.xs};

  svg {
    display: block;
  }
`

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.mono};
`

const StatSubtext = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
`

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${theme.spacing.xs};
`

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  background: ${({ $percent }) => {
    if ($percent >= 80) return theme.colors.success
    if ($percent >= 50) return theme.colors.warning
    return theme.colors.error
  }};
  border-radius: ${theme.borderRadius.full};
`

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.error};
  background: ${theme.colors.error}10;
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.borderRadius.md};
`

const ChartSection = styled.div`
  margin-top: ${theme.spacing.base};
`
