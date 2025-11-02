import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three-stdlib'
import { PitchParameters } from '@/types'

interface Pitcher3DProps {
  params: PitchParameters
  startTrigger: number // 버튼 클릭 카운트 (증가할 때마다 애니메이션 시작)
  animationProgress: number // 0~1 (0: 준비, 1: 릴리스 완료)
  onReleaseFrame?: () => void // 48프레임 도달 시 콜백
}

/**
 * FBX 투수 모델 (Blender 모델)
 * startTrigger가 증가할 때마다 1프레임부터 애니메이션 재생
 */
export function Pitcher3D({ params, startTrigger, onReleaseFrame }: Pitcher3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const actionRef = useRef<THREE.AnimationAction | null>(null)
  const clockRef = useRef<THREE.Clock>(new THREE.Clock())
  const currentFrameRef = useRef(0)
  const hasReleasedRef = useRef(false)
  const animationDurationRef = useRef(0) // 애니메이션 총 길이

  // FBX 모델 로드
  useEffect(() => {
    const loader = new FBXLoader()

    loader.load(
      '/models/pitcher.fbx',
      (fbx) => {
        // 모델 크기 조정 (필요 시)
        fbx.scale.set(0.01, 0.01, 0.01) // FBX 모델이 크다면 조정

        // 모델 회전 (-Z 방향 바라보도록, 180도 회전)
        fbx.rotation.y = Math.PI

        // 그림자 설정
        fbx.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        // 애니메이션 설정
        if (fbx.animations && fbx.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(fbx)
          mixerRef.current = mixer

          // 애니메이션 길이 저장
          const duration = fbx.animations[0].duration
          animationDurationRef.current = duration

          // 첫 번째 애니메이션 클립 설정
          const action = mixer.clipAction(fbx.animations[0])
          action.setLoop(THREE.LoopOnce, 1)
          action.clampWhenFinished = true
          action.paused = true // 초기 일시정지

          actionRef.current = action // action 참조 저장

          // 1프레임 대기 자세
          const oneFrameTime = 1 / 30
          action.time = oneFrameTime
          action.play()
          mixer.update(0)

        } else {
          console.warn('⚠️ FBX 파일에 애니메이션이 없습니다')
        }

        setModel(fbx)
        setIsLoading(false)
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100
        console.log(`⏳ Pitcher 모델 로딩 중: ${percent.toFixed(1)}%`)
      },
      (err) => {
        console.error('❌ Pitcher FBX 모델 로드 실패:', err)
        setError('모델 로드 실패')
        setIsLoading(false)
      }
    )
  }, [])

  // startTrigger가 증가할 때마다 애니메이션 시작
  useEffect(() => {
    if (startTrigger === 0 || !mixerRef.current || !actionRef.current) return

    const action = actionRef.current
    const mixer = mixerRef.current

    // 애니메이션 강제 초기화 및 1프레임부터 재생
    action.stop()
    action.reset()
    action.time = 1 / 30 // 1프레임 시간 설정
    action.paused = true // 일시정지 상태로 설정
    action.play()

    // 0프레임 업데이트로 1프레임 자세 고정
    mixer.update(0)

    // 이제 재생 시작
    action.paused = false

    hasReleasedRef.current = false
    currentFrameRef.current = 1
    clockRef.current = new THREE.Clock()

    let animationId: number

    const animate = () => {
      if (!mixerRef.current || !actionRef.current) return

      const delta = clockRef.current.getDelta()
      mixerRef.current.update(delta)

      // 현재 프레임 계산
      const currentTime = actionRef.current.time
      const frame = Math.floor(currentTime * 30)
      currentFrameRef.current = frame

      // 48프레임 도달 시 콜백 호출 (한 번만)
      if (frame >= 48 && !hasReleasedRef.current && onReleaseFrame) {
        hasReleasedRef.current = true
        onReleaseFrame()
      }

      // 애니메이션 종료 확인
      const duration = animationDurationRef.current
      if (currentTime >= duration - 0.01) {
        // 1프레임으로 복귀
        actionRef.current.stop()
        actionRef.current.reset()
        const oneFrameTime = 1 / 30
        actionRef.current.time = oneFrameTime
        actionRef.current.paused = true
        actionRef.current.play()
        mixerRef.current.update(0)
        return // 애니메이션 루프 종료
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [startTrigger, onReleaseFrame])

  // 투수 위치 (마운드 위)
  const pitcherPosition: [number, number, number] = [0, 0, 0]

  // 좌완 투수 판정 (릴리스 포인트 X < 0이면 좌완)
  const isLeftHanded = params?.initial?.releasePoint?.x !== undefined && params.initial.releasePoint.x < 0

  // 로딩 중이거나 에러 발생 시 대체 모델 표시
  if (isLoading || error) {
    return (
      <group ref={groupRef} position={pitcherPosition}>
        {/* 간단한 대체 모델 */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#f5deb3" />
        </mesh>
        {isLoading && (
          <mesh position={[0, 2.0, 0]}>
            <boxGeometry args={[0.5, 0.1, 0.1]} />
            <meshStandardMaterial color="#ffff00" />
          </mesh>
        )}
      </group>
    )
  }

  return (
    <group ref={groupRef} position={pitcherPosition}>
      {model && (
        <group scale={[isLeftHanded ? -1 : 1, 1, 1]}>
          <primitive object={model} />
        </group>
      )}
    </group>
  )
}
