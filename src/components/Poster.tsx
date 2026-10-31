import { MouseEvent } from 'react'
import { CANVAS_W, CANVAS_H } from './BoardCanvas'
import {
  POSTER_W,
  POSTER_H,
  BUTTON_W,
  BUTTON_H,
  BUTTON_GAP,
} from '../lib/placement'

export default function Poster() {
  const googleFormUrl = import.meta.env.VITE_GOOGLE_FORM_URL as string | undefined

  const handleSignupClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!googleFormUrl) {
      e.preventDefault()
      alert('구글폼 URL이 아직 설정되지 않았어요.')
    }
  }

  const cx = CANVAS_W / 2
  const cy = CANVAS_H / 2

  return (
    <>
      <img
        src="/poster.jpg"
        alt="엮는 캠프 포스터"
        className="absolute bg-white object-cover shadow-lg"
        style={{
          width: POSTER_W,
          height: POSTER_H,
          left: cx - POSTER_W / 2,
          top: cy - POSTER_H / 2,
        }}
        draggable={false}
      />

      <a
        href={googleFormUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleSignupClick}
        className="absolute flex items-center justify-center rounded-full bg-neutral-900 text-[12px] font-bold tracking-tight text-white shadow-lg transition active:scale-95"
        style={{
          width: BUTTON_W,
          height: BUTTON_H,
          left: cx - BUTTON_W / 2,
          top: cy + POSTER_H / 2 + BUTTON_GAP,
        }}
      >
        참가 신청하기
      </a>
    </>
  )
}
