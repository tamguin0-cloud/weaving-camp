type Props = { onClick: () => void }

export default function FloatingAddButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl font-light text-neutral-900 shadow-lg transition active:scale-95"
      style={{
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        right: 'calc(1.5rem + env(safe-area-inset-right))',
      }}
      aria-label="쪽지 쓰기"
    >
      +
    </button>
  )
}
