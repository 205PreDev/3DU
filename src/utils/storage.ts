/**
 * localStorage 키 관리
 * 프로젝트별 prefix를 사용하여 키 충돌 방지
 */
export const STORAGE_KEYS = {
  INTRO_SHOWN: 'physics_simulator_intro_shown',
  USER_PROGRESS: 'physics_simulator_progress',
} as const

/**
 * localStorage에 값을 저장
 */
export const setStorageItem = (key: string, value: any): void => {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error('localStorage 저장 실패:', error)
  }
}

/**
 * localStorage에서 값을 가져옴
 */
export const getStorageItem = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue ?? null
    }
    return JSON.parse(item) as T
  } catch (error) {
    console.error('localStorage 읽기 실패:', error)
    return defaultValue ?? null
  }
}

/**
 * localStorage에서 값을 제거
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('localStorage 삭제 실패:', error)
  }
}

/**
 * localStorage 전체 초기화
 */
export const clearStorage = (): void => {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('localStorage 초기화 실패:', error)
  }
}
