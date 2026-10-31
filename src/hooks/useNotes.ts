import { useEffect, useState } from 'react'
import { supabase, supabaseWithOwnerToken } from '../lib/supabase'
import { forgetOwnership } from '../lib/ownerToken'
import { Note } from '../types'

type NoteRow = {
  id: string
  content: string
  author_name: string
  color: string
  x: number
  y: number
  rotation: number
  created_at: string
}

const SAFE_COLUMNS = 'id, content, author_name, color, x, y, rotation, created_at'

function rowToNote(r: NoteRow): Note {
  return {
    id: r.id,
    content: r.content,
    authorName: r.author_name,
    color: r.color,
    x: r.x,
    y: r.y,
    rotation: r.rotation,
    ownerToken: '',
    createdAt: r.created_at,
  }
}

export type AddNoteInput = Omit<Note, 'id' | 'createdAt'>

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select(SAFE_COLUMNS)
        .order('created_at', { ascending: true })
      if (!active) return
      if (error) {
        console.error('[useNotes] load failed', error)
        setError(error.message)
        setLoading(false)
        return
      }
      setNotes(((data ?? []) as NoteRow[]).map(rowToNote))
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('notes-stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notes' },
        (payload) => {
          const row = payload.new as NoteRow
          setNotes((prev) =>
            prev.some((n) => n.id === row.id) ? prev : [...prev, rowToNote(row)],
          )
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notes' },
        (payload) => {
          const oldRow = payload.old as { id?: string }
          if (!oldRow?.id) return
          forgetOwnership(oldRow.id)
          setNotes((prev) => prev.filter((n) => n.id !== oldRow.id))
        },
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  const addNote = async (input: AddNoteInput): Promise<Note> => {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        content: input.content,
        author_name: input.authorName,
        color: input.color,
        x: input.x,
        y: input.y,
        rotation: input.rotation,
        owner_token: input.ownerToken,
      })
      .select(SAFE_COLUMNS)
      .single()
    if (error) throw error
    const inserted = { ...rowToNote(data as NoteRow), ownerToken: input.ownerToken }
    setNotes((prev) =>
      prev.some((n) => n.id === inserted.id) ? prev : [...prev, inserted],
    )
    return inserted
  }

  const deleteNoteAsOwner = async (noteId: string, token: string): Promise<void> => {
    const client = supabaseWithOwnerToken(token)
    const { error, count } = await client
      .from('notes')
      .delete({ count: 'exact' })
      .eq('id', noteId)
    if (error) throw error
    if (count === 0) {
      throw new Error('삭제 권한이 없거나 이미 지워진 쪽지입니다.')
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  const deleteNoteAsAdmin = async (noteId: string, password: string): Promise<void> => {
    const { error } = await supabase.functions.invoke('admin', {
      body: { password, noteId },
    })
    if (error) throw error
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  return { notes, loading, error, addNote, deleteNoteAsOwner, deleteNoteAsAdmin }
}
