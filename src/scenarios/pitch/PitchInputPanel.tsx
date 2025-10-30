import { useState } from 'react'
import styled from 'styled-components'
import { useSimulation } from '@/contexts/SimulationContext'
import { useGraphics } from '@/contexts/GraphicsContext'
import { PitchParameters } from '@/types'

// 파라미터 설명
const PARAM_TOOLTIPS: Record<string, { description: string; effect: string }> = {
  velocity: {
    description: '공의 초기 속도',
    effect: '↑ 빠를수록 빠르게 도달, 낙차 감소'
  },
  horizontal: {
    description: '좌우 방향 각도',
    effect: '↑ 양수: 우측, 음수: 좌측으로 이동'
  },
  vertical: {
    description: '상하 방향 각도',
    effect: '↑ 양수: 위로, 음수: 아래로 발사'
  },
  spinX: {
    description: 'X축 회전 (백스핀/탑스핀)',
    effect: '↑ 양수: 백스핀 (떠오름, 포심), 음수: 탑스핀 (낙차, 싱커)'
  },
  spinY: {
    description: 'Y축 회전 (좌우 변화)',
    effect: '↑ 양수: 1루 방향, 음수: 3루 방향 (슬라이더/커브)'
  },
  spinZ: {
    description: 'Z축 회전 (총알회전)',
    effect: '↑ 진행 방향 축 회전 (궤적 변화 거의 없음, 교육용)'
  },
  releaseX: {
    description: '릴리스 포인트 X축 (좌우)',
    effect: '↑ 양수: 1루 쪽, 음수: 3루 쪽 (우완/좌완 구분)'
  },
  releaseY: {
    description: '릴리스 포인트 Y축 (높이)',
    effect: '↑ 높을수록 위에서 떨어지는 효과'
  },
  releaseZ: {
    description: '릴리스 포인트 Z축 (앞뒤)',
    effect: '↑ 양수: 타자 쪽, 음수: 마운드 뒤쪽'
  },
  gravity: {
    description: '중력 가속도',
    effect: '↑ 클수록 빠르게 낙하'
  },
  temperature: {
    description: '온도 (공기 밀도에 영향)',
    effect: '↑ 높을수록 공기 밀도 감소, 변화 감소'
  },
  pressure: {
    description: '기압 (공기 밀도에 영향)',
    effect: '↑ 높을수록 공기 밀도 증가, 변화 증가'
  },
  humidity: {
    description: '상대 습도',
    effect: '↑ 높을수록 공기 밀도 약간 감소'
  },
  mass: {
    description: '공의 질량',
    effect: '↑ 무거울수록 관성 증가, 변화 감소'
  },
  radius: {
    description: '공의 반지름',
    effect: '↑ 클수록 공기 저항 증가'
  },
  dragCoef: {
    description: '항력 계수',
    effect: '↑ 클수록 속도 감소가 큼'
  },
  liftCoef: {
    description: '양력 계수',
    effect: '↑ 클수록 마그누스 효과 증가'
  }
}

// 투구 폼별 예시 데이터 (릴리스 포인트 포함)
// spinX: 백스핀/탑스핀, spinY: 좌우변화, spinZ: 총알회전
const PITCH_FORM_EXAMPLES = {
  overhandRight: {
    name: '오버핸드 우완 (포심)',
    releaseX: 0.4, releaseY: 2.0, releaseZ: 0.0,
    velocity: 40, horizontal: 0, vertical: -2, spinX: 2400, spinY: 0, spinZ: 0
  },
  sidearmRight: {
    name: '사이드암 우완 (슬라이더)',
    releaseX: 0.5, releaseY: 1.5, releaseZ: 0.0,
    velocity: 38, horizontal: -1, vertical: -1, spinX: 1500, spinY: -800, spinZ: 0
  },
  underhandRight: {
    name: '언더핸드 우완',
    releaseX: 0.3, releaseY: 1.2, releaseZ: 0.0,
    velocity: 35, horizontal: 0, vertical: 1, spinX: 2200, spinY: 0, spinZ: 0
  },
  overhandLeft: {
    name: '오버핸드 좌완 (포심)',
    releaseX: -0.4, releaseY: 2.0, releaseZ: 0.0,
    velocity: 40, horizontal: 0, vertical: -2, spinX: 2400, spinY: 0, spinZ: 0
  },
  sliderLeft: {
    name: '좌완 슬라이더',
    releaseX: -0.4, releaseY: 1.9, releaseZ: 0.2,
    velocity: 35, horizontal: 2, vertical: -3, spinX: 1500, spinY: 800, spinZ: 0
  }
}

/**
 * 투구 파라미터 입력 패널 (v3: 프리셋 제거, 직접 입력)
 */
export function PitchInputPanel() {
  const { params, setParams, runSimulation, isSimulating } = useSimulation()
  const { settings } = useGraphics()
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)

  const handleRunSimulation = () => {
    runSimulation(settings.trajectoryDt)
  }

  const handleInputChange = (category: keyof PitchParameters, field: string, value: number) => {
    setParams({
      [category]: {
        ...params[category],
        [field]: value
      }
    })
  }

  const handleSpinChange = (axis: 'x' | 'y' | 'z', value: number) => {
    setParams({
      initial: {
        ...params.initial,
        spin: {
          ...params.initial.spin,
          [axis]: value
        }
      }
    })
  }

  const handleAngleChange = (type: 'horizontal' | 'vertical', value: number) => {
    setParams({
      initial: {
        ...params.initial,
        angle: {
          ...params.initial.angle,
          [type]: value
        }
      }
    })
  }

  const handleReleasePointChange = (axis: 'x' | 'y' | 'z', value: number) => {
    setParams({
      initial: {
        ...params.initial,
        releasePoint: {
          ...params.initial.releasePoint,
          [axis]: value
        }
      }
    })
  }

  const applyFormExample = (formKey: keyof typeof PITCH_FORM_EXAMPLES) => {
    const example = PITCH_FORM_EXAMPLES[formKey]
    setParams({
      initial: {
        ...params.initial,
        velocity: example.velocity,
        angle: { horizontal: example.horizontal, vertical: example.vertical },
        spin: { x: example.spinX, y: example.spinY, z: example.spinZ },
        releasePoint: { x: example.releaseX, y: example.releaseY, z: example.releaseZ }
      }
    })
  }

  return (
    <Panel>
      <Header>
        <Title>투구 파라미터 입력</Title>
      </Header>

      <InputSection>
        {/* 투구 조건 */}
        <SectionHeader>
          <SectionTitle>투구 조건</SectionTitle>
          <ExampleButton onClick={() => setShowExamples(!showExamples)}>
            {showExamples ? '예시 닫기' : '입력 예시'}
          </ExampleButton>
        </SectionHeader>

        {showExamples && (
          <ExamplePanel>
            <ExampleTitle>투구 폼별 예시 (클릭하여 적용)</ExampleTitle>
            {Object.entries(PITCH_FORM_EXAMPLES).map(([key, form]) => (
              <ExampleRow
                key={key}
                onClick={() => applyFormExample(key as keyof typeof PITCH_FORM_EXAMPLES)}
                style={{ cursor: 'pointer' }}
              >
                <ExampleLabel>{form.name}</ExampleLabel>
                <ExampleValues>
                  릴리스:({form.releaseX},{form.releaseY},{form.releaseZ})
                  속도:{form.velocity} 각도:({form.horizontal},{form.vertical})
                </ExampleValues>
              </ExampleRow>
            ))}
            <ExampleNote>💡 우완/좌완 릴리스 포인트 차이로 마그누스 효과가 극적으로 변합니다</ExampleNote>
          </ExamplePanel>
        )}

        <InputGroup>
          <LabelWithTooltip
            label="초기 속도 (m/s)"
            tooltipKey="velocity"
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
          />
          <Input
            type="number"
            value={params.initial.velocity}
            onChange={(e) => handleInputChange('initial', 'velocity', Number(e.target.value))}
            step="0.1"
          />
        </InputGroup>

        <InputGroup>
          <LabelWithTooltip
            label="수평각 (°)"
            tooltipKey="horizontal"
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
          />
          <Input
            type="number"
            value={params.initial.angle.horizontal}
            onChange={(e) => handleAngleChange('horizontal', Number(e.target.value))}
            step="0.1"
          />
        </InputGroup>

        <InputGroup>
          <LabelWithTooltip
            label="수직각 (°)"
            tooltipKey="vertical"
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
          />
          <Input
            type="number"
            value={params.initial.angle.vertical}
            onChange={(e) => handleAngleChange('vertical', Number(e.target.value))}
            step="0.1"
          />
        </InputGroup>

        <InputGroup>
          <LabelWithTooltip
            label="회전 (rpm)"
            tooltipKey="spinY"
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
          />
          <SpinInputs>
            <div>
              <AxisLabel>X축 (좌우)</AxisLabel>
              <SmallInput
                type="number"
                value={params.initial.spin.x}
                onChange={(e) => handleSpinChange('x', Number(e.target.value))}
                step="10"
              />
            </div>
            <div>
              <AxisLabel>Y축 (상하)</AxisLabel>
              <SmallInput
                type="number"
                value={params.initial.spin.y}
                onChange={(e) => handleSpinChange('y', Number(e.target.value))}
                step="10"
              />
            </div>
            <div>
              <AxisLabel>Z축 (전후)</AxisLabel>
              <SmallInput
                type="number"
                value={params.initial.spin.z}
                onChange={(e) => handleSpinChange('z', Number(e.target.value))}
                step="10"
              />
            </div>
          </SpinInputs>
        </InputGroup>

        <InputGroup>
          <LabelWithTooltip
            label="릴리스 포인트 (m)"
            tooltipKey="releaseY"
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
          />
          <SpinInputs>
            <div>
              <AxisLabel>X축 (좌우)</AxisLabel>
              <SmallInput
                type="number"
                value={params.initial.releasePoint.x}
                onChange={(e) => handleReleasePointChange('x', Number(e.target.value))}
                step="0.1"
              />
            </div>
            <div>
              <AxisLabel>Y축 (높이)</AxisLabel>
              <SmallInput
                type="number"
                value={params.initial.releasePoint.y}
                onChange={(e) => handleReleasePointChange('y', Number(e.target.value))}
                step="0.1"
              />
            </div>
            <div>
              <AxisLabel>Z축 (앞뒤)</AxisLabel>
              <SmallInput
                type="number"
                value={params.initial.releasePoint.z}
                onChange={(e) => handleReleasePointChange('z', Number(e.target.value))}
                step="0.1"
              />
            </div>
          </SpinInputs>
        </InputGroup>

        {/* 공 물성 */}
        <SectionTitle>공 물성</SectionTitle>

        <InputGroup>
          <LabelWithTooltip label="질량 (kg)" tooltipKey="mass" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Input type="number" value={params.ball.mass} onChange={(e) => handleInputChange('ball', 'mass', Number(e.target.value))} step="0.001" />
        </InputGroup>

        <InputGroup>
          <LabelWithTooltip label="반지름 (m)" tooltipKey="radius" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Input type="number" value={params.ball.radius} onChange={(e) => handleInputChange('ball', 'radius', Number(e.target.value))} step="0.001" />
        </InputGroup>

        <InputGroup>
          <LabelWithTooltip label="항력 계수" tooltipKey="dragCoef" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Input type="number" value={params.ball.dragCoefficient} onChange={(e) => handleInputChange('ball', 'dragCoefficient', Number(e.target.value))} step="0.01" />
        </InputGroup>

        <InputGroup>
          <LabelWithTooltip label="양력 계수" tooltipKey="liftCoef" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Input type="number" value={params.ball.liftCoefficient} onChange={(e) => handleInputChange('ball', 'liftCoefficient', Number(e.target.value))} step="0.01" />
        </InputGroup>

        {/* 환경 변수 */}
        <SectionTitle>환경 변수</SectionTitle>

        <InputGroup>
          <LabelWithTooltip label="중력 (m/s²)" tooltipKey="gravity" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Input type="number" value={params.environment.gravity} onChange={(e) => handleInputChange('environment', 'gravity', Number(e.target.value))} step="0.01" />
        </InputGroup>

        <InputGroup>
          <LabelWithTooltip label="온도 (°C)" tooltipKey="temperature" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Input type="number" value={params.environment.temperature} onChange={(e) => handleInputChange('environment', 'temperature', Number(e.target.value))} step="0.1" />
        </InputGroup>

        <InputGroup>
          <LabelWithTooltip label="기압 (hPa)" tooltipKey="pressure" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Input type="number" value={params.environment.pressure} onChange={(e) => handleInputChange('environment', 'pressure', Number(e.target.value))} step="1" />
        </InputGroup>

        <InputGroup>
          <LabelWithTooltip label="습도 (%)" tooltipKey="humidity" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Input type="number" value={params.environment.humidity} onChange={(e) => handleInputChange('environment', 'humidity', Number(e.target.value))} step="1" />
        </InputGroup>

        <InfoText>
          물리 파라미터를 직접 입력하여 투구 궤적을 시뮬레이션합니다.
        </InfoText>
      </InputSection>

      <SimulateButton onClick={handleRunSimulation} disabled={isSimulating}>
        {isSimulating ? '시뮬레이션 중...' : '⚾ 시뮬레이션 시작'}
      </SimulateButton>
    </Panel>
  )
}

// 툴팁이 있는 라벨 컴포넌트
function LabelWithTooltip({
  label,
  tooltipKey,
  activeTooltip,
  setActiveTooltip
}: {
  label: string
  tooltipKey: string
  activeTooltip: string | null
  setActiveTooltip: (key: string | null) => void
}) {
  const tooltip = PARAM_TOOLTIPS[tooltipKey]
  const isActive = activeTooltip === tooltipKey

  return (
    <LabelContainer>
      <InputLabel>{label}</InputLabel>
      <TooltipIcon
        onMouseEnter={() => setActiveTooltip(tooltipKey)}
        onMouseLeave={() => setActiveTooltip(null)}
      >
        ?
        {isActive && tooltip && (
          <TooltipContent>
            <TooltipTitle>{tooltip.description}</TooltipTitle>
            <TooltipEffect>{tooltip.effect}</TooltipEffect>
          </TooltipContent>
        )}
      </TooltipIcon>
    </LabelContainer>
  )
}

// v2: SimpleModeInputs, AdvancedModeInputs 제거 (단일 모드 통합)

const Panel = styled.div`
  background: #2a2a3e;
  border-radius: 8px;
  padding: 20px;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`

// v2: ModeToggle, ModeButton 제거 (단일 모드)

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #ccc;
`

const TooltipIcon = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #888;
  background: #1a1a2e;
  color: #888;
  font-size: 11px;
  font-weight: 700;
  cursor: help;
  user-select: none;

  &:hover {
    border-color: #4caf50;
    color: #4caf50;
  }
`

const TooltipContent = styled.div`
  position: absolute;
  left: 20px;
  top: -8px;
  background: #1a1a2e;
  border: 1px solid #4caf50;
  border-radius: 6px;
  padding: 10px;
  min-width: 200px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  pointer-events: none;
`

const TooltipTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
`

const TooltipEffect = styled.div`
  font-size: 11px;
  color: #4caf50;
  line-height: 1.4;
`

const AxisLabel = styled.div`
  font-size: 10px;
  color: #888;
  text-align: center;
  margin-bottom: 4px;
`

// v3: 프리셋 관련 스타일 제거 (PresetGrid, PresetButton)

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #4caf50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const ExampleButton = styled.button`
  padding: 4px 10px;
  font-size: 11px;
  border: 1px solid #4caf50;
  border-radius: 4px;
  background: transparent;
  color: #4caf50;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4caf50;
    color: #fff;
  }
`

const ExamplePanel = styled.div`
  background: #1a1a2e;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
`

const ExampleTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #ccc;
  margin-bottom: 8px;
`

const ExampleRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #333;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #252540;
  }

  &:last-child {
    border-bottom: none;
  }
`

const ExampleLabel = styled.span`
  font-size: 11px;
  color: #888;
  min-width: 60px;
`

const ExampleValues = styled.span`
  font-size: 11px;
  color: #4caf50;
  font-family: monospace;
`

const ExampleNote = styled.div`
  margin-top: 12px;
  padding: 8px;
  background: #1a1a2e;
  border-left: 3px solid #4caf50;
  font-size: 11px;
  color: #ccc;
  line-height: 1.4;
`

const Input = styled.input`
  padding: 10px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #1a1a2e;
  color: #ffffff;
  font-size: 14px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`

const SpinInputs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`

const SmallInput = styled(Input)`
  text-align: center;
`

const InfoText = styled.p`
  margin: 0;
  padding: 12px;
  background: #1a1a2e;
  border-radius: 4px;
  font-size: 12px;
  color: #888;
  line-height: 1.5;
`

const SimulateButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
