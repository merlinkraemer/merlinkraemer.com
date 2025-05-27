'use client';

import { loginAction } from '@/actions/auth-actions';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const initialState = { success: false, data: undefined as never, error: '' };

export default function LoginPage() {
    const [state, formAction] = useActionState(loginAction, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push('/admin/dashboard/art');
        }
    }, [state.success, router]);

    return (
        <div className='h-[100vh] flex justify-center items-center'>
            <div className="w-1/4 mt-10">
                <h1 className=" text-2xl font-bold mb-4">login to dashboard</h1>
                <form action={formAction} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="email"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="pw"
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    {!state.success && state.error && <div className="text-red-500">{state.error}</div>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded"
                    >
                        log In
                    </button>
                </form>
            </div>
        </div>
    );
}
