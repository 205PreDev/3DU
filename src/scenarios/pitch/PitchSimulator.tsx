import { useState, useEffect, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useSimulation } from '@/contexts/SimulationContext'
import { useComparison } from '@/contexts/ComparisonContext'
import { debugConfig } from '@/core/ui/DebugPanel'
import { Scene3D } from '@/core/renderer/Scene3D'
import { Grid } from '@/core/renderer/Grid'
import { Field } from './Field'
import { Ball3D } from './Ball3D'
import { Pitcher3D } from './Pitcher3D'
import { TrajectoryLine, CompletedTrajectoryLine } from './TrajectoryLine'
import { ForceVectors3D } from './ForceVectors3D'
import { PlateMarker } from './PlateMarker'
import { PitchInputPanel } from './PitchInputPanel'
import { ResultPanel } from '@/core/ui/ResultPanel'
import { ReplayControls } from '@/core/ui/ReplayControls'
import { CameraPresetButtons } from '@/core/ui/CameraPresetButtons'
import { TopNavigationBar } from '@/core/ui/TopNavigationBar'
import { TabContainer, Tab } from '@/core/ui/TabContainer'
import { ComparisonPanel } from '@/core/ui/ComparisonPanel'
import { HelpModal } from '@/core/ui/HelpModal'
import { AccountModal } from '@/core/ui/AccountModal'
import { RecentExperimentsPanel } from '@/core/ui/RecentExperimentsPanel'
import { DebugPanel } from '@/core/ui/DebugPanel'
import { GraphicsSettingsPanel } from '@/core/ui/GraphicsSettingsPanel'
import { EnjoyPanel } from '@/core/ui/EnjoyPanel'
import { CameraController } from '@/core/renderer/CameraController'
import { Vector3, PitchParameters } from '@/types'
import { supabaseExperimentsService } from '@/utils/supabaseExperiments'

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
  const {
    experimentA,
    experimentB,
    isComparing,
    stopComparison,
    showForceVectors: comparisonShowForceVectors,
    comparisonReplayTime
  } = useComparison()
  const [hasReachedPlate, setHasReachedPlate] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [showBall, setShowBall] = useState(false) // 공 표시 여부 (48프레임 후)
  const [pitcherStartTrigger, setPitcherStartTrigger] = useState(0) // 투수 애니메이션 시작 트리거
  const [showForceVectors, setShowForceVectors] = useState(false) // 힘 벡터 표시 여부
  const [activeTab, setActiveTab] = useState('parameters') // 현재 활성 탭

  // 시뮬레이션 결과가 나오면 초기화
  useEffect(() => {
    if (result && result.trajectory.length > 0) {
      setReplayTime(0)
      setIsReplaying(false) // 자동 재생 시작
      setHasReachedPlate(false)
      setShowBall(false) // 공 숨김
      setShowForceVectors(false) // 힘 벡터 숨김
      setPitcherStartTrigger(prev => prev + 1) // 투수 애니메이션 시작
    }
  }, [result, setReplayTime, setIsReplaying])

  // 투수 릴리스 프레임 도달 시 콜백 (48프레임)
  const handlePitcherRelease = useCallback(() => {
    setShowBall(true) // 공 표시
    setIsReplaying(true) // 자동 재생 시작
  }, [setIsReplaying])

  // 자동 재생 (isReplaying = true일 때 replayTime 자동 증가)
  useEffect(() => {
    if (!isReplaying || !result) return

    let animationFrameId: number
    let lastTimestamp = performance.now()

    const animate = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000 // 초 단위
      lastTimestamp = timestamp

      setReplayTime(prev => {
        const maxTime = result.trajectory.length / 30
        const next = prev + delta * playbackSpeed

        // 끝 도달 시 일시정지
        if (next >= maxTime) {
          setIsReplaying(false)
          return maxTime
        }

        // 스트라이크 존 통과 시 일시정지
        const nextIndex = Math.floor(next * 30)
        const nextPos = result.trajectory[nextIndex]
        if (nextPos && nextPos.position.z <= -18.44) {
          setIsReplaying(false)
          setHasReachedPlate(true)
          return next
        }

        return next
      })

      if (isReplaying) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isReplaying, result, playbackSpeed, setReplayTime, setIsReplaying])

  // 시간 → 인덱스 변환
  const currentIndex = useMemo(() => {
    if (!result) return 0
    const idx = Math.floor(replayTime * 30)  // 30fps 가정
    if (debugConfig.replay) {
      console.log(`🎬 REPLAY | time: ${replayTime.toFixed(2)}s → index: ${idx} | playing: ${isReplaying}`)
    }
    return idx
  }, [result, replayTime, isReplaying])

  const currentTrajectoryPoint = result && result.trajectory[currentIndex]
    ? result.trajectory[currentIndex]
    : null

  const currentPosition: Vector3 = currentTrajectoryPoint?.position || { x: 0, y: 2, z: 0 }

  const currentTrajectory = result
    ? result.trajectory.slice(0, currentIndex + 1)
    : []

  // 재생 중지 시 전체 궤적 표시
  const completedTrajectory = result && !isReplaying && currentIndex >= result.trajectory.length - 1
    ? result.trajectory
    : []

  const handleHelpClick = () => {
    setIsHelpModalOpen(true)
  }

  const handleUserClick = () => {
    setIsAccountModalOpen(true)
  }

  const handleChallengeClick = () => {
    setActiveTab('enjoy')
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

  // 탭 변경 핸들러
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)

    if (tabId === 'results' && result) {
      // "결과" 탭 진입 시 현재 위치 유지
      // replayTime과 isReplaying은 그대로 유지 (아무것도 안 함)
    }

    // 비교 모드에서 다른 탭으로 이동 시 비교 종료
    if (isComparing && tabId !== 'comparison') {
      stopComparison()
    }
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
            setIsReplaying(prev => !prev) // 재생/일시정지 토글
          }
          break
        case 'r':
          e.preventDefault()
          if (result) {
            setReplayTime(0) // 처음으로 되돌리기
            setIsReplaying(false) // 일시정지 상태로
          }
          break
        case 'escape':
          e.preventDefault()
          if (result) {
            setIsReplaying(false) // 일시정지
          }
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

        // 리플레이 제어 (일시정지 상태에서도 작동)
        case 'arrowleft':
          e.preventDefault()
          if (result) {
            setReplayTime(prev => Math.max(0, prev - 0.1))
          }
          break
        case 'arrowright':
          e.preventDefault()
          if (result) {
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
  }, [result, isReplaying, isHelpModalOpen, setIsReplaying, setReplayTime, setPlaybackSpeed, setCameraPreset, currentIndex])

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
              initialTime={replayTime}
              onTimeChange={setReplayTime}
              playbackSpeed={playbackSpeed}
              onSpeedChange={setPlaybackSpeed}
              isPlaying={isReplaying}
              onPlayingChange={setIsReplaying}
            />
          )}
          <ResultPanel
            result={hasReachedPlate ? result : null}
            showForceVectors={showForceVectors}
            onToggleForceVectors={setShowForceVectors}
            currentForces={currentTrajectoryPoint?.forces || null}
          />
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
      id: 'enjoy',
      label: 'Enjoy',
      content: <EnjoyPanel />
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
        onHelpClick={handleHelpClick}
        onUserClick={handleUserClick}
        onChallengeClick={handleChallengeClick}
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
                    ? Math.min(1.0, currentIndex / (result.trajectory.length * 0.2))
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
                {experimentA && (() => {
                  const index = Math.min(
                    Math.floor(comparisonReplayTime * 30),
                    experimentA.result.trajectory.length - 1
                  )
                  const point = experimentA.result.trajectory[index]

                  return (
                    <>
                      {/* 실험 A 공 (파란색) */}
                      {point && <Ball3D position={point.position} />}

                      <TrajectoryLine
                        points={experimentA.result.trajectory}
                        color="#4444ff"
                        lineWidth={3}
                      />
                      {/* 실험 A 힘 벡터 */}
                      {comparisonShowForceVectors && point?.forces && (
                        <ForceVectors3D
                          position={point.position}
                          forces={point.forces}
                          scale={0.15}
                          experimentId="A"
                        />
                      )}
                    </>
                  )
                })()}
                {experimentB && (() => {
                  const index = Math.min(
                    Math.floor(comparisonReplayTime * 30),
                    experimentB.result.trajectory.length - 1
                  )
                  const point = experimentB.result.trajectory[index]

                  return (
                    <>
                      {/* 실험 B 공 (빨간색) */}
                      {point && <Ball3D position={point.position} />}

                      <TrajectoryLine
                        points={experimentB.result.trajectory}
                        color="#ff4444"
                        lineWidth={3}
                      />
                      {/* 실험 B 힘 벡터 */}
                      {comparisonShowForceVectors && point?.forces && (
                        <ForceVectors3D
                          position={point.position}
                          forces={point.forces}
                          scale={0.15}
                          experimentId="B"
                        />
                      )}
                    </>
                  )
                })()}
              </>
            ) : (
              <>
                {/* 일반 모드 - 공은 48프레임 후에만 표시 */}
                {showBall && <Ball3D position={currentPosition} />}

                {/* 힘 벡터 시각화 */}
                {showBall && showForceVectors && currentTrajectoryPoint?.forces && (
                  <ForceVectors3D
                    position={currentPosition}
                    forces={currentTrajectoryPoint.forces}
                    scale={0.15}
                  />
                )}

                {/* 진행 중인 궤적 */}
                {showBall && result && (isReplaying || currentIndex < result.trajectory.length - 1) && currentTrajectory.length > 1 && (
                  <TrajectoryLine points={currentTrajectory} />
                )}

                {/* 완료된 궤적 */}
                {showBall && result && !isReplaying && currentIndex >= result.trajectory.length - 1 && completedTrajectory.length > 1 && (
                  <CompletedTrajectoryLine points={completedTrajectory} />
                )}

                {/* 플레이트 충돌 마커 - 시뮬레이션 완료 후 표시 (스트라이크 존 도달한 경우만) */}
                {showBall && result && !isReplaying && currentIndex >= result.trajectory.length - 1 && result.reachedPlate && (
                  <PlateMarker
                    x={result.finalPosition.x}
                    y={result.plateHeight}
                    color="#00ff00"
                  />
                )}
              </>
            )}

            {/* 비교 모드 플레이트 마커 (스트라이크 존 도달한 경우만) */}
            {isComparing && (
              <>
                {experimentA && experimentA.result.reachedPlate && (
                  <PlateMarker
                    x={experimentA.result.finalPosition.x}
                    y={experimentA.result.plateHeight}
                    color="#4444ff"
                  />
                )}
                {experimentB && experimentB.result.reachedPlate && (
                  <PlateMarker
                    x={experimentB.result.finalPosition.x}
                    y={experimentB.result.plateHeight}
                    color="#ff4444"
                  />
                )}
              </>
            )}
          </Scene3D>
        </ViewerSection>

        <ControlPanel>
          <TabContainer
            tabs={rightPanelTabs}
            defaultTab="parameters"
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </ControlPanel>
      </MainContent>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: ${theme.colors.background.primary};
  box-sizing: border-box;
  overflow: hidden;
`

const MainContent = styled.div`
  display: flex;
  flex: 1;
  gap: ${theme.spacing.base};
  padding: ${theme.spacing.base};
  overflow: hidden;
  min-height: 0; /* Flexbox 스크롤 버그 방지 */

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`

const ViewerSection = styled.div`
  flex: 1;
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.xl};
  position: relative;
  border: 1px solid ${theme.colors.border.main};
  background: ${theme.colors.background.secondary};
  min-height: 0;
  min-width: 0;

  /* 글로우 효과 */
  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: ${theme.borderRadius.xl};
    padding: 1px;
    background: ${theme.colors.primary.gradient};
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.3;
    pointer-events: none;
  }

  @media (max-width: 1200px) {
    min-height: 400px;
  }
`

const ControlPanel = styled.div`
  width: 420px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  @media (max-width: 1200px) {
    width: 100%;
    max-height: 50vh;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-height: 60vh;
  }
`

const ResultsTabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
  height: 100%;
  min-height: 0; /* Flexbox 스크롤 허용 */

  /* 각 자식 요소가 필요한 만큼만 공간 차지 */
  > * {
    flex-shrink: 0; /* 압축 방지 */
  }
`
