import React from 'react'
import TodoForm from './_components/TodoForm';

type Props = {}

export default async function Index({}: Props) {
  const result = await fetch("http://localhost:3000/api/todo");
  const todoList: {id: string; message: string} [] = await result.json();

  return (
    <div>
      <h1 className='text-2xl font-bold'>Todo Nextjs 14</h1>
      <TodoForm/>
      <ul>
          {todoList.map((todo) => (
            <li key={todo.id}>
              Job {todo.id}: {todo.message}
            </li>
          ))}
        </ul>
    </div>
  )
}