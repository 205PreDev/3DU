import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useSimulation } from '@/contexts/SimulationContext'
import { Scene3D } from '@/core/renderer/Scene3D'
import { Grid } from '@/core/renderer/Grid'
import { Field } from './Field'
import { Ball3D } from './Ball3D'
import { TrajectoryLine, CompletedTrajectoryLine } from './TrajectoryLine'
import { PitchInputPanel } from './PitchInputPanel'
import { ResultPanel } from '@/core/ui/ResultPanel'
import { Vector3 } from '@/types'

/**
 * 투구 시뮬레이터 메인 컴포넌트
 */
export function PitchSimulator() {
  const { result } = useSimulation()
  const [animationIndex, setAnimationIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // 시뮬레이션 결과가 나오면 애니메이션 시작
  useEffect(() => {
    if (result && result.trajectory.length > 0) {
      setAnimationIndex(0)
      setIsAnimating(true)
    }
  }, [result])

  // 애니메이션 프레임 업데이트
  useEffect(() => {
    if (!isAnimating || !result) return

    const interval = setInterval(() => {
      setAnimationIndex(prev => {
        if (prev >= result.trajectory.length - 1) {
          setIsAnimating(false)
          return prev
        }
        return prev + 1
      })
    }, 20)  // 20ms = 50fps

    return () => clearInterval(interval)
  }, [isAnimating, result])

  const currentPosition: Vector3 = result && result.trajectory[animationIndex]
    ? result.trajectory[animationIndex]
    : { x: 0, y: 2, z: 0 }

  const currentTrajectory = result
    ? result.trajectory.slice(0, animationIndex + 1)
    : []

  const completedTrajectory = result && !isAnimating
    ? result.trajectory
    : []

  return (
    <Container>
      <ViewerSection>
        <Scene3D>
          <Grid />
          <Field />

          {/* 공 */}
          <Ball3D position={currentPosition} />

          {/* 진행 중인 궤적 */}
          {isAnimating && currentTrajectory.length > 1 && (
            <TrajectoryLine points={currentTrajectory} />
          )}

          {/* 완료된 궤적 */}
          {!isAnimating && completedTrajectory.length > 1 && (
            <CompletedTrajectoryLine points={completedTrajectory} />
          )}
        </Scene3D>
      </ViewerSection>

      <ControlPanel>
        <PitchInputPanel />
        <ResultPanel result={result} />
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
