import { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useSimulation } from '@/contexts/SimulationContext'
import { Scene3D } from '@/core/renderer/Scene3D'
import { Grid } from '@/core/renderer/Grid'
import { Field } from './Field'
import { Ball3D } from './Ball3D'
import { TrajectoryLine, CompletedTrajectoryLine } from './TrajectoryLine'
import { PitchInputPanel } from './PitchInputPanel'
import { ResultPanel } from '@/core/ui/ResultPanel'
import { ReplayControls } from '@/core/ui/ReplayControls'
import { CameraPresetButtons } from '@/core/ui/CameraPresetButtons'
import { CameraController } from '@/core/renderer/CameraController'
import { Vector3 } from '@/types'

/**
 * 투구 시뮬레이터 메인 컴포넌트
 */
export function PitchSimulator() {
  const {
    result,
    isReplaying,
    setIsReplaying,
    replayTime,
    setReplayTime,
    playbackSpeed,
    setPlaybackSpeed,
    cameraPreset,
    setCameraPreset
  } = useSimulation()
  const [animationIndex, setAnimationIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasReachedPlate, setHasReachedPlate] = useState(false)

  // 시뮬레이션 결과가 나오면 애니메이션 시작 및 판정 초기화
  useEffect(() => {
    if (result && result.trajectory.length > 0) {
      setAnimationIndex(0)
      setIsAnimating(true)
      setHasReachedPlate(false)  // 판정 초기화
    }
  }, [result])

  // 애니메이션 프레임 업데이트
  useEffect(() => {
    if (!isAnimating || !result) return

    const interval = setInterval(() => {
      setAnimationIndex(prev => {
        const nextIndex = prev + 2  // 2포인트씩 건너뛰기 (성능 개선)

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
    }, 50)  // 50ms = 20fps (i5-9400 성능 최적화)

    return () => clearInterval(interval)
  }, [isAnimating, result])

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

  return (
    <Container>
      <ViewerSection>
        <Scene3D>
          <Grid />
          <Field />

          {/* 카메라 제어 */}
          <CameraController preset={cameraPreset} ballPosition={currentPosition} />

          {/* 공 */}
          <Ball3D position={currentPosition} />

          {/* 진행 중인 궤적 */}
          {(isAnimating || isReplaying) && currentTrajectory.length > 1 && (
            <TrajectoryLine points={currentTrajectory} />
          )}

          {/* 완료된 궤적 */}
          {!isAnimating && !isReplaying && completedTrajectory.length > 1 && (
            <CompletedTrajectoryLine points={completedTrajectory} />
          )}
        </Scene3D>
      </ViewerSection>

      <ControlPanel>
        <PitchInputPanel />

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
      </ControlPanel>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background: #16213e;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
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
  gap: 20px;
  overflow-y: auto;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a2e;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4caf50;
    border-radius: 4px;
  }
`
