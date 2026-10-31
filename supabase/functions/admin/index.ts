// 관리자 전용 Edge Function.
// POST { password } 만 → 비밀번호 검증 (verify-only)
// POST { password, noteId } → 비밀번호 검증 + 해당 쪽지 삭제 (service role 사용)

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    })
  }

  let body: { password?: string; noteId?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const expected = Deno.env.get('ADMIN_PASSWORD')
  if (!expected) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: corsHeaders,
    })
  }

  if (!body.password || body.password !== expected) {
    return new Response(JSON.stringify({ error: 'Invalid password' }), {
      status: 401,
      headers: corsHeaders,
    })
  }

  // 비번만 → 검증 통과 응답
  if (!body.noteId) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders,
    })
  }

  // 비번 + noteId → 삭제
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const admin: any = createClient(supabaseUrl, serviceRoleKey)

  const { error } = await admin.from('notes').delete().eq('id', body.noteId)
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: corsHeaders,
  })
})
