import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { ComparisonPanel } from './ComparisonPanel'
import { SpinAxisPanel } from './analysis/SpinAxisPanel'
import { ReleasePointPanel } from './analysis/ReleasePointPanel'
import { ImpactGroupPanel } from './analysis/ImpactGroupPanel'

/**
 * 분석 패널 - 시뮬레이션 결과 심층 분석
 * 실험 비교, 회전축 분석, 릴리즈 포인트 분석 통합
 */
export function AnalysisPanel() {
  return (
    <Container>
      <Header>
        <Title>시뮬레이션 분석</Title>
        <Description>
          시뮬레이션 결과를 다양한 관점에서 분석하고 비교해보세요
        </Description>
      </Header>

      <Section>
        <SectionTitle>회전축 분석</SectionTitle>
        <SectionDescription>공의 회전 방향과 구종별 회전축을 분석합니다</SectionDescription>
        <SpinAxisPanel />
      </Section>

      <Divider />

      <Section>
        <SectionTitle>릴리즈 포인트 분석</SectionTitle>
        <SectionDescription>여러 투구의 릴리즈 포인트를 기록하고 일관성을 분석합니다</SectionDescription>
        <ReleasePointPanel />
      </Section>

      <Divider />

      <Section>
        <SectionTitle>탄착군 분석</SectionTitle>
        <SectionDescription>투구의 도착 지점 분포를 분석하여 제어력을 평가합니다</SectionDescription>
        <ImpactGroupPanel />
      </Section>

      <Divider />

      <Section>
        <SectionTitle>실험 비교</SectionTitle>
        <SectionDescription>두 실험을 선택하여 파라미터와 결과를 비교합니다</SectionDescription>
        <ComparisonPanel />
      </Section>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${theme.spacing.base};
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 2px solid ${theme.colors.border.light};
`

const Title = styled.h2`
  margin: 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`

const Description = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
`

const SectionTitle = styled.h3`
  margin: 0;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: ${theme.colors.primary.gradient};
    border-radius: ${theme.borderRadius.sm};
  }
`

const SectionDescription = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
  line-height: ${theme.typography.lineHeight.relaxed};
`

const Divider = styled.div`
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    ${theme.colors.border.main} 20%,
    ${theme.colors.border.main} 80%,
    transparent
  );
  margin: ${theme.spacing.xl} 0;
  position: relative;

  &::after {
    content: '◆';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: ${theme.colors.background.secondary};
    padding: 0 ${theme.spacing.sm};
    color: ${theme.colors.border.main};
    font-size: ${theme.typography.fontSize.xs};
  }
`
