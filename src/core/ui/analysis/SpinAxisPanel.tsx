import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { useSimulation } from '@/contexts/SimulationContext'
import { PitchType, PITCH_PRESETS } from '@/scenarios/pitch/presets'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

interface SpinAxisVisualization {
  x: number
  y: number
  z: number
  totalRpm: number
}

/**
 * 회전축 3D 시각화 패널
 * 공의 회전 방향을 3D로 표시하고 구종별 비교
 */
export function SpinAxisPanel() {
  const { params, result } = useSimulation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    ball: THREE.Mesh
    arrow: THREE.ArrowHelper
    controls: OrbitControls
    animationId: number | null
  } | null>(null)

  // 회전 벡터 계산
  const calculateSpinAxis = (): SpinAxisVisualization | null => {
    if (!params) return null

    const spin = params.initial.spin
    const totalRpm = Math.sqrt(spin.x ** 2 + spin.y ** 2 + spin.z ** 2)

    if (totalRpm === 0) return null

    // 정규화된 회전축
    return {
      x: spin.x / totalRpm,
      y: spin.y / totalRpm,
      z: spin.z / totalRpm,
      totalRpm
    }
  }

  // Three.js 씬 초기화
  useEffect(() => {
    if (!canvasRef.current) return

    // 씬 생성
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f1419)

    // 카메라
    const camera = new THREE.PerspectiveCamera(
      50,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(3, 2, 3)
    camera.lookAt(0, 0, 0)

    // 렌더러
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    })
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    // 야구공
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32)
    const ballMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.2
    })
    const ball = new THREE.Mesh(ballGeometry, ballMaterial)
    scene.add(ball)

    // 봉합선 (빨간 실밥)
    const seamsGeometry = new THREE.TorusGeometry(0.5, 0.02, 8, 32)
    const seamsMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    const seams1 = new THREE.Mesh(seamsGeometry, seamsMaterial)
    seams1.rotation.x = Math.PI / 4
    ball.add(seams1)

    const seams2 = new THREE.Mesh(seamsGeometry, seamsMaterial)
    seams2.rotation.x = -Math.PI / 4
    ball.add(seams2)

    // 회전축 화살표 (공 표면에서 시작)
    const arrowDirection = new THREE.Vector3(0, 1, 0)
    const arrowOrigin = new THREE.Vector3(0, 0.5, 0) // 공 표면에서 시작
    const arrow = new THREE.ArrowHelper(
      arrowDirection,
      arrowOrigin,
      1.5,
      0x00d9ff,
      0.4,
      0.3
    )
    scene.add(arrow)

    // 좌표축 헬퍼 (더 크게)
    const axesHelper = new THREE.AxesHelper(1.2)
    scene.add(axesHelper)

    // OrbitControls 추가 (마우스 드래그로 회전)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enablePan = false
    controls.minDistance = 2
    controls.maxDistance = 10

    sceneRef.current = {
      scene,
      camera,
      renderer,
      ball,
      arrow,
      controls,
      animationId: null
    }

    // 애니메이션 루프
    const animate = () => {
      if (!sceneRef.current) return

      // 공 회전
      sceneRef.current.ball.rotation.y += 0.01

      // Controls 업데이트
      sceneRef.current.controls.update()

      sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera)
      sceneRef.current.animationId = requestAnimationFrame(animate)
    }
    animate()

    // 리사이즈 처리
    const handleResize = () => {
      if (!canvasRef.current || !sceneRef.current) return

      const width = canvasRef.current.clientWidth
      const height = canvasRef.current.clientHeight

      sceneRef.current.camera.aspect = width / height
      sceneRef.current.camera.updateProjectionMatrix()
      sceneRef.current.renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId)
      }
      sceneRef.current?.controls.dispose()
      sceneRef.current?.renderer.dispose()
    }
  }, [])

  // 회전축 업데이트
  useEffect(() => {
    if (!sceneRef.current) return

    const spinAxis = calculateSpinAxis()

    if (spinAxis && spinAxis.totalRpm > 0) {
      const direction = new THREE.Vector3(spinAxis.x, spinAxis.y, spinAxis.z).normalize()

      // 화살표 위치를 공 표면에서 시작하도록 설정
      const origin = direction.clone().multiplyScalar(0.5) // 공 반지름 0.5
      sceneRef.current.arrow.position.copy(origin)
      sceneRef.current.arrow.setDirection(direction)
      sceneRef.current.arrow.setLength(1.5, 0.4, 0.3)

      // 회전 속도에 따라 화살표 색상 변경 (cyan -> green -> yellow)
      const intensity = Math.min(spinAxis.totalRpm / 3000, 1)
      const color = new THREE.Color()
      if (intensity < 0.5) {
        // cyan -> green
        color.lerpColors(
          new THREE.Color(0x00d9ff),
          new THREE.Color(0x00ff00),
          intensity * 2
        )
      } else {
        // green -> yellow
        color.lerpColors(
          new THREE.Color(0x00ff00),
          new THREE.Color(0xffff00),
          (intensity - 0.5) * 2
        )
      }
      sceneRef.current.arrow.setColor(color)
    }
  }, [params])

  const spinAxis = calculateSpinAxis()

  // 구종별 평균 회전수
  const getPresetComparison = () => {
    if (!spinAxis) return null

    const comparisons: Array<{
      type: PitchType
      name: string
      spin: { x: number; y: number; z: number }
      totalRpm: number
      similarity: number
    }> = []

    Object.entries(PITCH_PRESETS).forEach(([type, preset]) => {
      const presetSpin = preset.initial.spin
      const presetTotal = Math.sqrt(
        presetSpin.x ** 2 + presetSpin.y ** 2 + presetSpin.z ** 2
      )

      if (presetTotal === 0) return

      // 코사인 유사도 계산
      const dot =
        (spinAxis.x * presetSpin.x + spinAxis.y * presetSpin.y + spinAxis.z * presetSpin.z) /
        (spinAxis.totalRpm * presetTotal)
      const similarity = Math.max(0, dot * 100)

      comparisons.push({
        type: type as PitchType,
        name: getKoreanPitchName(type as PitchType),
        spin: presetSpin,
        totalRpm: presetTotal,
        similarity
      })
    })

    return comparisons.sort((a, b) => b.similarity - a.similarity)
  }

  const getKoreanPitchName = (type: PitchType): string => {
    const names: Record<PitchType, string> = {
      fastball: '직구',
      curveball: '커브',
      slider: '슬라이더',
      changeup: '체인지업',
      knuckleball: '너클볼'
    }
    return names[type]
  }

  const comparisons = getPresetComparison()

  return (
    <Container>
      {spinAxis && spinAxis.totalRpm > 0 ? (
        <>
          <Section>
            <SectionTitle>회전 정보</SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>총 회전수</InfoLabel>
                <InfoValue>{spinAxis.totalRpm.toFixed(0)} rpm</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>백스핀 (Y축)</InfoLabel>
                <InfoValue $color={params?.initial.spin.y > 0 ? theme.colors.success : theme.colors.error}>
                  {params?.initial.spin.y.toFixed(0)} rpm
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>사이드스핀 (X축)</InfoLabel>
                <InfoValue $color={Math.abs(params?.initial.spin.x || 0) > 100 ? theme.colors.warning : theme.colors.text.primary}>
                  {params?.initial.spin.x.toFixed(0)} rpm
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>자이로스핀 (Z축)</InfoLabel>
                <InfoValue>{params?.initial.spin.z.toFixed(0)} rpm</InfoValue>
              </InfoItem>
            </InfoGrid>

            <SpinAnalysis>
              <AnalysisItem>
                <AnalysisLabel>수직 변화</AnalysisLabel>
                <AnalysisValue>
                  {params?.initial.spin.y > 1500 ? '🔼 강한 부양' :
                   params?.initial.spin.y > 500 ? '↗️ 부양' :
                   params?.initial.spin.y > -500 ? '→ 중립' :
                   params?.initial.spin.y > -1500 ? '↘️ 낙하' : '🔽 강한 낙하'}
                </AnalysisValue>
              </AnalysisItem>
              <AnalysisItem>
                <AnalysisLabel>수평 변화</AnalysisLabel>
                <AnalysisValue>
                  {Math.abs(params?.initial.spin.x || 0) < 100 ? '↔️ 직진' :
                   params?.initial.spin.x > 0 ? '↪️ 우측' : '↩️ 좌측'}
                </AnalysisValue>
              </AnalysisItem>
              <AnalysisItem>
                <AnalysisLabel>회전 효율</AnalysisLabel>
                <AnalysisValue>
                  {((Math.abs(params?.initial.spin.y || 0) + Math.abs(params?.initial.spin.x || 0)) / spinAxis.totalRpm * 100).toFixed(0)}%
                </AnalysisValue>
              </AnalysisItem>
            </SpinAnalysis>
          </Section>
        </>
      ) : (
        <EmptyState>
          <EmptyIcon>🌀</EmptyIcon>
          <EmptyText>파라미터 탭에서 회전수를 설정하고 시뮬레이션을 실행하세요</EmptyText>
          <EmptySubText>백스핀, 사이드스핀, 자이로스핀을 조절하여 다양한 구종을 만들어보세요</EmptySubText>
        </EmptyState>
      )}

      <EducationalNote>
        <NoteTitle>회전축의 의미</NoteTitle>
        <NoteContent>
          <li>
            <strong>Y축 회전 (백스핀/탑스핀):</strong> 공을 위아래로 움직입니다.
            백스핀(+)은 공을 띄우고, 탑스핀(-)은 공을 떨어뜨립니다.
          </li>
          <li>
            <strong>X축 회전 (사이드스핀):</strong> 공을 좌우로 움직입니다.
            투수 기준 시계방향 회전이 양수입니다.
          </li>
          <li>
            <strong>Z축 회전 (자이로스핀):</strong> 총알처럼 회전합니다.
            일반적으로 다른 회전에 비해 영향이 적습니다.
          </li>
          <li>
            <strong>유사도:</strong> 회전축 방향의 유사성을 나타냅니다.
            높을수록 해당 구종의 회전 패턴에 가깝습니다.
          </li>
        </NoteContent>
      </EducationalNote>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
`

const Section = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
`

const SectionTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const CanvasHint = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  margin-bottom: ${theme.spacing.xs};
  text-align: center;
`

const Canvas = styled.canvas`
  width: 100%;
  height: 300px;
  border-radius: ${theme.borderRadius.sm};
  background: linear-gradient(135deg, #0f1419, #16213e);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`

const Legend = styled.div`
  display: flex;
  gap: ${theme.spacing.base};
  margin-top: ${theme.spacing.sm};
  justify-content: center;
  flex-wrap: wrap;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`

const ColorBox = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  background: ${props => props.$color};
  border-radius: 2px;
`

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.base};
`

const InfoItem = styled.div`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  text-align: center;
`

const InfoLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`

const InfoValue = styled.div<{ $color?: string }>`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.$color || theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.mono};
`

const SpinAxisVector = styled.div`
  background: ${theme.colors.primary.main}10;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${theme.colors.primary.main};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const VectorLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`

const VectorValue = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary.main};
  font-family: ${theme.typography.fontFamily.mono};
`

const ComparisonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const ComparisonItem = styled.div<{ $rank: number }>`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  border-left: 3px solid ${props =>
    props.$rank === 1 ? theme.colors.success :
    props.$rank === 2 ? theme.colors.primary.main :
    props.$rank === 3 ? theme.colors.warning :
    theme.colors.border.light};
`

const ComparisonHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
`

const RankBadge = styled.div<{ $rank: number }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.bold};
  background: ${props =>
    props.$rank === 1 ? theme.colors.success :
    props.$rank === 2 ? theme.colors.primary.main :
    props.$rank === 3 ? theme.colors.warning :
    theme.colors.text.tertiary};
  color: white;
`

const PitchName = styled.div`
  flex: 1;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const SimilarityBadge = styled.div<{ $similarity: number }>`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props =>
    props.$similarity >= 80 ? theme.colors.success :
    props.$similarity >= 60 ? theme.colors.primary.main :
    props.$similarity >= 40 ? theme.colors.warning :
    theme.colors.error};
  font-family: ${theme.typography.fontFamily.mono};
`

const ComparisonBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.background.elevated};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
  margin-bottom: ${theme.spacing.xs};
`

const ComparisonFill = styled.div<{ $similarity: number }>`
  height: 100%;
  width: ${props => props.$similarity}%;
  background: linear-gradient(90deg,
    ${theme.colors.error},
    ${theme.colors.warning},
    ${theme.colors.success}
  );
  transition: width 0.5s ease;
`

const ComparisonInfo = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  font-family: ${theme.typography.fontFamily.mono};
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.tertiary};
  border: 2px dashed ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
`

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.sm};
`

const EmptyText = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  text-align: center;
`

const EmptySubText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-top: ${theme.spacing.xs};
`

const SpinAnalysis = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.base};
`

const AnalysisItem = styled.div`
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  text-align: center;
  border: 1px solid ${theme.colors.border.light};
`

const AnalysisLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`

const AnalysisValue = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const EducationalNote = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-left: 4px solid ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
`

const NoteTitle = styled.h4`
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const NoteContent = styled.ul`
  margin: 0;
  padding-left: ${theme.spacing.base};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};

  li {
    margin: ${theme.spacing.xs} 0;
  }

  strong {
    color: ${theme.colors.text.primary};
  }
`
