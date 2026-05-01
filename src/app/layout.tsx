import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CreateHub - Creator Marketplace Platform',
  description: 'Build, sell, and grow your creator business with our modern marketplace platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <div id="app">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
