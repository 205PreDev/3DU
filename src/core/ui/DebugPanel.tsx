import React from 'react';
import { useSimulation } from '../../contexts/SimulationContext';

export const DebugPanel: React.FC = () => {
  const { performanceMetrics } = useSimulation();

  if (!performanceMetrics) {
    return (
      <div className="p-4 text-gray-500">
        시뮬레이션을 실행하여 성능 지표를 확인하세요.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-4">성능 지표</h3>

      {/* 계산 성능 */}
      <div className="bg-gray-50 p-3 rounded">
        <h4 className="font-medium mb-2 text-blue-600">⏱️ 계산 성능</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>물리 계산 시간:</span>
            <span className="font-mono">{performanceMetrics.physicsTime.toFixed(2)} ms</span>
          </div>
          <div className="flex justify-between">
            <span>평균 계산 시간:</span>
            <span className="font-mono">{performanceMetrics.avgPhysicsTime.toFixed(2)} ms</span>
          </div>
          <div className="flex justify-between">
            <span>최대 계산 시간:</span>
            <span className="font-mono">{performanceMetrics.maxPhysicsTime.toFixed(2)} ms</span>
          </div>
        </div>
      </div>

      {/* 렌더링 성능 */}
      <div className="bg-gray-50 p-3 rounded">
        <h4 className="font-medium mb-2 text-green-600">🎨 렌더링 성능</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>렌더 시간:</span>
            <span className="font-mono">{performanceMetrics.renderTime.toFixed(2)} ms</span>
          </div>
          <div className="flex justify-between">
            <span>FPS:</span>
            <span className="font-mono font-bold">{performanceMetrics.fps.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span>프레임 카운트:</span>
            <span className="font-mono">{performanceMetrics.frameCount}</span>
          </div>
        </div>
      </div>

      {/* 전체 성능 */}
      <div className="bg-gray-50 p-3 rounded">
        <h4 className="font-medium mb-2 text-purple-600">📊 전체 성능</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>총 프레임 시간:</span>
            <span className="font-mono">{performanceMetrics.totalFrameTime.toFixed(2)} ms</span>
          </div>
          <div className="flex justify-between">
            <span>시뮬레이션 시간:</span>
            <span className="font-mono">{performanceMetrics.simulationTime.toFixed(2)} s</span>
          </div>
          <div className="flex justify-between">
            <span>궤적 포인트 수:</span>
            <span className="font-mono">{performanceMetrics.trajectoryPoints}</span>
          </div>
        </div>
      </div>

      {/* 메모리 정보 */}
      {performanceMetrics.memoryUsage && (
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-2 text-orange-600">💾 메모리</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>사용 중:</span>
              <span className="font-mono">
                {(performanceMetrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span>총 할당:</span>
              <span className="font-mono">
                {(performanceMetrics.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span>제한:</span>
              <span className="font-mono">
                {(performanceMetrics.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 성능 등급 */}
      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <div className="text-sm">
          <div className="font-medium mb-1">성능 평가:</div>
          <div className="text-xs text-gray-600">
            {performanceMetrics.fps >= 30 ? (
              <span className="text-green-600 font-medium">✅ 우수 (30+ FPS)</span>
            ) : performanceMetrics.fps >= 20 ? (
              <span className="text-yellow-600 font-medium">⚠️ 보통 (20-30 FPS)</span>
            ) : (
              <span className="text-red-600 font-medium">❌ 저하 (&lt;20 FPS)</span>
            )}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            총 지연시간: <span className="font-mono font-medium">{performanceMetrics.totalFrameTime.toFixed(2)} ms</span>
            {performanceMetrics.totalFrameTime < 33 ? ' (실시간 렌더링 가능)' : ' (지연 발생)'}
          </div>
        </div>
      </div>

      {/* 안내 */}
      <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-100 rounded">
        💡 <strong>참고:</strong> 물리 계산 + 렌더링 시간이 33ms 이하면 30FPS 유지 가능합니다.
        네트워크 통신 시 50~200ms 추가 지연이 발생합니다.
      </div>
    </div>
  );
};
