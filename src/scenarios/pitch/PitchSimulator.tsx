import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { useSimulation } from '@/contexts/SimulationContext'
import { useComparison } from '@/contexts/ComparisonContext'
import { Scene3D } from '@/core/renderer/Scene3D'
import { Grid } from '@/core/renderer/Grid'
import { Field } from './Field'
import { Ball3D } from './Ball3D'
import { Pitcher3D } from './Pitcher3D'
import { TrajectoryLine, CompletedTrajectoryLine } from './TrajectoryLine'
import { PitchInputPanel } from './PitchInputPanel'
import { ResultPanel } from '@/core/ui/ResultPanel'
import { ReplayControls } from '@/core/ui/ReplayControls'
import { CameraPresetButtons } from '@/core/ui/CameraPresetButtons'
import { TopNavigationBar } from '@/core/ui/TopNavigationBar'
import { TabContainer, Tab } from '@/core/ui/TabContainer'
import { ComparisonPanel } from '@/core/ui/ComparisonPanel'
import { HelpModal } from '@/core/ui/HelpModal'
import { RecentExperimentsPanel } from '@/core/ui/RecentExperimentsPanel'
import { DebugPanel } from '@/core/ui/DebugPanel'
import { GraphicsSettingsPanel } from '@/core/ui/GraphicsSettingsPanel'
import { CameraController } from '@/core/renderer/CameraController'
import { Vector3, PitchParameters } from '@/types'
import { supabaseExperimentsService } from '@/utils/supabaseExperiments'
import { useGraphics } from '@/contexts/GraphicsContext'

/**
 * 투구 시뮬레이터 메인 컴포넌트
 */
export function PitchSimulator() {
  const {
    params,
    result,
    isReplaying,
    setIsReplaying,
    replayTime,
    setReplayTime,
    playbackSpeed,
    setPlaybackSpeed,
    cameraPreset,
    setCameraPreset,
    setParams
  } = useSimulation()
  const { settings } = useGraphics()
  const { experimentA, experimentB, isComparing } = useComparison()
  const [animationIndex, setAnimationIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasReachedPlate, setHasReachedPlate] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [showBall, setShowBall] = useState(false) // 공 표시 여부 (48프레임 후)
  const [pitcherStartTrigger, setPitcherStartTrigger] = useState(0) // 투수 애니메이션 시작 트리거

  // 시뮬레이션 결과가 나오면 투수 애니메이션 트리거 증가
  useEffect(() => {
    if (result && result.trajectory.length > 0) {
      setAnimationIndex(0)
      setIsAnimating(false) // 공 애니메이션은 아직 시작 안 함
      setHasReachedPlate(false)
      setShowBall(false) // 공 숨김
      setPitcherStartTrigger(prev => prev + 1) // 트리거 증가 → 투수 애니메이션 시작
    }
  }, [result])

  // 투수 릴리스 프레임 도달 시 콜백 (48프레임)
  const handlePitcherRelease = useCallback(() => {
    setShowBall(true) // 공 표시
    setIsAnimating(true) // 공 애니메이션 시작
  }, [])

  // 애니메이션 프레임 업데이트 (requestAnimationFrame 사용)
  useEffect(() => {
    if (!isAnimating || !result) return

    let animationFrameId: number
    let lastTimestamp = 0

    const animate = (timestamp: number) => {
      // targetFps에 따라 프레임 간격 조정
      const frameInterval = 1000 / settings.targetFps

      if (timestamp - lastTimestamp >= frameInterval) {
        lastTimestamp = timestamp

        setAnimationIndex(prev => {
          const nextIndex = prev + 1  // 모든 포인트 표시 (부드러운 애니메이션)

          // 궤적 끝 도달 시 멈춤
          if (nextIndex >= result.trajectory.length - 1) {
            setIsAnimating(false)
            return result.trajectory.length - 1
          }

          // 스트라이크존(X축) 통과 체크
          const nextPos = result.trajectory[nextIndex]
          if (nextPos && nextPos.z <= -18.44) {
            setIsAnimating(false)  // 스트라이크존 도달 시 멈춤
            return nextIndex
          }

          return nextIndex
        })
      }

      if (isAnimating) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isAnimating, result, settings.targetFps])

  // 스트라이크 존 통과 체크
  useEffect(() => {
    if (!result) return
    const currentPos = result.trajectory[animationIndex]
    if (currentPos && currentPos.z <= -18.44 && !hasReachedPlate) {
      setHasReachedPlate(true)
    }
  }, [animationIndex, result, hasReachedPlate])

  // 리플레이 모드에서 시간 → 인덱스 변환
  const replayIndex = useMemo(() => {
    if (!result || !isReplaying) return animationIndex
    return Math.floor(replayTime * 30)  // 30fps 가정
  }, [result, isReplaying, replayTime, animationIndex])

  const currentIndex = isReplaying ? replayIndex : animationIndex

  const currentPosition: Vector3 = result && result.trajectory[currentIndex]
    ? result.trajectory[currentIndex]
    : { x: 0, y: 2, z: 0 }

  const currentTrajectory = result
    ? result.trajectory.slice(0, currentIndex + 1)
    : []

  const completedTrajectory = result && !isAnimating && !isReplaying
    ? result.trajectory
    : []

  const handleBack = () => {
    // TODO: 시나리오 선택 화면으로 이동 (라우터 구현 후)
    console.log('뒤로가기 클릭')
  }

  const handleHelpClick = () => {
    setIsHelpModalOpen(true)
  }

  // 실험 저장
  const handleSaveExperiment = async (name: string) => {
    if (result) {
      await supabaseExperimentsService.save(name, params, result)
    }
  }

  // 실험 불러오기
  const handleLoadExperiment = (loadedParams: PitchParameters) => {
    setParams(loadedParams)
  }

  // 키보드 단축키 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 모달이 열려있거나 input에 포커스된 경우 무시
      if (isHelpModalOpen || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        // 시뮬레이션 제어
        case ' ':
          e.preventDefault()
          if (result) {
            setIsReplaying(prev => {
              // 리플레이 시작 시 현재 애니메이션 위치를 replayTime으로 동기화
              if (!prev) {
                const currentTime = animationIndex / 30  // 30fps 가정
                setReplayTime(currentTime)
              }
              return !prev
            })
          }
          break
        case 'r':
          e.preventDefault()
          // TODO: reset 기능 구현
          break
        case 'escape':
          e.preventDefault()
          setIsAnimating(false)
          setIsReplaying(false)
          break

        // 카메라 프리셋
        case '1':
          e.preventDefault()
          setCameraPreset('catcher')
          break
        case '2':
          e.preventDefault()
          setCameraPreset('side')
          break
        case '3':
          e.preventDefault()
          setCameraPreset('pitcher')
          break
        case '4':
          e.preventDefault()
          setCameraPreset('follow')
          break
        case '5':
          e.preventDefault()
          setCameraPreset('free')
          break

        // 리플레이 제어
        case 'arrowleft':
          e.preventDefault()
          if (result && isReplaying) {
            setReplayTime(prev => Math.max(0, prev - 0.1))
          }
          break
        case 'arrowright':
          e.preventDefault()
          if (result && isReplaying) {
            const maxTime = result.trajectory.length / 30
            setReplayTime(prev => Math.min(maxTime, prev + 0.1))
          }
          break
        case '[':
          e.preventDefault()
          if (result) {
            setPlaybackSpeed(prev => Math.max(0.25, prev - 0.25))
          }
          break
        case ']':
          e.preventDefault()
          if (result) {
            setPlaybackSpeed(prev => Math.min(2.0, prev + 0.25))
          }
          break
        case ',':
          e.preventDefault()
          if (result) {
            setPlaybackSpeed(0.5)
          }
          break
        case '.':
          e.preventDefault()
          if (result) {
            setPlaybackSpeed(1.0)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [result, isReplaying, isHelpModalOpen, setIsReplaying, setReplayTime, setPlaybackSpeed, setCameraPreset, animationIndex])

  // 우측 패널 탭 구성
  const rightPanelTabs: Tab[] = [
    {
      id: 'parameters',
      label: '파라미터',
      content: <PitchInputPanel />
    },
    {
      id: 'results',
      label: '결과',
      content: (
        <ResultsTabContent>
          <CameraPresetButtons
            currentPreset={cameraPreset}
            onPresetChange={setCameraPreset}
          />
          {result && result.trajectory.length > 0 && (
            <ReplayControls
              trajectory={result.trajectory}
              onTimeChange={setReplayTime}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
              isPlaying={isReplaying}
              onPlayingChange={setIsReplaying}
            />
          )}
          <ResultPanel result={hasReachedPlate ? result : null} />
        </ResultsTabContent>
      )
    },
    {
      id: 'recent',
      label: '최근 실험',
      content: (
        <RecentExperimentsPanel
          onLoad={handleLoadExperiment}
          onSave={handleSaveExperiment}
        />
      )
    },
    {
      id: 'comparison',
      label: '비교',
      content: <ComparisonPanel />
    },
    {
      id: 'debug',
      label: '디버그',
      content: <DebugPanel />
    },
    {
      id: 'graphics',
      label: '그래픽',
      content: <GraphicsSettingsPanel />
    }
  ]

  return (
    <Container>
      <TopNavigationBar
        scenarioName="야구 투구 시뮬레이터"
        onBack={handleBack}
        onHelpClick={handleHelpClick}
      />

      <MainContent>
        <ViewerSection>
          <Scene3D cameraPreset={cameraPreset}>
            <Grid />
            <Field />

            {/* 투수 모델 */}
            {!isComparing && (
              <Pitcher3D
                params={params}
                startTrigger={pitcherStartTrigger}
                animationProgress={
                  result && result.trajectory.length > 0
                    ? Math.min(1.0, animationIndex / (result.trajectory.length * 0.2))
                    : 0
                }
                onReleaseFrame={handlePitcherRelease}
              />
            )}

            {/* 카메라 제어 */}
            <CameraController preset={cameraPreset} ballPosition={currentPosition} />

            {isComparing ? (
              <>
                {/* 비교 모드: 2개 궤적 동시 표시 */}
                {experimentA && (
                  <TrajectoryLine
                    points={experimentA.result.trajectory}
                    color="#4444ff"
                    lineWidth={3}
                  />
                )}
                {experimentB && (
                  <TrajectoryLine
                    points={experimentB.result.trajectory}
                    color="#ff4444"
                    lineWidth={3}
                  />
                )}
              </>
            ) : (
              <>
                {/* 일반 모드 - 공은 48프레임 후에만 표시 */}
                {showBall && <Ball3D position={currentPosition} />}

                {/* 진행 중인 궤적 */}
                {showBall && (isAnimating || isReplaying) && currentTrajectory.length > 1 && (
                  <TrajectoryLine points={currentTrajectory} />
                )}

                {/* 완료된 궤적 */}
                {showBall && !isAnimating && !isReplaying && completedTrajectory.length > 1 && (
                  <CompletedTrajectoryLine points={completedTrajectory} />
                )}
              </>
            )}
          </Scene3D>
        </ViewerSection>

        <ControlPanel>
          <TabContainer tabs={rightPanelTabs} defaultTab="parameters" />
        </ControlPanel>
      </MainContent>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: #16213e;
  box-sizing: border-box;
`

const MainContent = styled.div`
  display: flex;
  flex: 1;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
`

const ViewerSection = styled.div`
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  position: relative;
`

const ControlPanel = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  height: 100%;
`

const ResultsTabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`
