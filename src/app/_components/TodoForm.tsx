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