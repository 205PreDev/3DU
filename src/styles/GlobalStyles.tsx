import { createGlobalStyle } from 'styled-components'
import { theme } from './theme'

export const GlobalStyles = createGlobalStyle`
  /* Inter 폰트 import */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.regular};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text.primary};
    background: ${theme.colors.background.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    width: 100%;
    height: 100%;
  }

  /* 스크롤바 스타일 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
    border-radius: ${theme.borderRadius.sm};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary.main};
    border-radius: ${theme.borderRadius.sm};
    transition: ${theme.transitions.normal};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primary.light};
  }

  /* 버튼 기본 스타일 초기화 및 fallback */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    /* fallback 스타일 - styled-components 로딩 전 기본 모양 제공 */
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
    background: linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%);
    color: ${theme.colors.text.primary};
  }

  button:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 입력 필드 기본 스타일 및 fallback */
  input, textarea, select {
    font-family: inherit;
    outline: none;
    /* fallback 스타일 */
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid ${theme.colors.border.main};
    background: ${theme.colors.background.elevated};
    color: ${theme.colors.text.primary};
    font-size: ${theme.typography.fontSize.base};
    transition: ${theme.transitions.fast};
  }

  input:focus, textarea:focus, select:focus {
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1);
  }

  input::placeholder, textarea::placeholder {
    color: ${theme.colors.text.tertiary};
  }

  /* 링크 기본 스타일 */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* Selection 색상 */
  ::selection {
    background: ${theme.colors.primary.main};
    color: ${theme.colors.text.primary};
  }

  /* 포커스 스타일 */
  *:focus-visible {
    outline: 2px solid ${theme.colors.primary.main};
    outline-offset: 2px;
  }
`
