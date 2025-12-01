import styled from 'styled-components'
import { theme } from '@/styles/theme'
// import { TabContainer, Tab } from '@/core/ui/TabContainer'
import { PitchInputPanel } from './PitchInputPanel'
// import { InverseKinematicsPanel } from '@/core/ui/parameters/InverseKinematicsPanel'
// import { SensitivityPanel } from '@/core/ui/parameters/SensitivityPanel'

/**
 * 파라미터 패널
 * - 수동 입력만 표시 (역운동학, 민감도 분석 비활성화)
 */
export function ParametersPanel() {
  // 탭 구조 비활성화 - 수동 입력만 표시
  // const parameterTabs: Tab[] = [
  //   {
  //     id: 'manual',
  //     label: '수동 입력',
  //     content: <PitchInputPanel />
  //   },
  //   {
  //     id: 'sensitivity',
  //     label: '📊 민감도 분석',
  //     content: <SensitivityPanel />
  //   }
  // ]

  return (
    <Container>
      <PitchInputPanel />
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

// const Header = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: ${theme.spacing.xs};
//   padding-bottom: ${theme.spacing.sm};
//   border-bottom: 1px solid ${theme.colors.border.light};
// `

// const Title = styled.h3`
//   margin: 0;
//   font-size: ${theme.typography.fontSize.md};
//   font-weight: ${theme.typography.fontWeight.semibold};
//   color: ${theme.colors.text.primary};
// `

// const Description = styled.p`
//   margin: 0;
//   font-size: ${theme.typography.fontSize.sm};
//   color: ${theme.colors.text.secondary};
//   line-height: ${theme.typography.lineHeight.relaxed};
// `
