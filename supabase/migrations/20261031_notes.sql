-- 롤링페이퍼 쪽지 테이블 + RLS + Realtime 설정

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) between 1 and 100),
  author_name text not null,
  color text not null,
  x integer not null,
  y integer not null,
  rotation real not null default 0,
  owner_token text not null,
  created_at timestamptz not null default now()
);

-- RLS 활성화 (automatic RLS가 켜져 있어도 명시적으로 걸어둠)
alter table public.notes enable row level security;

-- 누구나 읽기
create policy "notes_read_all"
  on public.notes
  for select
  to anon
  using (true);

-- 누구나 쓰기
create policy "notes_insert_all"
  on public.notes
  for insert
  to anon
  with check (true);

-- x-owner-token 헤더가 맞는 사람만 자기 쪽지 삭제 (Phase 6에서 사용)
create policy "notes_delete_owner"
  on public.notes
  for delete
  to anon
  using (
    owner_token = current_setting('request.headers', true)::json ->> 'x-owner-token'
  );

-- 권한 부여 (Automatically expose new tables가 OFF 라서 수동 GRANT 필요)
-- SELECT 는 owner_token 칼럼을 제외하여 직접 조회로 토큰 유출 방지
grant select (id, content, author_name, color, x, y, rotation, created_at)
  on public.notes to anon;
grant insert, delete on public.notes to anon;

-- Realtime publication 에 테이블 추가 (INSERT/DELETE 이벤트 브로드캐스트)
alter publication supabase_realtime add table public.notes;
