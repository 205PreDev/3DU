import { Component, ErrorInfo, ReactNode } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { Button } from '@/components/common/Button'
import { IoWarningOutline, IoRefreshOutline, IoHomeOutline } from 'react-icons/io5'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    window.location.href = '/categories'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorContainer>
          <ErrorContent>
            <IconWrapper>
              <IoWarningOutline />
            </IconWrapper>
            <Title>오류가 발생했습니다</Title>
            <Message>
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 홈으로 돌아가주세요.
            </Message>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <ErrorDetails>
                <DetailsTitle>오류 상세 정보 (개발 모드)</DetailsTitle>
                <ErrorMessage>{this.state.error.toString()}</ErrorMessage>
                {this.state.errorInfo && (
                  <StackTrace>{this.state.errorInfo.componentStack}</StackTrace>
                )}
              </ErrorDetails>
            )}

            <ButtonGroup>
              <Button
                onClick={this.handleReset}
                variant="secondary"
                size="lg"
              >
                <IoRefreshOutline />
                <span>다시 시도</span>
              </Button>
              <Button
                onClick={this.handleGoHome}
                size="lg"
              >
                <IoHomeOutline />
                <span>홈으로 이동</span>
              </Button>
            </ButtonGroup>
          </ErrorContent>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

// 스타일 컴포넌트
const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.primary};
`

const ErrorContent = styled.div`
  max-width: 600px;
  width: 100%;
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['2xl']};
  box-shadow: ${theme.shadows.xl};
  text-align: center;

  @media (max-width: 768px) {
    padding: ${theme.spacing.xl};
  }
`

const IconWrapper = styled.div`
  font-size: 64px;
  color: ${theme.colors.error};
  margin-bottom: ${theme.spacing.xl};
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  svg {
    display: block;
    margin: 0 auto;
  }
`

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.base};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xl};
  }
`

const Message = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin-bottom: ${theme.spacing.xl};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.sm};
  }
`

const ErrorDetails = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
  margin-bottom: ${theme.spacing.xl};
  text-align: left;
  max-height: 300px;
  overflow-y: auto;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.secondary};
    border-radius: ${theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.main};
    border-radius: ${theme.borderRadius.sm};

    &:hover {
      background: ${theme.colors.border.strong};
    }
  }
`

const DetailsTitle = styled.h3`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`

const ErrorMessage = styled.pre`
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.error};
  margin-bottom: ${theme.spacing.sm};
  white-space: pre-wrap;
  word-break: break-word;
`

const StackTrace = styled.pre`
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  white-space: pre-wrap;
  word-break: break-word;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;

  button {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
  }

  @media (max-width: 768px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`
