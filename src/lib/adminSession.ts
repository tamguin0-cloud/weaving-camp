// 관리자 세션: sessionStorage 에만 저장 (탭 닫으면 자동 로그아웃).

const KEY = 'camp_admin_password'

export function setAdminSession(password: string) {
  try {
    sessionStorage.setItem(KEY, password)
  } catch {
    // ignore
  }
}

export function getAdminPassword(): string | null {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function clearAdminSession() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export function isAdmin(): boolean {
  return getAdminPassword() !== null
}
