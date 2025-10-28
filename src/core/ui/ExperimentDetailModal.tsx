import styled from 'styled-components'
import { SupabaseExperiment } from '@/utils/supabaseExperiments'

interface ExperimentDetailModalProps {
  experiment: SupabaseExperiment | null
  onClose: () => void
}

/**
 * 실험 상세 보기 모달
 * 파라미터와 결과 수치를 자세히 표시
 */
export function ExperimentDetailModal({ experiment, onClose }: ExperimentDetailModalProps) {
  if (!experiment) return null

  const { params, result } = experiment

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>📊 실험 상세 정보</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Content>
          <ExperimentName>{experiment.name}</ExperimentName>
          <ExperimentDate>
            {new Date(experiment.created_at).toLocaleString('ko-KR')}
          </ExperimentDate>

          {/* 공 물성 */}
          <Section>
            <SectionTitle>⚾ 공 물성</SectionTitle>
            <ParamGrid>
              <ParamItem>
                <ParamLabel>질량</ParamLabel>
                <ParamValue>{params.ball.mass} kg</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>반지름</ParamLabel>
                <ParamValue>{params.ball.radius} m</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>항력계수</ParamLabel>
                <ParamValue>{params.ball.dragCoefficient}</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>양력계수</ParamLabel>
                <ParamValue>{params.ball.liftCoefficient}</ParamValue>
              </ParamItem>
            </ParamGrid>
          </Section>

          {/* 투구 조건 */}
          <Section>
            <SectionTitle>🎯 투구 조건</SectionTitle>
            <ParamGrid>
              <ParamItem>
                <ParamLabel>초기 속도</ParamLabel>
                <ParamValue>{params.initial.velocity} m/s</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>수평 각도</ParamLabel>
                <ParamValue>{params.initial.angle.horizontal}°</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>수직 각도</ParamLabel>
                <ParamValue>{params.initial.angle.vertical}°</ParamValue>
              </ParamItem>
            </ParamGrid>

            <SubTitle>회전 (rpm)</SubTitle>
            <ParamGrid>
              <ParamItem>
                <ParamLabel>X축</ParamLabel>
                <ParamValue>{params.initial.spin.x}</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>Y축</ParamLabel>
                <ParamValue>{params.initial.spin.y}</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>Z축</ParamLabel>
                <ParamValue>{params.initial.spin.z}</ParamValue>
              </ParamItem>
            </ParamGrid>

            <SubTitle>릴리스 포인트 (m)</SubTitle>
            <ParamGrid>
              <ParamItem>
                <ParamLabel>X (좌우)</ParamLabel>
                <ParamValue>{params.initial.releasePoint.x}</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>Y (높이)</ParamLabel>
                <ParamValue>{params.initial.releasePoint.y}</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>Z (앞뒤)</ParamLabel>
                <ParamValue>{params.initial.releasePoint.z}</ParamValue>
              </ParamItem>
            </ParamGrid>
          </Section>

          {/* 환경 변수 */}
          <Section>
            <SectionTitle>🌍 환경 변수</SectionTitle>
            <ParamGrid>
              <ParamItem>
                <ParamLabel>중력</ParamLabel>
                <ParamValue>{params.environment.gravity} m/s²</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>온도</ParamLabel>
                <ParamValue>{params.environment.temperature}°C</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>기압</ParamLabel>
                <ParamValue>{params.environment.pressure} hPa</ParamValue>
              </ParamItem>
              <ParamItem>
                <ParamLabel>습도</ParamLabel>
                <ParamValue>{params.environment.humidity}%</ParamValue>
              </ParamItem>
            </ParamGrid>
          </Section>

          {/* 시뮬레이션 결과 */}
          <Section>
            <SectionTitle>📈 시뮬레이션 결과</SectionTitle>
            <ResultGrid>
              <ResultItem $highlight={result.isStrike}>
                <ResultLabel>판정</ResultLabel>
                <ResultValue>{result.isStrike ? '⚾ 스트라이크' : '❌ 볼'}</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>비행 시간</ResultLabel>
                <ResultValue>{result.flightTime.toFixed(3)} 초</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>최고 높이</ResultLabel>
                <ResultValue>{result.maxHeight.toFixed(3)} m</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>플레이트 높이</ResultLabel>
                <ResultValue>{result.plateHeight.toFixed(3)} m</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>수평 변화</ResultLabel>
                <ResultValue>{result.horizontalBreak.toFixed(3)} m</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>수직 낙차</ResultLabel>
                <ResultValue>{result.verticalDrop.toFixed(3)} m</ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>최종 속도</ResultLabel>
                <ResultValue>
                  {Math.sqrt(
                    result.finalVelocity.x ** 2 +
                    result.finalVelocity.y ** 2 +
                    result.finalVelocity.z ** 2
                  ).toFixed(2)} m/s
                </ResultValue>
              </ResultItem>
              <ResultItem>
                <ResultLabel>궤적 포인트</ResultLabel>
                <ResultValue>{result.trajectory.length}개</ResultValue>
              </ResultItem>
            </ResultGrid>
          </Section>
        </Content>
      </Modal>
    </Overlay>
  )
}

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`

const Modal = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #2a2a3e;
`

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #4caf50;
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #ffffff;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(76, 175, 80, 0.2);
  }
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #16213e;
  }

  &::-webkit-scrollbar-thumb {
    background: #4caf50;
    border-radius: 4px;
  }
`

const ExperimentName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
`

const ExperimentDate = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 24px;
`

const Section = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: #16213e;
  border-radius: 8px;
  border-left: 3px solid #4caf50;
`

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #4caf50;
`

const SubTitle = styled.h5`
  margin: 16px 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
`

const ParamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`

const ParamItem = styled.div`
  padding: 8px;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 4px;
`

const ParamLabel = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
`

const ParamValue = styled.div`
  font-size: 14px;
  color: #ffffff;
  font-weight: 600;
`

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`

const ResultItem = styled.div<{ $highlight?: boolean }>`
  padding: 12px;
  background: ${props => props.$highlight
    ? 'rgba(76, 175, 80, 0.2)'
    : 'rgba(76, 175, 80, 0.05)'};
  border-radius: 4px;
  border: ${props => props.$highlight ? '1px solid #4caf50' : 'none'};
`

const ResultLabel = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 6px;
`

const ResultValue = styled.div`
  font-size: 16px;
  color: #ffffff;
  font-weight: 600;
`
