import { useEffect, useRef, useState } from 'react'
import { Note } from '../types'
import { STICKY_COLORS, StickyColorKey } from '../lib/colors'
import { STICKY_W, STICKY_H } from '../lib/placement'

type Props = {
  note: Note
  canDelete: boolean
  onDelete?: () => void
  onExpand?: () => void
}

const FADE_MASK = 'linear-gradient(to bottom, black 85%, transparent)'

export default function StickyNote({ note, canDelete, onDelete, onExpand }: Props) {
  const palette = STICKY_COLORS[note.color as StickyColorKey] ?? STICKY_COLORS.yellow
  const contentRef = useRef<HTMLParagraphElement>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    setOverflows(el.scrollHeight > el.clientHeight + 1)
  }, [note.content])

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
          className="flex-1 min-h-0 overflow-hidden whitespace-pre-wrap break-words text-[10px] leading-[1.3] text-neutral-800"
          style={
            overflows
              ? { maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }
              : undefined
          }
        >
          {note.content}
        </p>
        {overflows && onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-900/45 px-2 py-[1px] text-[9px] leading-[1.2] text-white"
            style={{ bottom: 18 }}
          >
            전체보기
          </button>
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
