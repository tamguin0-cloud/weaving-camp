import { PropsWithChildren, useEffect, useState } from 'react'

// 논리 캔버스. 모든 포스터·쪽지 좌표는 이 공간 기준.
// 뷰포트에 맞춰 축소/확대만 되므로 모든 기기에서 레이아웃이 동일.
export const CANVAS_W = 400
export const CANVAS_H = 700

export default function BoardCanvas({ children }: PropsWithChildren) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      setScale(Math.min(vw / CANVAS_W, vh / CANVAS_H))
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-paper">
      <div
        className="relative select-none"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
