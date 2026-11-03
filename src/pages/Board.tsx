import { useMemo, useState } from 'react'
import BoardCanvas from '../components/BoardCanvas'
import Poster from '../components/Poster'
import StickyNote from '../components/StickyNote'
import FloatingAddButton from '../components/FloatingAddButton'
import NewNoteModal from '../components/NewNoteModal'
import EnvelopeIntro from '../components/EnvelopeIntro'
import { generateAnonName } from '../lib/anonName'
import { pickColorKey } from '../lib/colors'
import { pickPlacement } from '../lib/placement'
import {
  createToken,
  rememberOwnership,
  forgetOwnership,
  getMyToken,
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
    loading,
    addNote,
    deleteNoteAsOwner,
    deleteNoteAsAdmin,
    error,
  } = useNotes()
  const [modalOpen, setModalOpen] = useState(false)
  const [adminMode] = useState<boolean>(() => checkIsAdmin())
  const [opened, setOpened] = useState<boolean>(false)

  const handleOpenInvitation = () => {
    setOpened(true)
  }

  const handleAddNote = async (content: string) => {
    const placement = pickPlacement(notes)
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

  const showEmptyHint = !loading && notes.length === 0

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

      <FloatingAddButton onClick={() => setModalOpen(true)} />

      {showEmptyHint && (
        <div
          className="fade-in-up pointer-events-none fixed z-10 flex items-center gap-1 rounded-full bg-neutral-900/85 px-3 py-1.5 text-[11px] font-medium text-white shadow"
          style={{
            bottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
            right: 'calc(1.5rem + env(safe-area-inset-right))',
          }}
        >
          <span>첫 쪽지를 남겨보세요</span>
          <span aria-hidden>↘</span>
        </div>
      )}

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
