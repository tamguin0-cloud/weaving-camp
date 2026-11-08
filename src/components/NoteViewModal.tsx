import { useEffect } from 'react'
import { Note } from '../types'
import { STICKY_COLORS, StickyColorKey } from '../lib/colors'

type Props = {
  note: Note | null
  onClose: () => void
}

export default function NoteViewModal({ note, onClose }: Props) {
  useEffect(() => {
    if (!note) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [note, onClose])

  if (!note) return null
  const palette = STICKY_COLORS[note.color as StickyColorKey] ?? STICKY_COLORS.yellow

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[16rem] rounded-2xl p-4 shadow-xl"
        style={{
          background: palette.bg,
          boxShadow: `0 10px 30px rgba(0,0,0,0.2), 0 0 0 1px ${palette.edge}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-800">
          {note.content}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs text-neutral-600">
            {note.authorName}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full px-2 py-0.5 text-xs text-neutral-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
