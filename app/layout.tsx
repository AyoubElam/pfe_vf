import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "./components/Navbar"
import Sidebar from "./components/sidebar"
import { ThemeProvider } from "next-themes"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })

export const metadata = {
  title: "GESTION DE PFE",
  description: "Application de gestion des projets de fin d'études",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen bg-white transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="p-6 flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

