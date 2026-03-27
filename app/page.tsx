'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

//tipo da tarefa
type Task = {
  id: number
  title: string
  created_at: string
  done: boolean
}

export default function Home() {
  const [task, setTask] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])

  //criar nova task
  async function addTask() {
    if (!task.trim()) {
      alert('Digite uma tarefa')
      return
    }

    const { error } = await supabase
      .from('tasks')
      .insert([{ title: task }]) 

      if (error) {
        console.log('ERRO INSERT:', error)
        alert(error.message)
        return
      }

    setTask('')
    loadTasks()
  }

  //carregar tasks
  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')

    if (error) {
      console.log(error)
      return
    }

    setTasks(data ?? [])
  }

  //deletar
  async function deleteTask(id: number) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.log(error)
      return
    }

    loadTasks()
  }

  //marcar como concluída
  async function toggleTask(id: number, done: boolean) {
    const { error } = await supabase
      .from('tasks')
      .update({ done: !done })
      .eq('id', id)

    if (error) {
      console.log(error)
      return
    }

    loadTasks()
  }

  //carregar ao abrir
  useEffect(() => {
    loadTasks()
  }, [])

  return (
    <div style={{ padding: 40 }}>

      <Link href="/notes">Ir para Notas</Link>


      <h1>Lista de tarefas</h1>

      <p>- Adicionar Tarefa:</p>
      <div>
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Digite uma tarefa"
        />
        <button onClick={addTask}>Adicionar</button>
      </div>

      <p>- Lista de Tarefas:</p>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggleTask(t.id, t.done)}
            />

            <span
              style={{
                textDecoration: t.done ? 'line-through' : 'none'
              }}
            >
              {t.title}
            </span>

            <button onClick={() => deleteTask(t.id)}>
              [Excluir]
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
