import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { setAdminSession } from '../lib/adminSession'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!password || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const { error } = await supabase.functions.invoke('admin', {
        body: { password },
      })
      if (error) {
        setError('비밀번호가 틀렸거나 서버에 연결할 수 없어요.')
        return
      }
      setAdminSession(password)
      window.location.hash = ''
    } catch (err) {
      console.error(err)
      setError('서버 연결에 문제가 있어요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-lg font-semibold text-neutral-900">관리자 로그인</h1>
        <p className="mt-2 text-sm text-neutral-500">
          로그인하면 모든 쪽지에 삭제 버튼이 보여요.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="비밀번호"
          className="mt-5 w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-900 outline-none focus:border-neutral-400"
          autoFocus
        />

        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!password || submitting}
          className="mt-4 w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-40"
        >
          {submitting ? '확인 중…' : '로그인'}
        </button>

        <a
          href="#"
          className="mt-4 inline-block text-xs text-neutral-500 underline"
        >
          메인으로 돌아가기
        </a>
      </div>
    </div>
  )
}
