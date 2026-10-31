import { createClient } from '@supabase/supabase-js'

// Vercel 환경변수에 복붙 시 숨은 개행/공백이 섞여 들어가면
// 그 값이 Supabase-js 가 설정하는 apikey/Authorization 헤더에 들어가서
// 브라우저가 "Failed to execute 'set' on 'Headers'" 로 거부함.
// 안전하게 trim 처리.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

if (!url || !key) {
  throw new Error(
    'Supabase 환경변수가 설정되지 않았어요. .env.local 의 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 확인하세요.',
  )
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
})

// For delete requests that need to send the owner token header.
// Creating a short-lived client is simpler than mutating headers on the shared one.
export function supabaseWithOwnerToken(token: string) {
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { 'x-owner-token': token.trim() } },
  })
}
