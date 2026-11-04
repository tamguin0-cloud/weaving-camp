import { useState } from 'react'
import BoardCanvas, { CANVAS_W, CANVAS_H } from './BoardCanvas'
import { POSTER_W, POSTER_H } from '../lib/placement'

interface Props {
  onOpen: () => void
}

const ENVELOPE_W = 260
const BODY_H = 150
const V_DEPTH = 65
const FLAP_H = 140
const BOTTOM_FLAT_W = 60
const POSTER_HIDDEN = 112

const ENVELOPE_FRONT = '#F5EEDD'
const ENVELOPE_BACK = '#ECE0C5'
const ENVELOPE_LINE = '#D4C4A3'

export default function EnvelopeIntro({ onOpen }: Props) {
  const [closing, setClosing] = useState(false)

  const handleClick = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(onOpen, 320)
  }

  const cx = CANVAS_W / 2
  const cy = CANVAS_H / 2

  const envelopeTotalH = FLAP_H + BODY_H
  const flapTop = cy - envelopeTotalH / 2
  const bodyTop = flapTop + FLAP_H
  const envelopeLeft = cx - ENVELOPE_W / 2

  const posterLeft = cx - POSTER_W / 2
  const posterTop = bodyTop - (POSTER_H - POSTER_HIDDEN)

  const groupLeft = Math.min(envelopeLeft, posterLeft) - 8
  const groupTop = Math.min(flapTop, posterTop) - 4
  const groupRight =
    Math.max(envelopeLeft + ENVELOPE_W, posterLeft + POSTER_W) + 8
  const groupBottom = bodyTop + BODY_H + 4
  const groupWidth = groupRight - groupLeft
  const groupHeight = groupBottom - groupTop

  const flapLocalLeft = envelopeLeft - groupLeft
  const flapLocalTop = flapTop - groupTop
  const bodyLocalTop = bodyTop - groupTop
  const posterLocalLeft = posterLeft - groupLeft
  const posterLocalTop = posterTop - groupTop

  const hintTop = groupTop + groupHeight + 28

  return (
    <div
      className="fixed inset-0 z-40 transition-opacity duration-300"
      style={{ opacity: closing ? 0 : 1 }}
    >
      <BoardCanvas>
        <button
          type="button"
          onClick={handleClick}
          aria-label="초대장 열기"
          className="envelope-bounce absolute cursor-pointer border-none bg-transparent p-0 outline-none"
          style={{
            left: groupLeft,
            top: groupTop,
            width: groupWidth,
            height: groupHeight,
          }}
        >
          <svg
            className="absolute pointer-events-none"
            style={{
              width: ENVELOPE_W,
              height: FLAP_H,
              left: flapLocalLeft,
              top: flapLocalTop,
              filter: 'drop-shadow(0 4px 10px rgba(60, 40, 20, 0.1))',
            }}
            viewBox={`0 0 ${ENVELOPE_W} ${FLAP_H}`}
            fill="none"
          >
            <polygon
              points={`0,${FLAP_H} ${ENVELOPE_W / 2},0 ${ENVELOPE_W},${FLAP_H}`}
              fill={ENVELOPE_BACK}
              stroke={ENVELOPE_LINE}
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>

          <picture>
            <source srcSet="/poster.webp" type="image/webp" />
            <img
              src="/poster.jpg"
              alt="엮는 캠프 포스터"
              width={POSTER_W}
              height={POSTER_H}
              fetchPriority="high"
              decoding="async"
              className="absolute bg-white object-cover shadow-md pointer-events-none"
              style={{
                width: POSTER_W,
                height: POSTER_H,
                left: posterLocalLeft,
                top: posterLocalTop,
              }}
              draggable={false}
            />
          </picture>

          <svg
            className="absolute pointer-events-none"
            style={{
              width: ENVELOPE_W,
              height: BODY_H,
              left: flapLocalLeft,
              top: bodyLocalTop,
              filter: 'drop-shadow(0 10px 18px rgba(60, 40, 20, 0.16))',
            }}
            viewBox={`0 0 ${ENVELOPE_W} ${BODY_H}`}
            fill="none"
          >
            <polygon
              points={`0,0 ${ENVELOPE_W / 2 - BOTTOM_FLAT_W / 2},${V_DEPTH} ${ENVELOPE_W / 2 + BOTTOM_FLAT_W / 2},${V_DEPTH} ${ENVELOPE_W},0 ${ENVELOPE_W},${BODY_H} 0,${BODY_H}`}
              fill={ENVELOPE_FRONT}
              stroke={ENVELOPE_LINE}
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <polyline
              points={`0,${BODY_H} ${ENVELOPE_W / 2 - BOTTOM_FLAT_W / 2},${V_DEPTH} ${ENVELOPE_W / 2 + BOTTOM_FLAT_W / 2},${V_DEPTH} ${ENVELOPE_W},${BODY_H}`}
              fill="none"
              stroke={ENVELOPE_LINE}
              strokeWidth="0.75"
              opacity="0.55"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className="absolute pointer-events-none text-center font-medium text-neutral-500"
          style={{ top: hintTop, left: 0, width: CANVAS_W }}
        >
          <div className="text-[28px] leading-none" aria-hidden>
            👆
          </div>
          <div className="mt-2 text-[18px]">눌러보세요!</div>
        </div>
      </BoardCanvas>
    </div>
  )
}
