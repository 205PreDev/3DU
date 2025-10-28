import { createContext, useContext, useState, ReactNode } from 'react'

export interface GraphicsSettings {
  targetFps: number           // 목표 FPS (30-60)
  dpr: number                 // 픽셀 밀도 (1.0-2.0)
  antialias: boolean          // 안티앨리어싱
  sphereSegments: number      // 공 폴리곤 수 (8-32)
  trajectoryDt: number        // 궤적 간격 (0.005-0.02)
  fov: number                 // 시야각 (40-75)
}

interface GraphicsContextType {
  settings: GraphicsSettings
  updateSettings: (newSettings: Partial<GraphicsSettings>) => void
  applyPreset: (preset: 'low' | 'medium' | 'high') => void
}

const GraphicsContext = createContext<GraphicsContextType | undefined>(undefined)

// 기본 설정 (중간)
const DEFAULT_SETTINGS: GraphicsSettings = {
  targetFps: 45,
  dpr: 1,
  antialias: false,
  sphereSegments: 12,
  trajectoryDt: 0.01,
  fov: 50
}

// 프리셋 가이드라인
export const GRAPHICS_PRESETS: Record<'low' | 'medium' | 'high', GraphicsSettings> = {
  low: {
    targetFps: 30,
    dpr: 1,
    antialias: false,
    sphereSegments: 8,
    trajectoryDt: 0.02,
    fov: 40
  },
  medium: {
    targetFps: 45,
    dpr: 1,
    antialias: false,
    sphereSegments: 12,
    trajectoryDt: 0.01,
    fov: 50
  },
  high: {
    targetFps: 60,
    dpr: 1.5,
    antialias: true,
    sphereSegments: 24,
    trajectoryDt: 0.008,
    fov: 60
  }
}

export function GraphicsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GraphicsSettings>(DEFAULT_SETTINGS)

  const updateSettings = (newSettings: Partial<GraphicsSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const applyPreset = (preset: 'low' | 'medium' | 'high') => {
    setSettings(GRAPHICS_PRESETS[preset])
  }

  return (
    <GraphicsContext.Provider value={{ settings, updateSettings, applyPreset }}>
      {children}
    </GraphicsContext.Provider>
  )
}

export function useGraphics(): GraphicsContextType {
  const context = useContext(GraphicsContext)
  if (!context) {
    throw new Error('useGraphics must be used within GraphicsProvider')
  }
  return context
}
