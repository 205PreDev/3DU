import styled, { keyframes } from 'styled-components'
import { theme } from '@/styles/theme'

interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  variant?: 'text' | 'rectangular' | 'circular'
}

/**
 * 로딩 스켈레톤 컴포넌트
 * 데이터 로딩 중 표시되는 플레이스홀더
 */
export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius,
  variant = 'rectangular'
}: SkeletonProps) {
  return (
    <SkeletonBox
      $width={width}
      $height={height}
      $borderRadius={borderRadius || getDefaultRadius(variant)}
      $variant={variant}
    />
  )
}

function getDefaultRadius(variant: SkeletonProps['variant']) {
  switch (variant) {
    case 'text':
      return theme.borderRadius.sm
    case 'circular':
      return '50%'
    case 'rectangular':
    default:
      return theme.borderRadius.md
  }
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`

const SkeletonBox = styled.div<{
  $width: string
  $height: string
  $borderRadius: string
  $variant: SkeletonProps['variant']
}>`
  width: ${({ $width }) => $width};
  height: ${({ $height, $variant }) => $variant === 'text' ? '1em' : $height};
  border-radius: ${({ $borderRadius }) => $borderRadius};
  background: ${theme.colors.background.tertiary};
  background-image: linear-gradient(
    90deg,
    ${theme.colors.background.tertiary} 0%,
    ${theme.colors.background.elevated} 50%,
    ${theme.colors.background.tertiary} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
`

/**
 * 챌린지 카드 스켈레톤
 */
export function ChallengeCardSkeleton() {
  return (
    <CardContainer>
      <Skeleton height="24px" width="60%" />
      <Skeleton height="16px" width="80%" />
      <SkeletonRow>
        <Skeleton height="40px" width="48%" />
        <Skeleton height="40px" width="48%" />
      </SkeletonRow>
      <Skeleton height="60px" />
    </CardContainer>
  )
}

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.base};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
`

const SkeletonRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: space-between;
`

/**
 * 통계 카드 스켈레톤
 */
export function StatsCardSkeleton() {
  return (
    <CardContainer>
      <SkeletonRow>
        <Skeleton height="18px" width="40%" />
        <Skeleton height="18px" width="30%" />
      </SkeletonRow>
      <Skeleton height="8px" />
      <Skeleton height="14px" width="50%" />
      <SkeletonRow>
        <Skeleton height="14px" width="30%" />
        <Skeleton height="14px" width="30%" />
      </SkeletonRow>
      <SkeletonRow>
        <Skeleton height="14px" width="35%" />
        <Skeleton height="14px" width="35%" />
      </SkeletonRow>
      <Skeleton height="12px" width="60%" />
    </CardContainer>
  )
}
