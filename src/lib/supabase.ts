import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

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
  return createClient(url!, key!, {
    auth: { persistSession: false },
    global: { headers: { 'x-owner-token': token } },
  })
}
