import { useEffect, useRef, useState } from 'react'
import { Note } from '../types'
import { STICKY_COLORS, StickyColorKey } from '../lib/colors'
import { STICKY_W, STICKY_H } from '../lib/placement'

type Props = {
  note: Note
  canDelete: boolean
  onDelete?: () => void
}

const FADE_MASK = 'linear-gradient(to bottom, black 85%, transparent)'

export default function StickyNote({ note, canDelete, onDelete }: Props) {
  const palette = STICKY_COLORS[note.color as StickyColorKey] ?? STICKY_COLORS.yellow
  const contentRef = useRef<HTMLParagraphElement>(null)
  const [overflows, setOverflows] = useState(false)
  const [atBottom, setAtBottom] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    setOverflows(el.scrollHeight > el.clientHeight + 1)
    setAtBottom(false)
  }, [note.content])

  const handleScroll = (e: React.UIEvent<HTMLParagraphElement>) => {
    const el = e.currentTarget
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1)
  }

  const showFade = overflows && !atBottom

  return (
    <div
      className="sticky-appear absolute"
      style={{
        left: note.x,
        top: note.y,
        width: STICKY_W,
        height: STICKY_H,
      }}
    >
      <div
        className="relative flex h-full w-full flex-col overflow-hidden"
        style={{
          transform: `rotate(${note.rotation}deg)`,
          background: palette.bg,
          boxShadow: `0 3px 6px rgba(0,0,0,0.12), 0 0 0 1px ${palette.edge}`,
          padding: 6,
        }}
      >
        <p
          ref={contentRef}
          onScroll={handleScroll}
          className="no-scrollbar flex-1 min-h-0 overflow-y-auto whitespace-pre-wrap break-words text-[10px] leading-[1.3] text-neutral-800"
          style={
            showFade
              ? { maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }
              : undefined
          }
        >
          {note.content}
        </p>
        {showFade && (
          <div
            className="pointer-events-none absolute left-0 right-0 flex justify-center"
            style={{ bottom: 18 }}
          >
            <span className="rounded-full bg-neutral-800/70 px-1.5 py-[1px] text-[9px] leading-[1.2] text-white">
              더보기 ↓
            </span>
          </div>
        )}
        <div className="mt-1 flex shrink-0 items-end justify-between gap-1">
          <span className="min-w-0 flex-1 break-keep text-[8px] leading-[1.15] text-neutral-600">
            {note.authorName}
          </span>
          {canDelete && onDelete && (
            <button
              onClick={onDelete}
              className="shrink-0 rounded-full px-0.5 text-[10px] leading-none text-neutral-600 hover:text-neutral-900"
              aria-label="삭제"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
