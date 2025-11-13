import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { theme } from '@/styles/theme'
import { IntroModal } from '@/components/modals/IntroModal'
import { SubjectDetailModal } from '@/components/modals/SubjectDetailModal'
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/utils/storage'
import { IoRocketOutline } from 'react-icons/io5'
import { FaLock } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  title: string
  subtitle: string
  isImplemented: boolean
  route?: string
  detailData?: {
    title: string
    learningContent: string[]
    learningEffects: string[]
  }
}

const categories: Category[] = [
  {
    id: 'mechanics',
    title: '고전역학',
    subtitle: '투구 모듈',
    isImplemented: true,
    route: '/categories/mechanics/pitch',
    detailData: {
      title: '고전역학',
      learningContent: [
        '포물선 운동과 운동 방정식',
        '유체 항력의 물리적 원리',
        '회전에 의한 마그누스 효과',
      ],
      learningEffects: [
        '힘과 가속도의 관계 이해',
        '벡터의 합성과 분해',
        '컴퓨터 시뮬레이션의 원리',
      ],
    },
  },
  {
    id: 'waves',
    title: '파동',
    subtitle: '준비 중',
    isImplemented: false,
  },
  {
    id: 'thermodynamics',
    title: '열역학',
    subtitle: '준비 중',
    isImplemented: false,
  },
  {
    id: 'electromagnetism',
    title: '전자기학',
    subtitle: '준비 중',
    isImplemented: false,
  },
  {
    id: 'optics',
    title: '광학',
    subtitle: '준비 중',
    isImplemented: false,
  },
  {
    id: 'modern-physics',
    title: '현대물리학',
    subtitle: '준비 중',
    isImplemented: false,
  },
]

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate()
  const [showIntroModal, setShowIntroModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // 첫 방문 확인 및 소개 모달 표시
  useEffect(() => {
    const introShown = getStorageItem<boolean>(STORAGE_KEYS.INTRO_SHOWN, false)
    if (!introShown) {
      setShowIntroModal(true)
    }
  }, [])

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // 소개 모달 닫기
  const handleIntroClose = () => {
    setShowIntroModal(false)
    setStorageItem(STORAGE_KEYS.INTRO_SHOWN, true)
  }

  // 카테고리 카드 클릭
  const handleCategoryClick = (category: Category) => {
    if (!category.isImplemented) return

    setSelectedCategory(category)
    setShowDetailModal(true)
  }

  // 시뮬레이터 시작
  const handleStartSimulator = () => {
    if (selectedCategory?.route) {
      navigate(selectedCategory.route)
    }
  }

  // 소개 모달 재표시 (직관적인 방법)
  const handleShowIntro = () => {
    setShowIntroModal(true)
  }

  return (
    <PageContainer>
      <Background>
        <AnimatedOrb $delay={0} />
        <AnimatedOrb $delay={2} />
        <AnimatedOrb $delay={4} />
      </Background>

      <Header>
        <LogoSection>
          <Logo>
            <IoRocketOutline />
          </Logo>
          <HeaderTitle>교육용 물리 시뮬레이터</HeaderTitle>
        </LogoSection>
        <HeaderActions>
          <IntroButton onClick={handleShowIntro}>소개 보기</IntroButton>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </HeaderActions>
      </Header>

      <ContentWrapper>
        <Title>학습할 과목을 선택하세요</Title>
        <Subtitle>각 과목을 클릭하여 학습 내용을 확인하고 시뮬레이션을 시작하세요</Subtitle>

        <CategoryGrid>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              $isImplemented={category.isImplemented}
              onClick={() => handleCategoryClick(category)}
            >
              {!category.isImplemented && (
                <LockOverlay>
                  <LockIcon>
                    <FaLock />
                  </LockIcon>
                  <LockText>준비 중</LockText>
                </LockOverlay>
              )}
              <CardContent>
                <CardTitle>{category.title}</CardTitle>
                <CardSubtitle>{category.subtitle}</CardSubtitle>
              </CardContent>
              {category.isImplemented && <CardHoverEffect />}
            </CategoryCard>
          ))}
        </CategoryGrid>
      </ContentWrapper>

      <IntroModal isOpen={showIntroModal} onClose={handleIntroClose} />

      {selectedCategory?.detailData && (
        <SubjectDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onStart={handleStartSimulator}
          title={selectedCategory.detailData.title}
          learningContent={selectedCategory.detailData.learningContent}
          learningEffects={selectedCategory.detailData.learningEffects}
        />
      )}
    </PageContainer>
  )
}

// 애니메이션
const float = keyframes`
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
`

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`

// 스타일 컴포넌트
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.primary};
  position: relative;
  overflow-x: hidden;
`

const Background = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 0;
`

const AnimatedOrb = styled.div<{ $delay: number }>`
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, ${theme.colors.primary.main}40 0%, transparent 70%);
  animation: ${float} 20s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;

  &:nth-child(1) {
    top: -250px;
    left: -250px;
  }

  &:nth-child(2) {
    bottom: -200px;
    right: -200px;
    background: radial-gradient(circle, ${theme.colors.secondary.main}40 0%, transparent 70%);
  }

  &:nth-child(3) {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, ${theme.colors.success}20 0%, transparent 70%);
  }
`

const Header = styled.header`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.xl} ${theme.spacing['2xl']};
  border-bottom: 1px solid ${theme.colors.border.main};
  backdrop-filter: blur(10px);
  background: ${theme.colors.background.secondary}80;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.base};
    padding: ${theme.spacing.base};
  }
`

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.base};
`

const Logo = styled.div`
  font-size: 32px;
  color: ${theme.colors.primary.main};
  filter: drop-shadow(0 2px 8px rgba(0, 217, 255, 0.4));

  svg {
    display: block;
  }
`

const HeaderTitle = styled.h1`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.lg};
  }
`

const HeaderActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};

  @media (max-width: 768px) {
    width: 100%;
  }
`

const IntroButton = styled.button`
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.main};
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing.sm} ${theme.spacing.base};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${theme.transitions.normal};

  &:hover {
    background: ${theme.colors.background.elevated};
    border-color: ${theme.colors.primary.main};
  }

  @media (max-width: 768px) {
    flex: 1;
  }
`

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid ${theme.colors.border.main};
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.sm} ${theme.spacing.base};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${theme.transitions.normal};

  &:hover {
    color: ${theme.colors.error};
    border-color: ${theme.colors.error};
  }

  @media (max-width: 768px) {
    flex: 1;
  }
`

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing['3xl']} ${theme.spacing.xl};
  animation: ${fadeInUp} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: ${theme.spacing.xl} ${theme.spacing.base};
  }
`

const Title = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.base};
  line-height: ${theme.typography.lineHeight.tight};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing['2xl']};
  line-height: ${theme.typography.lineHeight.relaxed};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.sm};
  }
`

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.base};

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const CategoryCard = styled.div<{ $isImplemented: boolean }>`
  position: relative;
  background: ${props =>
    props.$isImplemented
      ? `linear-gradient(135deg, ${theme.colors.primary.main}15 0%, ${theme.colors.secondary.main}15 100%)`
      : theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing['2xl']};
  min-height: 180px;
  cursor: ${props => (props.$isImplemented ? 'pointer' : 'not-allowed')};
  transition: ${theme.transitions.normal};
  opacity: ${props => (props.$isImplemented ? 1 : 0.5)};
  overflow: hidden;

  &:hover {
    ${props =>
      props.$isImplemented &&
      `
      border-color: ${theme.colors.primary.main};
      transform: translateY(-4px);
      box-shadow: ${theme.shadows.lg};
    `}
  }

  @media (max-width: 768px) {
    min-height: 150px;
    padding: ${theme.spacing.xl};
  }
`

const CardContent = styled.div`
  position: relative;
  z-index: 2;
`

const CardTitle = styled.h3`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xl};
  }
`

const CardSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.sm};
  }
`

const CardHoverEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    ${theme.colors.primary.main}20,
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.6s;
  pointer-events: none;

  ${CategoryCard}:hover & {
    animation: ${shimmer} 1.5s infinite;
  }
`

const LockOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  z-index: 3;
`

const LockIcon = styled.div`
  font-size: 48px;
  color: ${theme.colors.text.tertiary};

  svg {
    display: block;
  }
`

const LockText = styled.span`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.tertiary};
  background: ${theme.colors.background.secondary};
  padding: ${theme.spacing.xs} ${theme.spacing.base};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.light};
`
