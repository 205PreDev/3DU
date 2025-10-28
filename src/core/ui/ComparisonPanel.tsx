import styled from 'styled-components'

/**
 * 비교 모드 패널 (플레이스홀더)
 * TODO: 설계 명세서 3.10 기준으로 구현 예정
 */
export function ComparisonPanel() {
  return (
    <Container>
      <Title>🔄 비교 모드</Title>
      <Description>
        두 개의 시뮬레이션을 동시에 비교할 수 있습니다.
      </Description>
      <ComingSoon>
        <Icon>🚧</Icon>
        <Text>구현 예정</Text>
      </ComingSoon>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #4caf50;
`

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: #ccc;
  line-height: 1.5;
`

const ComingSoon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  background: rgba(76, 175, 80, 0.1);
  border: 2px dashed #4caf50;
  border-radius: 8px;
`

const Icon = styled.div`
  font-size: 48px;
`

const Text = styled.div`
  font-size: 14px;
  color: #4caf50;
  font-weight: 600;
`
