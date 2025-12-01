import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '@/styles/theme'
import { useToast, type ToastType } from '@/contexts/ToastContext'
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamationCircle, HiXMark } from 'react-icons/hi2'

/**
 * 토스트 알림 컨테이너
 * 화면 우측 상단에 표시되는 알림 메시지
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <HiCheckCircle />
      case 'error':
        return <HiXCircle />
      case 'warning':
        return <HiExclamationCircle />
      case 'info':
        return <HiInformationCircle />
    }
  }

  const getColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return theme.colors.success
      case 'error':
        return theme.colors.error
      case 'warning':
        return theme.colors.warning
      case 'info':
        return theme.colors.primary.main
    }
  }

  return (
    <Container>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            $type={toast.type}
          >
            <IconWrapper $color={getColor(toast.type)}>
              {getIcon(toast.type)}
            </IconWrapper>
            <Message>{toast.message}</Message>
            <CloseButton onClick={() => removeToast(toast.id)}>
              <HiXMark />
            </CloseButton>
          </ToastItem>
        ))}
      </AnimatePresence>
    </Container>
  )
}

const Container = styled.div`
  position: fixed;
  top: 72px;
  right: ${theme.spacing.lg};
  z-index: ${theme.zIndex.toast};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  pointer-events: none;

  @media (max-width: ${theme.breakpoints.tablet}) {
    right: ${theme.spacing.base};
    left: ${theme.spacing.base};
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    top: auto;
    bottom: ${theme.spacing.base};
  }
`

const ToastItem = styled(motion.div)<{ $type: ToastType }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-width: 300px;
  max-width: 450px;
  padding: ${theme.spacing.base} ${theme.spacing.lg};
  background: ${theme.colors.background.secondary};
  border: 1px solid ${(props) => {
    switch (props.$type) {
      case 'success': return theme.colors.success
      case 'error': return theme.colors.error
      case 'warning': return theme.colors.warning
      case 'info': return theme.colors.primary.main
    }
  }};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.lg};
  pointer-events: auto;
  backdrop-filter: blur(10px);

  @media (max-width: ${theme.breakpoints.tablet}) {
    min-width: unset;
    max-width: unset;
  }
`

const IconWrapper = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${(props) => props.$color};
  flex-shrink: 0;

  svg {
    display: block;
  }
`

const Message = styled.div`
  flex: 1;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  line-height: ${theme.typography.lineHeight.relaxed};
  word-break: break-word;
`

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: ${theme.transitions.fast};
  border-radius: ${theme.borderRadius.sm};
  flex-shrink: 0;

  &:hover {
    background: ${theme.colors.background.tertiary};
    color: ${theme.colors.text.primary};
  }

  svg {
    display: block;
    font-size: 18px;
  }
`
