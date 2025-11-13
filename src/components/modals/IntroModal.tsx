import React, { useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '@/styles/theme'
import { Button } from '@/components/common/Button'
import { IoRocketOutline } from 'react-icons/io5'

interface IntroModalProps {
  isOpen: boolean
  onClose: () => void
}

export const IntroModal: React.FC<IntroModalProps> = ({ isOpen, onClose }) => {
  // ESC 키로 닫기 비활성화 (반드시 "다음" 버튼으로 진행)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // 포커스 트랩
  useEffect(() => {
    if (isOpen) {
      const modalElement = document.getElementById('intro-modal')
      modalElement?.focus()
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
          onClick={(e) => e.stopPropagation()} // 배경 클릭 비활성화
        >
          <ModalContainer
            id="intro-modal"
            as={motion.div}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="intro-modal-title"
            tabIndex={-1}
          >
            <IconWrapper>
              <Icon>
                <IoRocketOutline />
              </Icon>
            </IconWrapper>

            <Title id="intro-modal-title">
              3D 물리 시뮬레이터에 오신 것을 환영합니다
            </Title>

            <Content>
              <Description>
                <DescriptionItem>
                  <Strong>고등학교~대학교 수준의 물리학</Strong>을 학습하기 위한 시뮬레이터입니다.
                </DescriptionItem>
                <DescriptionItem>
                  <Strong>고등학교 물리:</Strong> 2022 개정 교육과정 기준
                </DescriptionItem>
                <DescriptionItem>
                  <Strong>대학교 물리:</Strong> 일반물리학 기초~중급 (역학)
                </DescriptionItem>
                <DescriptionItem>
                  실제 물리 법칙을 <Strong>3D로 시각화</Strong>하여 직관적 학습이 가능합니다.
                </DescriptionItem>
              </Description>

              <FeatureGrid>
                <Feature>
                  <FeatureIcon>🎯</FeatureIcon>
                  <FeatureTitle>실시간 시뮬레이션</FeatureTitle>
                  <FeatureDesc>물리 법칙을 즉시 확인</FeatureDesc>
                </Feature>
                <Feature>
                  <FeatureIcon>📊</FeatureIcon>
                  <FeatureTitle>데이터 분석</FeatureTitle>
                  <FeatureDesc>그래프와 수치 제공</FeatureDesc>
                </Feature>
                <Feature>
                  <FeatureIcon>🔬</FeatureIcon>
                  <FeatureTitle>실험 비교</FeatureTitle>
                  <FeatureDesc>여러 조건 동시 비교</FeatureDesc>
                </Feature>
              </FeatureGrid>
            </Content>

            <ButtonWrapper>
              <Button
                onClick={onClose}
                size="lg"
                fullWidth
                aria-label="다음 단계로 진행"
              >
                다음
              </Button>
            </ButtonWrapper>
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

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    max-width: 90%;
    padding: ${theme.spacing.xl};
  }
`

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacing.xl};
`

const Icon = styled.div`
  font-size: 64px;
  color: ${theme.colors.primary.main};
  filter: drop-shadow(0 4px 12px rgba(0, 217, 255, 0.4));
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  svg {
    display: block;
  }
`

const Title = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  line-height: ${theme.typography.lineHeight.tight};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xl};
  }
`

const Content = styled.div`
  margin-bottom: ${theme.spacing['2xl']};
`

const Description = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
  margin-bottom: ${theme.spacing.xl};
`

const DescriptionItem = styled.p`
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
  }

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.sm};
  }
`

const Strong = styled.strong`
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.semibold};
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.base};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Feature = styled.div`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.base};
  text-align: center;
  transition: ${theme.transitions.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    transform: translateY(-2px);
  }
`

const FeatureIcon = styled.div`
  font-size: 32px;
  margin-bottom: ${theme.spacing.xs};
`

const FeatureTitle = styled.h3`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`

const FeatureDesc = styled.p`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  line-height: ${theme.typography.lineHeight.normal};
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`
