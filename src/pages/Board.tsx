import { useMemo, useRef, useState } from 'react'
import BoardCanvas, { CANVAS_W, CANVAS_H } from '../components/BoardCanvas'
import Poster from '../components/Poster'
import StickyNote from '../components/StickyNote'
import FloatingAddButton from '../components/FloatingAddButton'
import NewNoteModal from '../components/NewNoteModal'
import EnvelopeIntro from '../components/EnvelopeIntro'
import { generateAnonName } from '../lib/anonName'
import { pickColorKey } from '../lib/colors'
import {
  pickPlacement,
  Rect,
  SE_CTA_EXCLUSION,
  STICKY_W,
  STICKY_H,
  rectOverlaps,
} from '../lib/placement'
import {
  createToken,
  rememberOwnership,
  forgetOwnership,
  getMyToken,
  hasLeftNote,
} from '../lib/ownerToken'
import {
  getAdminPassword,
  clearAdminSession,
  isAdmin as checkIsAdmin,
} from '../lib/adminSession'
import { useNotes } from '../hooks/useNotes'

export default function Board() {
  const {
    notes,
    addNote,
    deleteNoteAsOwner,
    deleteNoteAsAdmin,
    repositionNotesAsAdmin,
    error,
  } = useNotes()
  const [modalOpen, setModalOpen] = useState(false)
  const [adminMode] = useState<boolean>(() => checkIsAdmin())
  const [opened, setOpened] = useState<boolean>(() => hasLeftNote())
  const hintRef = useRef<HTMLDivElement>(null)
  const addBtnRef = useRef<HTMLButtonElement>(null)

  const handleOpenInvitation = () => {
    setOpened(true)
  }

  const handleAddNote = async (content: string) => {
    const PAD = 6
    const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H)
    const canvasLeft = (window.innerWidth - CANVAS_W * scale) / 2
    const canvasTop = (window.innerHeight - CANVAS_H * scale) / 2
    const extras: Rect[] = []
    for (const el of [hintRef.current, addBtnRef.current]) {
      const b = el?.getBoundingClientRect()
      if (!b) continue
      extras.push({
        left: (b.left - canvasLeft) / scale - PAD,
        top: (b.top - canvasTop) / scale - PAD,
        right: (b.right - canvasLeft) / scale + PAD,
        bottom: (b.bottom - canvasTop) / scale + PAD,
      })
    }
    const placement = pickPlacement(notes, extras)
    const token = createToken()
    const inserted = await addNote({
      content,
      authorName: generateAnonName(),
      color: pickColorKey(),
      x: placement.x,
      y: placement.y,
      rotation: placement.rotation,
      ownerToken: token,
    })
    rememberOwnership(inserted.id, token)
  }

  const handleDelete = async (noteId: string) => {
    const ok = window.confirm('이 쪽지를 지울까요?')
    if (!ok) return

    if (adminMode) {
      const password = getAdminPassword()
      if (!password) return
      try {
        await deleteNoteAsAdmin(noteId, password)
        forgetOwnership(noteId)
      } catch (err) {
        const anyErr = err as { context?: { response?: Response } }
        const resp = anyErr?.context?.response
        const status = resp?.status
        let serverMsg: string | null = null
        if (resp) {
          try {
            const bodyJson = await resp.clone().json()
            serverMsg = bodyJson?.error ?? null
          } catch {
            /* ignore */
          }
        }
        console.error('[admin delete] failed', { status, serverMsg, err })

        if (status === 401) {
          clearAdminSession()
          alert('관리자 세션이 만료됐어요. 다시 로그인해주세요.')
          window.location.hash = '#/admin'
          return
        }

        alert(
          serverMsg
            ? `삭제 실패: ${serverMsg}`
            : '삭제 중 오류가 발생했어요. 잠시 뒤 다시 시도해주세요.',
        )
      }
      return
    }

    const token = getMyToken(noteId)
    if (!token) return
    try {
      await deleteNoteAsOwner(noteId, token)
      forgetOwnership(noteId)
    } catch (err) {
      console.error('[owner delete] failed', err)
      alert('쪽지를 지우지 못했어요. 잠시 뒤 다시 시도해주세요.')
    }
  }

  const handleReposition = async () => {
    const hidden = notes.filter((n) =>
      rectOverlaps(
        { left: n.x, top: n.y, right: n.x + STICKY_W, bottom: n.y + STICKY_H },
        SE_CTA_EXCLUSION,
      ),
    )
    if (hidden.length === 0) {
      alert('overlay에 가려지는 쪽지가 없어요.')
      return
    }
    if (!window.confirm(`${hidden.length}개 쪽지를 재배치할까요?`)) return
    const password = getAdminPassword()
    if (!password) return

    const safe = notes.filter((n) => !hidden.includes(n))
    const updates: Array<{ id: string; x: number; y: number }> = []
    const newRects: Array<{ x: number; y: number }> = []
    for (const h of hidden) {
      const p = pickPlacement([...safe, ...newRects], [SE_CTA_EXCLUSION])
      updates.push({ id: h.id, x: p.x, y: p.y })
      newRects.push({ x: p.x, y: p.y })
    }

    try {
      await repositionNotesAsAdmin(updates, password)
    } catch (err) {
      const anyErr = err as { context?: { response?: Response } }
      const resp = anyErr?.context?.response
      const status = resp?.status
      let serverMsg: string | null = null
      if (resp) {
        try {
          const bodyJson = await resp.clone().json()
          serverMsg = bodyJson?.error ?? null
        } catch {
          /* ignore */
        }
      }
      console.error('[admin reposition] failed', { status, serverMsg, err })

      if (status === 401) {
        clearAdminSession()
        alert('관리자 세션이 만료됐어요. 다시 로그인해주세요.')
        window.location.hash = '#/admin'
        return
      }
      alert(
        serverMsg
          ? `재배치 실패: ${serverMsg}`
          : '재배치 중 오류가 발생했어요. 잠시 뒤 다시 시도해주세요.',
      )
    }
  }

  const stickyProps = useMemo(() => {
    return notes.map((n) => {
      const canDelete = adminMode || getMyToken(n.id) !== null
      return {
        note: n,
        canDelete,
        onDelete: canDelete ? () => handleDelete(n.id) : undefined,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, adminMode])

  if (!opened) {
    return <EnvelopeIntro onOpen={handleOpenInvitation} />
  }

  return (
    <div className="fade-in">
      <BoardCanvas>
        <Poster />
        {stickyProps.map((p) => (
          <StickyNote key={p.note.id} {...p} />
        ))}
      </BoardCanvas>

      <FloatingAddButton ref={addBtnRef} onClick={() => setModalOpen(true)} />

      <button
        onClick={() => setOpened(false)}
        className="fixed z-30 flex items-center gap-1 rounded-full bg-neutral-900/85 px-3 py-1.5 text-[11px] font-medium text-white shadow"
        style={{
          top: 'calc(1rem + env(safe-area-inset-top))',
          right: 'calc(1rem + env(safe-area-inset-right))',
        }}
        aria-label="홈으로"
      >
        <span aria-hidden>←</span>
        <span>홈</span>
      </button>

      <div
        ref={hintRef}
        className="fade-in-up pointer-events-none fixed z-10 flex items-center gap-1 rounded-full bg-neutral-900/85 px-3 py-1.5 text-[11px] font-medium text-white shadow"
        style={{
          bottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
          right: 'calc(1.5rem + env(safe-area-inset-right))',
        }}
      >
        <span>쪽지를 남겨보세요</span>
        <span aria-hidden>↘</span>
      </div>

      <NewNoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddNote}
      />

      {adminMode && (
        <div
          className="fixed z-30 flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg"
          style={{
            top: 'calc(1rem + env(safe-area-inset-top))',
            left: 'calc(1rem + env(safe-area-inset-left))',
          }}
        >
          <span>관리자 모드</span>
          <button
            onClick={handleReposition}
            className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]"
          >
            overlay 비키기
          </button>
          <button
            onClick={() => {
              clearAdminSession()
              window.location.reload()
            }}
            className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]"
          >
            로그아웃
          </button>
        </div>
      )}

      {error && (
        <div
          className="pointer-events-none fixed left-1/2 z-30 -translate-x-1/2 rounded-full bg-red-500 px-4 py-2 text-xs text-white shadow-lg"
          style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
        >
          서버 연결 오류: {error}
        </div>
      )}
    </div>
  )
}
