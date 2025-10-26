import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Vector3 } from '@/types'

interface ReplayControlsProps {
  trajectory: Vector3[]
  onTimeChange: (time: number) => void
  playbackSpeed: number
  onSpeedChange: (speed: number) => void
  isPlaying: boolean
  onPlayingChange: (playing: boolean) => void
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 2]

/**
 * 리플레이 제어 UI
 * 재생/일시정지, 속도 조절, 타임라인 스크러빙
 */
export function ReplayControls({
  trajectory,
  onTimeChange,
  playbackSpeed,
  onSpeedChange,
  isPlaying,
  onPlayingChange
}: ReplayControlsProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(Date.now())

  // 궤적 길이를 시간으로 변환 (30fps 가정)
  const duration = trajectory.length / 30  // 초

  // 재생 로직
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const animate = () => {
      const now = Date.now()
      const delta = (now - lastTimeRef.current) / 1000  // 초 단위
      lastTimeRef.current = now

      setCurrentTime(prev => {
        const next = prev + delta * playbackSpeed
        if (next >= duration) {
          onPlayingChange(false)
          return duration
        }
        return next
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    lastTimeRef.current = Date.now()
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, duration, onPlayingChange])

  // 시간 변경 시 콜백 호출
  useEffect(() => {
    onTimeChange(currentTime)
  }, [currentTime, onTimeChange])

  const handlePlayPause = () => {
    if (currentTime >= duration) {
      setCurrentTime(0)
    }
    onPlayingChange(!isPlaying)
  }

  const handleStop = () => {
    onPlayingChange(false)
    setCurrentTime(0)
  }

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    onPlayingChange(false)
  }

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(2)}s`
  }

  return (
    <Container>
      <Title>🎬 리플레이 제어</Title>

      {/* 타임라인 */}
      <Timeline>
        <TimeDisplay>{formatTime(currentTime)} / {formatTime(duration)}</TimeDisplay>
        <TimelineSlider
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={currentTime}
          onChange={handleTimelineChange}
        />
        <ProgressBar style={{ width: `${(currentTime / duration) * 100}%` }} />
      </Timeline>

      {/* 제어 버튼 */}
      <Controls>
        <ControlButton onClick={handleStop} title="정지">
          ⏹
        </ControlButton>
        <ControlButton onClick={handlePlayPause} $isPlaying={isPlaying} title={isPlaying ? '일시정지' : '재생'}>
          {isPlaying ? '⏸' : '▶'}
        </ControlButton>
      </Controls>

      {/* 재생 속도 */}
      <SpeedControl>
        <SpeedLabel>재생 속도</SpeedLabel>
        <SpeedButtons>
          {SPEED_OPTIONS.map(speed => (
            <SpeedButton
              key={speed}
              $active={playbackSpeed === speed}
              onClick={() => onSpeedChange(speed)}
            >
              {speed}x
            </SpeedButton>
          ))}
        </SpeedButtons>
      </SpeedControl>
    </Container>
  )
}

const Container = styled.div`
  background: #2a2a3e;
  border-radius: 8px;
  padding: 16px;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`

const Title = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #4caf50;
`

const Timeline = styled.div`
  position: relative;
  margin-bottom: 16px;
`

const TimeDisplay = styled.div`
  font-size: 12px;
  color: #ccc;
  margin-bottom: 8px;
  text-align: center;
  font-family: monospace;
`

const TimelineSlider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #1a1a2e;
  outline: none;
  cursor: pointer;
  position: relative;
  z-index: 2;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4caf50;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4caf50;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`

const ProgressBar = styled.div`
  position: absolute;
  top: 28px;
  left: 0;
  height: 8px;
  background: #4caf50;
  border-radius: 4px;
  pointer-events: none;
  transition: width 0.1s linear;
  z-index: 1;
`

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
`

const ControlButton = styled.button<{ $isPlaying?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid ${props => props.$isPlaying ? '#4caf50' : '#666'};
  background: ${props => props.$isPlaying ? 'rgba(76, 175, 80, 0.1)' : '#1a1a2e'};
  color: ${props => props.$isPlaying ? '#4caf50' : '#ccc'};
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: #4caf50;
    color: #4caf50;
    background: rgba(76, 175, 80, 0.1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const SpeedControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const SpeedLabel = styled.div`
  font-size: 12px;
  color: #888;
  text-align: center;
`

const SpeedButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`

const SpeedButton = styled.button<{ $active: boolean }>`
  padding: 8px;
  border: 1px solid ${props => props.$active ? '#4caf50' : '#444'};
  border-radius: 4px;
  background: ${props => props.$active ? '#4caf50' : '#1a1a2e'};
  color: ${props => props.$active ? '#fff' : '#ccc'};
  font-size: 12px;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4caf50;
    background: ${props => props.$active ? '#45a049' : 'rgba(76, 175, 80, 0.1)'};
  }
`
