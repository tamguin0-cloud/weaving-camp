import { CANVAS_W, CANVAS_H } from '../components/BoardCanvas'

export const STICKY_W = 80
export const STICKY_H = 96

export const POSTER_W = 180
export const POSTER_H = 224 // 4:5 비율 (실제 포스터 960x1200)
export const BUTTON_W = 108
export const BUTTON_H = 28
export const BUTTON_GAP = 10

const CX = CANVAS_W / 2
const CY = CANVAS_H / 2
const EXCLUSION_PAD = 8

// 포스터 + 참가신청 버튼이 차지하는 중앙 영역 (쪽지가 겹치면 안 됨)
const EXCLUSION = {
  left: CX - POSTER_W / 2 - EXCLUSION_PAD,
  right: CX + POSTER_W / 2 + EXCLUSION_PAD,
  top: CY - POSTER_H / 2 - EXCLUSION_PAD,
  bottom: CY + POSTER_H / 2 + BUTTON_GAP + BUTTON_H + EXCLUSION_PAD,
}

const MARGIN = 8
const COLLISION_BUFFER = 4

export type Rect = { left: number; top: number; right: number; bottom: number }

function overlaps(a: Rect, b: Rect, buffer = 0): boolean {
  return !(
    a.right + buffer < b.left ||
    a.left - buffer > b.right ||
    a.bottom + buffer < b.top ||
    a.top - buffer > b.bottom
  )
}

export type Placement = { x: number; y: number; rotation: number }

export function pickPlacement(
  existing: readonly { x: number; y: number }[],
  extraExclusions: readonly Rect[] = [],
): Placement {
  const exclusions = [EXCLUSION, ...extraExclusions]
  const minX = MARGIN
  const maxX = CANVAS_W - MARGIN - STICKY_W
  const minY = MARGIN
  const maxY = CANVAS_H - MARGIN - STICKY_H

  const randomRotation = () => Math.random() * 16 - 8

  const tryOnce = (): Placement | null => {
    const x = Math.round(minX + Math.random() * (maxX - minX))
    const y = Math.round(minY + Math.random() * (maxY - minY))
    const rect: Rect = { left: x, top: y, right: x + STICKY_W, bottom: y + STICKY_H }

    if (exclusions.some((e) => overlaps(rect, e))) return null
    for (const n of existing) {
      const other: Rect = {
        left: n.x,
        top: n.y,
        right: n.x + STICKY_W,
        bottom: n.y + STICKY_H,
      }
      if (overlaps(rect, other, COLLISION_BUFFER)) return null
    }
    return { x, y, rotation: randomRotation() }
  }

  for (let i = 0; i < 120; i++) {
    const result = tryOnce()
    if (result) return result
  }

  // 폴백: 금지 영역만 피하고 쪽지끼리는 겹치는 거 허용
  for (let i = 0; i < 60; i++) {
    const x = Math.round(minX + Math.random() * (maxX - minX))
    const y = Math.round(minY + Math.random() * (maxY - minY))
    const rect: Rect = { left: x, top: y, right: x + STICKY_W, bottom: y + STICKY_H }
    if (!exclusions.some((e) => overlaps(rect, e))) {
      return { x, y, rotation: randomRotation() }
    }
  }
  return { x: MARGIN, y: MARGIN, rotation: 0 }
}
