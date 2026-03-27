'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

type Note = {
  id: number
  title: string
  content: string
  created_at: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  //carregar notas
  async function loadNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
      return
    }

    setNotes(data ?? [])
  }

  //criar ou atualizar nota
  async function saveNote() {
    if (!title.trim() || !content.trim()) {
      alert('Preencha todos os campos')
      return
    }

    if (editingId) {
      //editar
      await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', editingId)

      setEditingId(null)
    } else {
      //criar
      await supabase
        .from('notes')
        .insert([{ title, content }])
    }

    setTitle('')
    setContent('')
    loadNotes()
  }

  //deletar
  async function deleteNote(id: number) {
    const confirmDelete = confirm('Tem certeza que deseja excluir?')

    if (!confirmDelete) return

    await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    loadNotes()
  }

  //iniciar edição
  function startEdit(note: Note) {
    setTitle(note.title)
    setContent(note.content)
    setEditingId(note.id)
  }

  useEffect(() => {
    loadNotes()
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <Link href="/">← Voltar para tarefas</Link>

      <h1>Notas de aula</h1>
      <p>- Adicionar Nota:</p>

      <div>
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />

        <textarea
          placeholder="Conteúdo"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <br />

        <button onClick={saveNote}>
          {editingId ? '[Atualizar]' : '[Salvar]'}
        </button>
      </div>
      <p>- Lista de Notas:</p>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>

            <button onClick={() => startEdit(note)}>
              [Editar]
            </button>

            <button onClick={() => deleteNote(note.id)}>
              [Excluir]
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}