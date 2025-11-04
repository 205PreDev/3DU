import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Vector3, TrajectoryPoint } from '@/types'
import { theme } from '@/styles/theme'
import { MdMovie } from 'react-icons/md'

interface ReplayControlsProps {
  trajectory: Vector3[] | TrajectoryPoint[]
  onTimeChange: (time: number) => void
  playbackSpeed: number
  onSpeedChange: (speed: number) => void
  isPlaying: boolean
  onPlayingChange: (playing: boolean) => void
  initialTime?: number  // 외부에서 초기 시간 설정
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
  onPlayingChange,
  initialTime = 0
}: ReplayControlsProps) {
  const [currentTime, setCurrentTime] = useState(initialTime)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(Date.now())

  // 궤적 길이를 시간으로 변환 (30fps 가정)
  const duration = trajectory.length / 30  // 초

  // isPlaying이 true로 전환될 때만 initialTime 동기화
  const prevPlayingRef = useRef(isPlaying)
  useEffect(() => {
    if (!prevPlayingRef.current && isPlaying) {
      setCurrentTime(initialTime)
    }
    prevPlayingRef.current = isPlaying
  }, [isPlaying, initialTime])

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
    // 슬라이더 드래그 시 재생만 멈추고 리플레이 모드는 유지
    if (isPlaying) {
      onPlayingChange(false)
    }
  }

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(2)}s`
  }

  return (
    <Container>
      <Title>
        <MdMovie /> 리플레이 제어
      </Title>

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
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
`

const Title = styled.h4`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`

const Timeline = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const TimeDisplay = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  text-align: center;
  font-family: ${theme.typography.fontFamily.mono};
  font-weight: ${theme.typography.fontWeight.medium};
`

const TimelineSlider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.background.tertiary};
  outline: none;
  cursor: pointer;
  position: relative;
  z-index: 2;
  -webkit-appearance: none;
  appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: ${theme.borderRadius.full};
    background: ${theme.colors.primary.main};
    cursor: pointer;
    box-shadow: ${theme.shadows.md};
    transition: ${theme.transitions.fast};
    border: 2px solid ${theme.colors.background.secondary};

    &:hover {
      box-shadow: ${theme.shadows.glow};
      transform: scale(1.15);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: ${theme.borderRadius.full};
    background: ${theme.colors.primary.main};
    cursor: pointer;
    border: 2px solid ${theme.colors.background.secondary};
    box-shadow: ${theme.shadows.md};
    transition: ${theme.transitions.fast};

    &:hover {
      box-shadow: ${theme.shadows.glow};
      transform: scale(1.15);
    }

    &:active {
      transform: scale(0.95);
    }
  }
`

const ProgressBar = styled.div`
  position: absolute;
  top: 24px;
  left: 0;
  height: 6px;
  background: ${theme.colors.primary.gradient};
  border-radius: ${theme.borderRadius.full};
  pointer-events: none;
  transition: width 0.05s linear;
  z-index: 1;
  box-shadow: 0 0 10px ${theme.colors.primary.main}50;
`

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
`

const ControlButton = styled.button<{ $isPlaying?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.full};
  border: 2px solid ${props =>
    props.$isPlaying
      ? theme.colors.primary.main
      : theme.colors.border.main
  };
  background: ${props =>
    props.$isPlaying
      ? 'rgba(0, 217, 255, 0.1)'
      : theme.colors.background.tertiary
  };
  color: ${props =>
    props.$isPlaying
      ? theme.colors.primary.main
      : theme.colors.text.secondary
  };
  font-size: 20px;
  cursor: pointer;
  transition: ${theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${theme.colors.primary.gradient};
    opacity: 0;
    transition: ${theme.transitions.fast};
  }

  &:hover {
    border-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.light};
    transform: scale(1.1);
    box-shadow: ${theme.shadows.glow};

    &::before {
      opacity: 0.1;
    }
  }

  &:active {
    transform: scale(0.95);
  }

  ${props => props.$isPlaying && `
    box-shadow: 0 0 0 4px rgba(0, 217, 255, 0.2);
  `}

  /* 아이콘 위치 조정 */
  span {
    position: relative;
    z-index: 1;
  }
`

const SpeedControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const SpeedLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${theme.typography.fontWeight.medium};
`

const SpeedButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.xs};
`

const SpeedButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border: 1.5px solid ${props =>
    props.$active
      ? theme.colors.primary.main
      : theme.colors.border.main
  };
  border-radius: ${theme.borderRadius.md};
  background: ${props =>
    props.$active
      ? 'rgba(0, 217, 255, 0.15)'
      : theme.colors.background.tertiary
  };
  color: ${props =>
    props.$active
      ? theme.colors.primary.light
      : theme.colors.text.secondary
  };
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-family: ${theme.typography.fontFamily.mono};
  cursor: pointer;
  transition: ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${props =>
      props.$active
        ? 'rgba(0, 217, 255, 0.2)'
        : 'rgba(0, 217, 255, 0.1)'
    };
    color: ${theme.colors.primary.light};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  ${props => props.$active && `
    box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.2);
  `}
`
