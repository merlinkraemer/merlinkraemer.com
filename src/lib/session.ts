import { SessionOptions } from 'iron-session'
export interface SessionData {
    isLoggedIn: boolean
}

export const defaultSession: SessionData = {
    isLoggedIn: false
}


export const sessionOptions: SessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD,
    cookieName: "mgoes-session-cookie",
    cookieOptions: {
        //secure: true ??? only production
    }
}
