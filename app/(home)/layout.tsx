"use client"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './../globals.css'
import { Menu } from '@components'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <div className='container flex flex-row'>
            <Menu />
            <div className='mx-2' style={{ width: "85%" }}>
              {children}
            </div>
          </div>
        </SessionProvider>

      </body>
    </html>
  )
}
