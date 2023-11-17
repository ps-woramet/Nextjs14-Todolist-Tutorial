0. create project (node.js version 18.17+)

    npx create-next-app@latest nextjs14-todolist-tutorial
    √ Would you like to use TypeScript? Yes
    √ Would you like to use ESLint? Yes
    √ Would you like to use Tailwind CSS? Yes
    √ Would you like to use `src/` directory? Yes
    √ Would you like to use App Router? (recommended) Yes
    √ Would you like to customize the default import alias (@/*)? No
    
    cd nextjs14-todolist-tutorial

1. check version node.js

    node --version

2. run server
    npm run dev

3. src -> app -> layout.tsx

    <html lang="en">
      <body className={inter.className}>
        <main className='flex min-h-screen flex-col items-center w-full p-24 bg-gray-300'>
          {children}
        </main>
      </body>
    </html>

4. src -> app -> page.tsx

    import React from 'react'

    type Props = {}

    export default function Index({}: Props) {
        return (
            <div>
            <h1 className='text-2xl font-bold'>Todo Nextjs 14</h1>
            <form className='flex flex-col w-[300px] my-16'>
                <input type="text" name='message' className='px-4 py-2 mb-3' placeholder='Write your job...' />
                
                <button className='bg-blue-500 rounded px-4 py-2 text-white font-semibold'>
                Submit
                </button>
            </form>
            </div>
        )
    }
    
5. create folder 
    
    src > app > api > todo > route.tsx

    import { NextRequest, NextResponse } from "next/server";

    type Job = {
        id?: string;
        message: string;
    }

    let todoList: Job[] = [];
    let count = 0;

    //Query
    export async function GET(request: NextRequest): Promise<any> {
        const url = new URL(request.url);

        const action = url.searchParams.get("action");
        if(action == "reset"){
            todoList = [];
        }

        return NextResponse.json(todoList); 
    }


    // Insert
    export async function POST(request: NextRequest):Promise<any>{
        const {message}: Job = await request.json();
        count++
        todoList = [...todoList, {id: count.toString(), message}]
        return NextResponse.json({result: "Ok"})

    }

6. install extension > rest client

    create file mock.http

        ### query
        GET http://localhost:3000/api/todo HTTP/1.1

        ### insert
        POST http://localhost:3000/api/todo HTTP/1.1
        Content-Type: application/json

        {"message": "do something"}

7. Server Action 
    // revalidatePath("/") จะทำให้หน้าหลัก (หรือ path ที่กำหนด) ถูก Re-generated ใหม่
    // คำสั่ง revalidatePath("/") นั้นมักจะใช้ในการทำ Static Site Generation (SSG) เพื่อให้ข้อมูลบนหน้าเว็บที่ถูกสร้างไว้ล่วงหน้ามีความสมพันธ์ทันทีเมื่อข้อมูลมีการเปลี่ยนแปลง

    -src -> app -> page.tsx

        import { revalidatePath } from 'next/cache';
        import React from 'react'

        type Props = {}

        export default async function Index({}: Props) {
            const result = await fetch("http://localhost:3000/api/todo");
            const todoList: {id: string; message: string} [] = await result.json();
            console.log(result);
            
            return (
                <div>
                <h1 className='text-2xl font-bold'>Todo Nextjs 14</h1>
                <form action={ async(formData: FormData) =>{
                    "use server"
                    console.log("running at server");
                    const message = formData.get("message");
                    await fetch("http://localhost:3000/api/todo",{
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({message}),
                    });

                    revalidatePath("/")
                }}
                    className='flex flex-col w-[300px] my-16'>
                    <input type="text" name='message' className='px-4 py-2 mb-3' placeholder='Write your job...' />
                    
                    <button className='bg-blue-500 rounded px-4 py-2 text-white font-semibold'>
                    Submit
                    </button>

                </form>
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

8. utils function (create folder)

    -src -> app -> _actions -> todo-actions.ts

        "use server"
        import { revalidatePath } from 'next/cache';

        export const submitTodo = async(formData: FormData) =>{
            console.log("running at server");
            const message = formData.get("message");
            await fetch("http://localhost:3000/api/todo",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({message}),
            });

            revalidatePath("/")
        }

    -src -> app -> page.tsx

        import React from 'react'
        import { submitTodo } from './_actions/todo-actions';
        type Props = {}

        export default async function Index({}: Props) {
        const result = await fetch("http://localhost:3000/api/todo");
        const todoList: {id: string; message: string} [] = await result.json();
        
        return (
            <div>
            <h1 className='text-2xl font-bold'>Todo Nextjs 14</h1>
            <form action={submitTodo }
                className='flex flex-col w-[300px] my-16'>
                <input type="text" name='message' className='px-4 py-2 mb-3' placeholder='Write your job...' />
                
                <button className='bg-blue-500 rounded px-4 py-2 text-white font-semibold'>
                Submit
                </button>
            </form>
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

9. หากต้องการใช้ hook จะต้องใช้ "use client" แต่ที่ file page.tsx เราต้องการ fetch ข้อมูล todolist ที่ฝั่ง server ด้วย
    แก้โดย client component

    -src -> app -> _components -> TodoForm.tsx

        "use client"
        import React, { useRef } from 'react'
        import { submitTodo } from '../_actions/todo-actions'

        type Props = {}

        export default function TodoForm({}: Props) {
            const ref = useRef<HTMLFormElement>(null);

            return (
                <form ref={ref} action={async (formData: FormData)=>{
                    ref.current?.reset();
                    submitTodo(formData);
                }}
                    className='flex flex-col w-[300px] my-16'>
                    <input type="text" name='message' className='px-4 py-2 mb-3' placeholder='Write your job...' />
                    
                    <button className='bg-blue-500 rounded px-4 py-2 text-white font-semibold'>
                    Submit
                    </button>
                </form>
            )
        }

    -src -> app -> page.tsx

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

10. ทำการแยกปุ่ม submit และ reset จาก form

    -src -> app -> api -> todo -> route.ts

        "use client"
        import React, { useRef } from 'react'
        import { submitTodo } from '../_actions/todo-actions'
        import SubmitButton from './SubmitButton';
        import ResetButton from './ResetButton';

        type Props = {}

        export default function TodoForm({}: Props) {
            const ref = useRef<HTMLFormElement>(null);

            return (
                <form ref={ref} action={async (formData: FormData)=>{
                    
                    ref.current?.reset();
                    submitTodo(formData);

                }}
                    className='flex flex-col w-[300px] my-16'>
                    <input type="text" name='message' className='px-4 py-2 mb-3' placeholder='Write your job...' />
                    <SubmitButton/>
                    <ResetButton/>
                </form>
            )
        }

    -src -> app -> _components -> SubmitButton

        import React from 'react'

        type Props = {}

        function SubmitButton({}: Props) {
        return (
            <button className='bg-blue-500 rounded px-4 py-2 text-white font-semibold'>
                Submit
            </button>
        )
        }

        export default SubmitButton
    
    -src -> app -> _components -> ResetButton

        "use client"
        import React, { useTransition } from 'react'
        import { resetTodo } from '../_actions/todo-actions';

        type Props = {}

        export default function ResetButton({}: Props) {
            const [_, startTransition] = useTransition() ;
                return (
                <button type='button' className='text-black font-semibold border border-gray-500 rounded'
                onClick={()=>{
                    startTransition(()=>resetTodo())
                }}>
                    Reset
                </button>
            )
        }

    -src -> app -> TodoForm.tsx

        "use client"
        import React, { useRef } from 'react'
        import { submitTodo } from '../_actions/todo-actions'
        import SubmitButton from './SubmitButton';
        import ResetButton from './ResetButton';

        type Props = {}

        export default function TodoForm({}: Props) {
            const ref = useRef<HTMLFormElement>(null);

            return (
                <form ref={ref} action={async (formData: FormData)=>{
                    
                    ref.current?.reset();
                    submitTodo(formData);

                }}
                    className='flex flex-col w-[300px] my-16'>
                    <input type="text" name='message' className='px-4 py-2 mb-3' placeholder='Write your job...' />
                    <SubmitButton/>
                    <ResetButton/>
                </form>
            )
        }

11. แสดง error ด้วย useFormState 
    // const [state, formAction] = useFormState(submitTodo, {error: null})

    -src -> app -> _components -> TodoForm.tsx

        "use client"
        import React, { useRef } from 'react'
        import { submitTodo } from '../_actions/todo-actions'
        import SubmitButton from './SubmitButton';
        import ResetButton from './ResetButton';
        import { useFormState } from 'react-dom';

        type Props = {}

        export default function TodoForm({}: Props) {
            const ref = useRef<HTMLFormElement>(null);
            const [state, formAction] = useFormState(submitTodo, {error: null})

            return (
                <form ref={ref} action={async (formData: FormData)=>{
                    
                    ref.current?.reset();
                    formAction(formData);

                }}
                    className='flex flex-col w-[300px] my-16'>
                    <input type="text" name='message' className='px-4 py-2 mb-3' placeholder='Write your job...' />
                    {state.error && (<span className='text-red-500'>Must be greater than 5 characters</span>)}
                    <SubmitButton/>
                    <ResetButton/>
                </form>
            )
        }
    
    -src -> app -> _actions -> todo-actions.ts

        "use server"
        import { revalidatePath } from 'next/cache';

        export const submitTodo = async(prevState: any, formData: FormData) =>{
            console.log("running at server");
            const message = formData.get("message");
            
            if (!message || message.toString().length < 5){
            console.log("error"+message);
            return {error: "too short"}
            }
            
            await fetch("http://localhost:3000/api/todo",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({message}),
            });

            revalidatePath("/")
            return {error:null}
        }

        // Reset
        export const resetTodo = async () => {
        await fetch("http://localhost:3000/api/todo?action=reset")
        revalidatePath("/")
        }