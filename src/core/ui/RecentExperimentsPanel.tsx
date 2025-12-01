import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { supabaseExperimentsService, SupabaseExperiment } from '@/utils/supabaseExperiments'
import { PitchParameters } from '@/types'
import { ExperimentDetailModal } from './ExperimentDetailModal'

interface RecentExperimentsPanelProps {
  onLoad: (params: PitchParameters) => void
  onSave: (name: string) => void
}

/**
 * 최근 실험 패널
 * Supabase 클라우드 데이터베이스 기반 실험 저장/불러오기
 */
export function RecentExperimentsPanel({ onLoad, onSave }: RecentExperimentsPanelProps) {
  const [experiments, setExperiments] = useState<SupabaseExperiment[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [selectedExperiment, setSelectedExperiment] = useState<SupabaseExperiment | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 실험 목록 로드
  useEffect(() => {
    loadExperiments()
  }, [])

  const loadExperiments = async () => {
    setIsLoading(true)
    try {
      const data = await supabaseExperimentsService.getAll(10)
      setExperiments(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveClick = () => {
    const defaultName = `실험 ${new Date().toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}`
    setSaveName(defaultName)
    setShowSaveModal(true)
  }

  const handleSaveConfirm = () => {
    if (saveName.trim()) {
      onSave(saveName.trim())
      setShowSaveModal(false)
      setSaveName('')
      loadExperiments()
    }
  }

  const handleLoad = (experiment: SupabaseExperiment) => {
    if (experiment.params) {
      onLoad(experiment.params)
    } else {
      alert('이 실험의 데이터가 손상되었습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('이 실험을 삭제하시겠습니까?')) {
      setIsLoading(true)
      try {
        await supabaseExperimentsService.delete(id)
        await loadExperiments()
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteAll = async () => {
    if (confirm('모든 실험을 삭제하시겠습니까?')) {
      setIsLoading(true)
      try {
        await supabaseExperimentsService.deleteAll()
        await loadExperiments()
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Container>
      <Header>
        <Title>📋 최근 실험</Title>
        <Count>{experiments.length} / 10</Count>
      </Header>

      <Actions>
        <SaveButton onClick={handleSaveClick}>
          💾 현재 설정 저장
        </SaveButton>
        {experiments.length > 0 && (
          <DeleteAllButton onClick={handleDeleteAll}>
            🗑️ 전체 삭제
          </DeleteAllButton>
        )}
      </Actions>

      {isLoading ? (
        <LoadingState>
          <LoadingSpinner>⏳</LoadingSpinner>
          <LoadingText>데이터 불러오는 중...</LoadingText>
        </LoadingState>
      ) : experiments.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📭</EmptyIcon>
          <EmptyText>저장된 실험이 없습니다</EmptyText>
          <EmptyHint>시뮬레이션 후 "현재 설정 저장"을 클릭하세요</EmptyHint>
        </EmptyState>
      ) : (
        <ExperimentList>
          {experiments.map(exp => (
            <ExperimentCard key={exp.id}>
              <ExperimentHeader>
                <ExperimentName>{exp.name}</ExperimentName>
                <ExperimentDate>
                  {new Date(exp.created_at).toLocaleString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </ExperimentDate>
              </ExperimentHeader>

              <ExperimentInfo>
                <InfoItem>
                  속도: {exp.params?.initial?.velocity ?? 'N/A'} m/s
                </InfoItem>
                <InfoItem>
                  회전: Y {exp.params?.initial?.spin?.y ?? 'N/A'} rpm
                </InfoItem>
                <InfoItem>
                  {exp.result?.isStrike ? '⚾ 스트라이크' : '❌ 볼'}
                </InfoItem>
              </ExperimentInfo>

              <ExperimentActions>
                <DetailButton onClick={() => setSelectedExperiment(exp)}>
                  상세 보기
                </DetailButton>
                <LoadButton onClick={() => handleLoad(exp)}>
                  불러오기
                </LoadButton>
                <DeleteButton onClick={() => handleDelete(exp.id)}>
                  삭제
                </DeleteButton>
              </ExperimentActions>
            </ExperimentCard>
          ))}
        </ExperimentList>
      )}

      {showSaveModal && (
        <ModalOverlay onClick={() => setShowSaveModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>실험 저장</ModalTitle>
            <Input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="실험 이름 입력"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSaveConfirm()
              }}
            />
            <ModalActions>
              <CancelButton onClick={() => setShowSaveModal(false)}>
                취소
              </CancelButton>
              <ConfirmButton onClick={handleSaveConfirm}>
                저장
              </ConfirmButton>
            </ModalActions>
          </Modal>
        </ModalOverlay>
      )}

      <ExperimentDetailModal
        experiment={selectedExperiment}
        onClose={() => setSelectedExperiment(null)}
      />
    </Container>
  )
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0; /* Flexbox 스크롤 허용 */
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #4caf50;
`

const Count = styled.span`
  font-size: 14px;
  color: #aaa;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
`

const SaveButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: #4caf50;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #45a049;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`

const DeleteAllButton = styled.button`
  padding: 10px 16px;
  border: 1px solid #f44336;
  border-radius: 6px;
  background: transparent;
  color: #f44336;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(244, 67, 54, 0.1);
  }
`

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: rgba(76, 175, 80, 0.05);
  border: 2px dashed #4caf50;
  border-radius: 8px;
`

const LoadingSpinner = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  animation: spin 2s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const LoadingText = styled.div`
  font-size: 14px;
  color: #4caf50;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: rgba(76, 175, 80, 0.05);
  border: 2px dashed #4caf50;
  border-radius: 8px;
`

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
`

const EmptyText = styled.div`
  font-size: 14px;
  color: #ccc;
  margin-bottom: 6px;
`

const EmptyHint = styled.div`
  font-size: 12px;
  color: #888;
`

const ExperimentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a2e;
  }

  &::-webkit-scrollbar-thumb {
    background: #4caf50;
    border-radius: 3px;
  }
`

const ExperimentCard = styled.div`
  padding: 12px;
  background: #16213e;
  border-radius: 8px;
  border-left: 3px solid #4caf50;
  transition: all 0.2s;

  &:hover {
    background: #1a2540;
    transform: translateX(4px);
  }
`

const ExperimentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const ExperimentName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`

const ExperimentDate = styled.div`
  font-size: 12px;
  color: #888;
`

const ExperimentInfo = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
`

const InfoItem = styled.div`
  font-size: 12px;
  color: #aaa;
`

const ExperimentActions = styled.div`
  display: flex;
  gap: 6px;
`

const DetailButton = styled.button`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #2196f3;
  border-radius: 4px;
  background: transparent;
  color: #2196f3;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(33, 150, 243, 0.2);
  }
`

const LoadButton = styled.button`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #4caf50;
  border-radius: 4px;
  background: transparent;
  color: #4caf50;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(76, 175, 80, 0.2);
  }
`

const DeleteButton = styled.button`
  padding: 6px 10px;
  border: 1px solid #f44336;
  border-radius: 4px;
  background: transparent;
  color: #f44336;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(244, 67, 54, 0.1);
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`

const Modal = styled.div`
  background: #1a1a2e;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #4caf50;
`

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #4caf50;
  border-radius: 6px;
  background: #16213e;
  color: #ffffff;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: #45a049;
  }
`

const ModalActions = styled.div`
  display: flex;
  gap: 8px;
`

const CancelButton = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid #888;
  border-radius: 6px;
  background: transparent;
  color: #888;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #aaa;
    color: #aaa;
  }
`

const ConfirmButton = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: #4caf50;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #45a049;
  }
`
