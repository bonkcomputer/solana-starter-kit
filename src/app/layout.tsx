import { Header } from '@/components/common/header'
import { PrivyClientProvider } from '@/components/provider/PrivyClientProvider'
import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trading Computer - A Modern Solana Trading Platform by Bonk Computer',
  description:
    'Trade Solana tokens with the most modern and efficient swap computer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.className} min-h-screen bg-black text-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyClientProvider>
            <Header />
            <Toaster />
            <div className="max-w-6xl mx-auto pt-12 pb-22">{children}</div>
          </PrivyClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
