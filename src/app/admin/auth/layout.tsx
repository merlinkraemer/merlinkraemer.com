export const metadata = {
    title: 'merlins dashboard',
    description: 'log in',
}

import { ThemeProvider } from 'next-themes'
import './auth.css'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <html lang="en">
                <body>{children}</body>
            </html>
        </ThemeProvider>
    )
}
