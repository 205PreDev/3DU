import React from 'react'
import { useGraphics } from '@/contexts/GraphicsContext'

export const GraphicsSettingsPanel: React.FC = () => {
  const { settings, updateSettings, applyPreset } = useGraphics()

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold mb-4">그래픽 설정</h3>

      {/* 프리셋 가이드라인 */}
      <div className="bg-gray-50 p-3 rounded mb-4">
        <h4 className="font-medium mb-2 text-sm">권장 프리셋</h4>
        <div className="flex gap-2">
          <button
            onClick={() => applyPreset('low')}
            className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
          >
            저사양
          </button>
          <button
            onClick={() => applyPreset('medium')}
            className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
          >
            중간
          </button>
          <button
            onClick={() => applyPreset('high')}
            className="flex-1 px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition"
          >
            고사양
          </button>
        </div>
        <div className="text-xs text-gray-600 mt-2 space-y-1">
          <div><strong>저사양:</strong> 30fps, 최소 품질 (안정적)</div>
          <div><strong>중간:</strong> 45fps, 균형 잡힌 품질</div>
          <div><strong>고사양:</strong> 60fps, 최고 품질</div>
        </div>
      </div>

      {/* 목표 FPS */}
      <div>
        <label className="block text-sm font-medium mb-2">
          목표 FPS: <span className="text-blue-600">{settings.targetFps}</span>
        </label>
        <input
          type="range"
          min="30"
          max="60"
          step="15"
          value={settings.targetFps}
          onChange={(e) => updateSettings({ targetFps: Number(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>30 (안정)</span>
          <span>45 (균형)</span>
          <span>60 (부드러움)</span>
        </div>
      </div>

      {/* 픽셀 밀도 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          픽셀 밀도 (DPR): <span className="text-blue-600">{settings.dpr.toFixed(1)}x</span>
        </label>
        <input
          type="range"
          min="1"
          max="2"
          step="0.25"
          value={settings.dpr}
          onChange={(e) => updateSettings({ dpr: Number(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">
          높을수록 선명하지만 렉 증가 (1.0 권장)
        </div>
      </div>

      {/* 공 품질 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          공 품질 (폴리곤): <span className="text-blue-600">{settings.sphereSegments}x{settings.sphereSegments}</span>
        </label>
        <input
          type="range"
          min="8"
          max="32"
          step="4"
          value={settings.sphereSegments}
          onChange={(e) => updateSettings({ sphereSegments: Number(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">
          높을수록 부드럽지만 렉 증가 (12 권장)
        </div>
      </div>

      {/* 궤적 정밀도 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          궤적 정밀도: <span className="text-blue-600">{(1 / settings.trajectoryDt).toFixed(0)}점</span>
        </label>
        <input
          type="range"
          min="0.005"
          max="0.02"
          step="0.002"
          value={settings.trajectoryDt}
          onChange={(e) => updateSettings({ trajectoryDt: Number(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">
          높을수록 부드럽지만 렉 증가 (100점 권장)
        </div>
      </div>

      {/* 시야각 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          시야각 (FOV): <span className="text-blue-600">{settings.fov}°</span>
        </label>
        <input
          type="range"
          min="40"
          max="75"
          step="5"
          value={settings.fov}
          onChange={(e) => updateSettings({ fov: Number(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">
          높을수록 넓게 보이지만 왜곡 증가 (50 권장)
        </div>
      </div>

      {/* 안티앨리어싱 */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.antialias}
            onChange={(e) => updateSettings({ antialias: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">안티앨리어싱 (계단 현상 제거)</span>
        </label>
        <div className="text-xs text-gray-500 mt-1 ml-6">
          켜면 선명하지만 렉 증가 (끄기 권장)
        </div>
      </div>

      {/* 경고 */}
      <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
        <div className="text-xs text-yellow-800">
          <strong>⚠️ 주의:</strong> 설정 변경 시 시뮬레이션을 다시 실행해야 적용됩니다.
          렉이 발생하면 저사양 프리셋을 사용하세요.
        </div>
      </div>
    </div>
  )
}
