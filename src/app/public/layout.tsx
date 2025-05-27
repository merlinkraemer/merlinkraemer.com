import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./public.css"
import { AudioProvider } from "./components/AudioProvider";
import PlayerUI from "./components/PlayerUi";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "merlins internet",
    description: "get ur shit",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#000000" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <link rel="apple-touch-icon" href="/bananas.png" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AudioProvider>
                    <div className="h-[100svh] flex-col flex">
                        <div className="flex-1 overflow-scroll">{children}</div>
                        <div className="h-32">
                            <PlayerUI />
                        </div>
                    </div>
                </AudioProvider>
            </body>
        </html>
    );
}
