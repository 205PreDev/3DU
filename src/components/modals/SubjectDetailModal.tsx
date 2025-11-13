import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '@/styles/theme'
import { Button } from '@/components/common/Button'
import { IoClose } from 'react-icons/io5'
import { FaBook, FaBrain, FaClock } from 'react-icons/fa'

interface SubjectDetailModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
  title: string
  learningContent: string[]
  learningEffects: string[]
  estimatedTime: string
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  isOpen,
  onClose,
  onStart,
  title,
  learningContent,
  learningEffects,
  estimatedTime,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // ESC 키로 닫기 (접근성)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // 포커스 트랩 (접근성)
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTabKey)
      closeButtonRef.current?.focus()

      return () => {
        document.removeEventListener('keydown', handleTabKey)
      }
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <ModalContainer
            ref={modalRef}
            as={motion.div}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-modal-title"
          >
            <CloseButton
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="모달 닫기"
            >
              <IoClose />
            </CloseButton>

            <Header>
              <Title id="subject-modal-title">{title}</Title>
              <TimeInfo>
                <FaClock />
                <span>예상 소요 시간: {estimatedTime}</span>
              </TimeInfo>
            </Header>

            <Content>
              <Section>
                <SectionHeader>
                  <SectionIcon>
                    <FaBook />
                  </SectionIcon>
                  <SectionTitle>배울 내용</SectionTitle>
                </SectionHeader>
                <List>
                  {learningContent.map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </List>
              </Section>

              <Section>
                <SectionHeader>
                  <SectionIcon>
                    <FaBrain />
                  </SectionIcon>
                  <SectionTitle>학습 효과</SectionTitle>
                </SectionHeader>
                <List>
                  {learningEffects.map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </List>
              </Section>
            </Content>

            <Footer>
              <Button
                onClick={onStart}
                size="lg"
                fullWidth
                aria-label="학습 시작하기"
              >
                시작하기!
              </Button>
            </Footer>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  )
}

// 스타일 컴포넌트
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: ${theme.spacing.base};
`

const ModalContainer = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['2xl']};
  max-width: 600px;
  width: 100%;
  box-shadow: ${theme.shadows.xl};
  position: relative;
  max-height: 90vh;
  overflow-y: auto;

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    max-width: 90%;
    padding: ${theme.spacing.xl};
  }

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.background.tertiary};
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

const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing.base};
  right: ${theme.spacing.base};
  background: transparent;
  border: none;
  color: ${theme.colors.text.secondary};
  font-size: 24px;
  cursor: pointer;
  transition: ${theme.transitions.fast};
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.md};

  &:hover {
    color: ${theme.colors.text.primary};
    background: ${theme.colors.background.tertiary};
  }

  &:focus {
    outline: 2px solid ${theme.colors.primary.main};
    outline-offset: 2px;
  }

  svg {
    display: block;
  }
`

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
  padding-right: ${theme.spacing['2xl']};
`

const Title = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.base};
  line-height: ${theme.typography.lineHeight.tight};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xl};
  }
`

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};

  svg {
    color: ${theme.colors.primary.main};
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing['2xl']};
`

const Section = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.base};
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.base};
`

const SectionIcon = styled.div`
  font-size: 20px;
  color: ${theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    display: block;
  }
`

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`

const ListItem = styled.li`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
  padding-left: ${theme.spacing.base};
  position: relative;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: ${theme.colors.primary.main};
    font-weight: ${theme.typography.fontWeight.bold};
  }

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.sm};
  }
`

const Footer = styled.div`
  display: flex;
  justify-content: center;
  border-top: 1px solid ${theme.colors.border.light};
  padding-top: ${theme.spacing.xl};
`
