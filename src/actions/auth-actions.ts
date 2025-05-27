'use server';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { ActionResult } from '@/types/generic-types';


export async function loginAction(prevState: ActionResult<SessionData>, formData: FormData): Promise<ActionResult<SessionData>> {
    const email = formData.get('email');
    const password = formData.get('password');

    const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions
    );

    if (
        email === process.env.LOGIN_EMAIL &&
        password === process.env.LOGIN_PASSWORD
    ) {
        session.isLoggedIn = true;
        await session.save();
        return { success: true, data: { isLoggedIn: session.isLoggedIn } };
    }

    return { success: false, error: 'Invalid credentials' };
}

export async function logoutAction(): Promise<ActionResult<SessionData>> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (session) {
        session.destroy()
        return { success: true, data: session }
    };

    return { success: false, error: "Failed to logout" };
}

export async function checkAuth(): Promise<ActionResult<SessionData>> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (session.isLoggedIn) {
        return { success: true, data: { isLoggedIn: session.isLoggedIn } };
    } else {
        return { success: false, error: "User not logged in" }
    }
}
