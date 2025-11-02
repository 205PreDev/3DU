import { useState } from 'react'
import styled from 'styled-components'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

type HelpTab = 'start' | 'shortcuts' | 'faq'

/**
 * 도움말 모달
 * 시작하기, 키보드 단축키, FAQ 탭 제공
 */
export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<HelpTab>('start')

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>❓ 도움말</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <TabHeader>
          <TabButton
            $active={activeTab === 'start'}
            onClick={() => setActiveTab('start')}
          >
            시작하기
          </TabButton>
          <TabButton
            $active={activeTab === 'shortcuts'}
            onClick={() => setActiveTab('shortcuts')}
          >
            키보드 단축키
          </TabButton>
          <TabButton
            $active={activeTab === 'faq'}
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </TabButton>
        </TabHeader>

        <Content>
          {activeTab === 'start' && <StartGuide />}
          {activeTab === 'shortcuts' && <KeyboardShortcuts />}
          {activeTab === 'faq' && <FAQ />}
        </Content>
      </Modal>
    </Overlay>
  )
}

function StartGuide() {
  return (
    <Section>
      <SectionTitle>🚀 시작하기</SectionTitle>
      <Step>
        <StepNumber>1</StepNumber>
        <StepContent>
          <StepTitle>파라미터 입력</StepTitle>
          <StepDescription>
            좌측 "파라미터" 탭에서 공의 물성, 투구 조건, 환경 변수를 입력하세요.
            예시 버튼을 클릭하면 투구 폼별 기본값이 자동 입력됩니다.
          </StepDescription>
        </StepContent>
      </Step>

      <Step>
        <StepNumber>2</StepNumber>
        <StepContent>
          <StepTitle>시뮬레이션 실행</StepTitle>
          <StepDescription>
            "시뮬레이션 시작" 버튼을 클릭하면 공의 궤적이 3D로 표시됩니다.
            실시간으로 공의 움직임을 관찰할 수 있습니다.
          </StepDescription>
        </StepContent>
      </Step>

      <Step>
        <StepNumber>3</StepNumber>
        <StepContent>
          <StepTitle>결과 확인</StepTitle>
          <StepDescription>
            "결과" 탭에서 스트라이크 판정, 수평/수직 변화량 등을 확인하세요.
            카메라 시점을 변경하거나 리플레이로 천천히 분석할 수 있습니다.
          </StepDescription>
        </StepContent>
      </Step>
    </Section>
  )
}

function KeyboardShortcuts() {
  return (
    <Section>
      <SectionTitle>⌨️ 키보드 단축키</SectionTitle>

      <ShortcutGroup>
        <GroupTitle>시뮬레이션</GroupTitle>
        <ShortcutItem>
          <Key>Space</Key>
          <ShortcutDesc>시작 / 정지</ShortcutDesc>
        </ShortcutItem>
        <ShortcutItem>
          <Key>R</Key>
          <ShortcutDesc>리셋</ShortcutDesc>
        </ShortcutItem>
        <ShortcutItem>
          <Key>Esc</Key>
          <ShortcutDesc>중지</ShortcutDesc>
        </ShortcutItem>
      </ShortcutGroup>

      <ShortcutGroup>
        <GroupTitle>카메라</GroupTitle>
        <ShortcutItem>
          <Key>1</Key>
          <ShortcutDesc>포수 시점</ShortcutDesc>
        </ShortcutItem>
        <ShortcutItem>
          <Key>2</Key>
          <ShortcutDesc>측면 시점</ShortcutDesc>
        </ShortcutItem>
        <ShortcutItem>
          <Key>3</Key>
          <ShortcutDesc>투수 시점</ShortcutDesc>
        </ShortcutItem>
        <ShortcutItem>
          <Key>4</Key>
          <ShortcutDesc>추적 모드</ShortcutDesc>
        </ShortcutItem>
        <ShortcutItem>
          <Key>5</Key>
          <ShortcutDesc>자유 시점</ShortcutDesc>
        </ShortcutItem>
      </ShortcutGroup>

      <ShortcutGroup>
        <GroupTitle>리플레이</GroupTitle>
        <ShortcutItem>
          <Key>←</Key>
          <Key>→</Key>
          <ShortcutDesc>프레임 이동</ShortcutDesc>
        </ShortcutItem>
        <ShortcutItem>
          <Key>[</Key>
          <Key>]</Key>
          <ShortcutDesc>속도 조절</ShortcutDesc>
        </ShortcutItem>
        <ShortcutItem>
          <Key>,</Key>
          <Key>.</Key>
          <ShortcutDesc>0.1초 단위 이동</ShortcutDesc>
        </ShortcutItem>
      </ShortcutGroup>
    </Section>
  )
}

function FAQ() {
  return (
    <Section>
      <SectionTitle>💡 자주 묻는 질문</SectionTitle>

      <FAQItem>
        <Question>Q. 스트라이크 존 기준은 무엇인가요?</Question>
        <Answer>
          가로: ±0.22m (약 43cm), 세로: 0.5m ~ 1.1m 기준입니다.
          홈플레이트 통과 시점의 공의 위치로 판정합니다.
        </Answer>
      </FAQItem>

      <FAQItem>
        <Question>Q. 회전축(X/Y/Z)의 의미는 무엇인가요?</Question>
        <Answer>
          <AnswerList>
            <li><strong>X축 회전</strong>: 백스핀/탑스핀 (공이 떠오름/낙차)</li>
            <li><strong>Y축 회전</strong>: 좌우 변화 (슬라이더, 커브볼)</li>
            <li><strong>Z축 회전</strong>: 총알회전 (진행 방향 축, 궤적 변화 거의 없음)</li>
          </AnswerList>
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#aaa' }}>
            ※ Z축 회전은 실제 투구에서는 거의 사용되지 않습니다.
          </p>
        </Answer>
      </FAQItem>

      <FAQItem>
        <Question>Q. 환경 변수는 어떻게 설정하나요?</Question>
        <Answer>
          온도, 기압, 습도를 입력하면 공기 밀도가 자동 계산됩니다.
          중력은 지구 표준인 9.81 m/s²가 기본값입니다.
        </Answer>
      </FAQItem>

      <FAQItem>
        <Question>Q. 파라미터 값의 적절한 범위는?</Question>
        <Answer>
          <AnswerList>
            <li><strong>속도</strong>: 20~45 m/s (일반적인 야구 투구)</li>
            <li><strong>회전수</strong>: 1000~3000 rpm (구종별 차이)</li>
            <li><strong>각도</strong>: -5~5° (수평), -10~5° (수직)</li>
            <li><strong>릴리스 포인트</strong>: X: ±0.5m, Y: 1.5~2.5m, Z: ±0.3m</li>
            <li><strong>환경</strong>: 온도 -10~40°C, 기압 950~1050 hPa, 습도 0~100%</li>
          </AnswerList>
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#aaa' }}>
            ※ 범위 제한이 해제되어 있습니다. 극단적인 값은 비현실적인 결과를 초래할 수 있습니다.
          </p>
        </Answer>
      </FAQItem>

      <FAQItem>
        <Question>Q. 구종별 파라미터 예시를 알려주세요</Question>
        <Answer>
          <AnswerList>
            <li><strong>포심 패스트볼</strong>: 속도 40m/s, X축 +2400rpm (백스핀)</li>
            <li><strong>커브볼</strong>: 속도 30m/s, X축 -1500rpm (탑스핀), Y축 -1200rpm (3루 방향)</li>
            <li><strong>슬라이더</strong>: 속도 35m/s, X축 +1500rpm, Y축 -800rpm (3루 방향)</li>
            <li><strong>체인지업</strong>: 속도 32m/s, X축 +1200rpm (약한 백스핀)</li>
            <li><strong>싱커</strong>: 속도 38m/s, X축 -1500rpm (탑스핀, 낙차)</li>
          </AnswerList>
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#aaa' }}>
            ※ "파라미터" 탭의 "투구 폼 예시" 버튼을 클릭하면 자동으로 입력됩니다.
          </p>
        </Answer>
      </FAQItem>

      <FAQItem>
        <Question>Q. 비교 모드는 어떻게 사용하나요?</Question>
        <Answer>
          "비교" 탭에서 두 개의 시뮬레이션을 동시에 비교할 수 있습니다.
          파라미터 변화가 결과에 미치는 영향을 직관적으로 확인할 수 있습니다.
          (현재 구현 예정)
        </Answer>
      </FAQItem>
    </Section>
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
  max-height: 80vh;
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

const TabHeader = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: #16213e;
  border-bottom: 1px solid #2a2a3e;
`

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? '#4caf50' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : '#aaa'};
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#4caf50' : 'rgba(76, 175, 80, 0.2)'};
    color: #ffffff;
  }
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  color: #ffffff;

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

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const SectionTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #4caf50;
`

const Step = styled.div`
  display: flex;
  gap: 16px;
`

const StepNumber = styled.div`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4caf50;
  color: #ffffff;
  font-weight: 600;
  border-radius: 50%;
`

const StepContent = styled.div`
  flex: 1;
`

const StepTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 6px;
`

const StepDescription = styled.div`
  font-size: 14px;
  color: #ccc;
  line-height: 1.6;
`

const ShortcutGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const GroupTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #4caf50;
  margin-bottom: 4px;
`

const ShortcutItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #2a2a3e;

  &:last-child {
    border-bottom: none;
  }
`

const Key = styled.kbd`
  display: inline-block;
  padding: 4px 10px;
  background: #2a2a3e;
  border: 1px solid #4caf50;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  color: #4caf50;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
`

const ShortcutDesc = styled.div`
  flex: 1;
  font-size: 14px;
  color: #ccc;
`

const FAQItem = styled.div`
  padding: 16px;
  background: #16213e;
  border-radius: 8px;
  border-left: 3px solid #4caf50;
`

const Question = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 10px;
`

const Answer = styled.div`
  font-size: 14px;
  color: #ccc;
  line-height: 1.6;
`

const AnswerList = styled.ul`
  margin: 8px 0 0 0;
  padding-left: 20px;

  li {
    margin-bottom: 6px;
  }

  strong {
    color: #4caf50;
  }
`
