import { useEffect, useRef, useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (content: string) => void | Promise<void>
}

const MAX_LEN = 100

export default function NewNoteModal({ open, onClose, onSubmit }: Props) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) {
      setContent('')
      setSubmitting(false)
      return
    }
    const t = setTimeout(() => textareaRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open])

  if (!open) return null

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(trimmed)
      onClose()
    } catch (err) {
      console.error(err)
      alert('쪽지를 붙이지 못했어요. 잠시 뒤 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-neutral-900">쪽지 남기기</h2>
        <p className="mt-1 text-xs text-neutral-500">
          모두에게 보여요. 익명 이름이 랜덤으로 붙어요.
        </p>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LEN))}
          placeholder="예: 캠프에서 뭐 가져갈까?"
          className="mt-4 h-28 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-900 outline-none focus:border-neutral-400"
        />

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            {content.length}/{MAX_LEN}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm text-neutral-500"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-40"
            >
              {submitting ? '붙이는 중…' : '붙이기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
