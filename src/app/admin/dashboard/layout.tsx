import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from 'next-themes'
import AuthProvider from "./components/AuthProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/Sidebar";
import "./dashboard.css"


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "merlins dashboard",
    description: "get ur shit",
};

export default function DashboardLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <SidebarProvider>
                            <AppSidebar />
                            <main className="h-full w-full p-5">
                                {children}
                            </main>
                        </SidebarProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
