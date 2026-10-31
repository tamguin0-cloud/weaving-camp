import { Note } from '../types'
import { STICKY_COLORS, StickyColorKey } from '../lib/colors'
import { STICKY_W, STICKY_H } from '../lib/placement'

type Props = {
  note: Note
  canDelete: boolean
  onDelete?: () => void
}

export default function StickyNote({ note, canDelete, onDelete }: Props) {
  const palette = STICKY_COLORS[note.color as StickyColorKey] ?? STICKY_COLORS.yellow

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
        className="flex h-full w-full flex-col overflow-hidden"
        style={{
          transform: `rotate(${note.rotation}deg)`,
          background: palette.bg,
          boxShadow: `0 3px 6px rgba(0,0,0,0.12), 0 0 0 1px ${palette.edge}`,
          padding: 6,
        }}
      >
        <p className="flex-1 overflow-hidden whitespace-pre-wrap break-words text-[10px] leading-[1.3] text-neutral-800">
          {note.content}
        </p>
        <div className="mt-1 flex items-end justify-between gap-1">
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
