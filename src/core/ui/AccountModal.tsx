import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { HiUser } from 'react-icons/hi2'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UserProfile {
  username: string
  email: string
}

/**
 * 계정 정보 모달
 * 현재 로그인된 사용자 정보 표시 및 로그아웃
 */
export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      fetchProfile()
    }
  }, [isOpen])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile({
        username: data.username,
        email: user.email || ''
      })
    } catch (error) {
      console.error('프로필 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>계정 정보</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Content>
          {loading ? (
            <LoadingText>로딩 중...</LoadingText>
          ) : profile ? (
            <>
              <ProfileSection>
                <Avatar>
                  <AvatarIcon>
                    <HiUser />
                  </AvatarIcon>
                </Avatar>

                <InfoGroup>
                  <Label>사용자 이름</Label>
                  <Value>{profile.username}</Value>
                </InfoGroup>

                <InfoGroup>
                  <Label>이메일</Label>
                  <Value>{profile.email}</Value>
                </InfoGroup>
              </ProfileSection>

              <LogoutButton onClick={handleLogout}>
                로그아웃
              </LogoutButton>
            </>
          ) : (
            <ErrorText>사용자 정보를 불러올 수 없습니다.</ErrorText>
          )}
        </Content>
      </Modal>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  backdrop-filter: blur(4px);
`

const Modal = styled.div`
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  border: 1px solid ${theme.colors.border.main};
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background.tertiary};
  border-bottom: 1px solid ${theme.colors.border.main};
`

const Title = styled.h2`
  margin: 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: ${theme.borderRadius.md};
  background: transparent;
  color: ${theme.colors.text.secondary};
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  transition: ${theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${theme.colors.background.elevated};
    color: ${theme.colors.text.primary};
  }
`

const Content = styled.div`
  padding: ${theme.spacing.xl};
`

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.background.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing.base};
  border: 2px solid ${theme.colors.primary.main};
  box-shadow: ${theme.shadows.glow};
`

const AvatarIcon = styled.span`
  font-size: 40px;
  color: ${theme.colors.primary.main};

  svg {
    display: block;
  }
`

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

const Label = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const Value = styled.span`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.regular};
  color: ${theme.colors.text.primary};
  word-break: break-word;
`

const LogoutButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  margin-top: ${theme.spacing.xl};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.error};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.normal};

  &:hover {
    background: #FF5588;
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`

const LoadingText = styled.p`
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.base};
`

const ErrorText = styled.p`
  text-align: center;
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.base};
`
