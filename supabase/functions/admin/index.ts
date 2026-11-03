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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
}

function peekJwtRole(jwt: string | undefined): string | null {
  if (!jwt) return null
  const parts = jwt.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.role ?? null
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405)
    }

    let body: { password?: string; noteId?: string }
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }

    const expected = Deno.env.get('ADMIN_PASSWORD')
    if (!expected) {
      console.error('[admin] ADMIN_PASSWORD not set')
      return json({ error: 'Server misconfigured: ADMIN_PASSWORD' }, 500)
    }

    if (!body.password || body.password !== expected) {
      return json({ error: 'Invalid password' }, 401)
    }

    // 비번만 → 검증 통과 응답
    if (!body.noteId) {
      return json({ ok: true })
    }

    // 비번 + noteId → 삭제 (service role)
    const supabaseUrl =
      Deno.env.get('SUPABASE_URL') ?? Deno.env.get('SB_URL')

    // 우선순위: 수동 설정 ADMIN_SERVICE_ROLE_KEY → 자동 주입 레거시 → 자동 주입 신규
    const adminKey = Deno.env.get('ADMIN_SERVICE_ROLE_KEY')
    const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const newKey = Deno.env.get('SB_SECRET_KEY')
    const serviceRoleKey = adminKey ?? legacyKey ?? newKey

    const envDebug = {
      urlPresent: !!supabaseUrl,
      urlHost: supabaseUrl ? new URL(supabaseUrl).host : null,
      source: adminKey
        ? 'ADMIN_SERVICE_ROLE_KEY'
        : legacyKey
        ? 'SUPABASE_SERVICE_ROLE_KEY'
        : newKey
        ? 'SB_SECRET_KEY'
        : 'none',
      roleOfAdminKey: peekJwtRole(adminKey),
      roleOfLegacyKey: peekJwtRole(legacyKey),
      roleOfNewKey: peekJwtRole(newKey),
    }
    console.log('[admin] env sources', envDebug)

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[admin] missing env', envDebug)
      return json({ error: 'Server env missing', ...envDebug }, 500)
    }

    const admin: any = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    })

    const { error, data, count } = await admin
      .from('notes')
      .delete({ count: 'exact' })
      .eq('id', body.noteId)
      .select()

    console.log('[admin] delete result', {
      noteId: body.noteId,
      count,
      rowsReturned: data?.length ?? 0,
      hasError: !!error,
    })

    if (error) {
      console.error('[admin] delete failed', { error, envDebug })
      return json(
        {
          error: error.message,
          code: (error as any).code,
          ...envDebug,
        },
        500,
      )
    }

    if (!count || count === 0) {
      console.error('[admin] no rows deleted', { noteId: body.noteId, envDebug })
      return json(
        {
          error: 'No rows deleted — note not found or RLS blocking service_role',
          noteId: body.noteId,
          count,
          ...envDebug,
        },
        404,
      )
    }

    return json({ ok: true, deleted: count })
  } catch (err) {
    console.error('[admin] unexpected', err)
    return json(
      { error: 'Unexpected server error', detail: String(err) },
      500,
    )
  }
})
