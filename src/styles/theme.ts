/**
 * 디자인 시스템 - 색상, 타이포그래피, 간격, 그림자 정의
 * 모던 사이언스 테마
 */

export const theme = {
  // 색상 팔레트
  colors: {
    // Primary (메인 액센트)
    primary: {
      main: '#00D9FF',      // 밝은 시안 (과학적 느낌)
      light: '#5BE7FF',
      dark: '#00A8CC',
      gradient: 'linear-gradient(135deg, #00D9FF 0%, #0099FF 100%)'
    },

    // Secondary (보조 액센트)
    secondary: {
      main: '#7B2FFF',      // 보라 (에너지, 역동성)
      light: '#A166FF',
      dark: '#5500DD'
    },

    // Success, Warning, Error
    success: '#00E676',
    warning: '#FFB300',
    error: '#FF3D71',

    // Background (배경 계층)
    background: {
      primary: '#0A0E27',    // 최하단 (가장 어두운 배경)
      secondary: '#131832',  // 중간 (패널 배경)
      tertiary: '#1C2340',   // 상단 (카드, 버튼)
      elevated: '#252D4D'    // 강조 (호버, 선택)
    },

    // Text (텍스트)
    text: {
      primary: '#FFFFFF',
      secondary: '#B4B9D5',
      tertiary: '#7E8AAB',
      disabled: '#4A5278'
    },

    // Border (테두리)
    border: {
      light: 'rgba(255, 255, 255, 0.08)',
      main: 'rgba(255, 255, 255, 0.12)',
      strong: 'rgba(255, 255, 255, 0.2)'
    },

    // Overlay (오버레이)
    overlay: 'rgba(10, 14, 39, 0.7)',

    // 3D Viewer 전용
    viewer: {
      trajectory: '#00E676',
      trajectoryA: '#00D9FF',
      trajectoryB: '#FF3D71'
    }
  },

  // 타이포그래피
  typography: {
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
    },
    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },

  // 간격 (8px 기준)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    base: '16px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px'
  },

  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },

  // 그림자
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 12px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.25)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.35)',
    glow: '0 0 20px rgba(0, 217, 255, 0.4)',
    glowStrong: '0 0 30px rgba(0, 217, 255, 0.6)'
  },

  // 애니메이션
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease'
  },

  // Z-Index
  zIndex: {
    base: 1,
    dropdown: 100,
    sticky: 500,
    modal: 1000,
    tooltip: 1500
  }
}

export type Theme = typeof theme
