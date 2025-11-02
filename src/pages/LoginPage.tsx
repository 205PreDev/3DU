import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { supabase } from '../lib/supabase'
import { theme } from '@/styles/theme'
import { Button } from '@/components/common/Button'
import { Input, Label, FormGroup, ErrorMessage } from '@/components/common/Input'
import { IoRocketOutline } from 'react-icons/io5'
import { FaChartLine, FaCube } from 'react-icons/fa'
import { MdSpeed } from 'react-icons/md'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        navigate('/pitch')
      }
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <Background>
        <AnimatedOrb $delay={0} />
        <AnimatedOrb $delay={2} />
        <AnimatedOrb $delay={4} />
      </Background>

      <ContentWrapper>
        <LogoSection>
          <Logo>
            <IoRocketOutline />
          </Logo>
          <Title>교육용 물리 시뮬레이터</Title>
          <Subtitle>실시간 3D 시뮬레이션으로 물리 법칙을 경험하세요</Subtitle>
        </LogoSection>

        <Card>
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardSubtitle>계정에 로그인하여 시뮬레이터를 사용하세요</CardSubtitle>
          </CardHeader>

          <Form onSubmit={handleLogin}>
            <FormGroup>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                autoComplete="email"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
              />
            </FormGroup>

            {error && (
              <ErrorMessage>{error}</ErrorMessage>
            )}

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              fullWidth
              size="lg"
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </Form>

          <Divider>
            <DividerLine />
            <DividerText>또는</DividerText>
            <DividerLine />
          </Divider>

          <FooterText>
            계정이 없으신가요?{' '}
            <SignupLink onClick={() => navigate('/signup')}>
              회원가입
            </SignupLink>
          </FooterText>
        </Card>

        <FeatureList>
          <FeatureItem>
            <FeatureIcon>
              <MdSpeed />
            </FeatureIcon>
            <FeatureText>실시간 물리 계산</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>
              <FaCube />
            </FeatureIcon>
            <FeatureText>3D 시각화</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>
              <FaChartLine />
            </FeatureIcon>
            <FeatureText>데이터 분석</FeatureText>
          </FeatureItem>
        </FeatureList>
      </ContentWrapper>
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

// 스타일 컴포넌트
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.background.primary};
  position: relative;
  overflow: hidden;
`

const Background = styled.div`
  position: absolute;
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

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  animation: ${fadeInUp} 0.6s ease-out;
`

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`

const Logo = styled.div`
  font-size: 64px;
  margin-bottom: ${theme.spacing.base};
  color: ${theme.colors.primary.main};
  filter: drop-shadow(0 4px 12px rgba(0, 217, 255, 0.4));

  svg {
    display: block;
  }
`

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  background: ${theme.colors.primary.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`

const Card = styled.div`
  background: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['2xl']};
  box-shadow: ${theme.shadows.xl};
  backdrop-filter: blur(10px);
`

const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.xl};
`

const CardTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`

const CardSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.base};
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.xl} 0;
`

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: ${theme.colors.border.main};
`

const DividerText = styled.span`
  color: ${theme.colors.text.tertiary};
  font-size: ${theme.typography.fontSize.sm};
`

const FooterText = styled.p`
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`

const SignupLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary.main};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.fast};
  text-decoration: underline;

  &:hover {
    color: ${theme.colors.primary.light};
  }
`

const FeatureList = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing['2xl']};
`

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
`

const FeatureIcon = styled.div`
  font-size: 24px;
  color: ${theme.colors.primary.main};
  filter: drop-shadow(0 2px 8px rgba(0, 217, 255, 0.3));

  svg {
    display: block;
  }
`

const FeatureText = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.tertiary};
  white-space: nowrap;
`
