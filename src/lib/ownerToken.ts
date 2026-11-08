// localStorage 에 "내가 올린 쪽지 id → 토큰" 매핑을 저장.
// 서버는 owner_token 을 클라이언트에 노출하지 않으므로,
// id 로 "내 쪽지인지" 판별하고 삭제 시 저장해둔 토큰을 헤더에 담아 보냄.

const KEY = 'camp_note_owners'

type OwnerMap = Record<string, string>

function readMap(): OwnerMap {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as OwnerMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeMap(m: OwnerMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m))
  } catch {
    // storage full/disabled — 무시
  }
}

export function createToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // crypto.randomUUID 는 secure context 에서만 쓸 수 있음 (LAN HTTP 등은 폴백).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function rememberOwnership(noteId: string, token: string): void {
  const m = readMap()
  m[noteId] = token
  writeMap(m)
}

export function forgetOwnership(noteId: string): void {
  const m = readMap()
  if (noteId in m) {
    delete m[noteId]
    writeMap(m)
  }
}

export function getMyToken(noteId: string): string | null {
  return readMap()[noteId] ?? null
}

export function hasLeftNote(): boolean {
  return Object.keys(readMap()).length > 0
}
