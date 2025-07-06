import { Header } from '@/components/common/header'
import { RoutePrefetch } from '@/components/common/route-prefetch'
import { PrivyClientProvider } from '@/components/provider/PrivyClientProvider'
import { ThemeProvider } from '@/components/theme-provider'
import { PrivyDebug } from '@/components/debug/privy-debug'
import { ResourcePreloader } from '@/components/optimization/resource-preloader'
import { ServiceWorkerRegistration } from '@/components/optimization/service-worker-registration'
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '700'],
  fallback: ['monospace']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://cc.bonk.computer'),
  title: "BonkComputer: Community Center",
  description: "The First Meme Powered Community dApp with shared Virtual Machines and Social features by Tapestry. Built on Solana, Bonk Computer Utilizes $BCT, and in some cases $SOL and $BONK, to measure,quantify, and provide secure compute that transcends boundaries and creates new unthought of before possibilities for creating, collaborating, and sharing experiences. Bonk Computer, and $BCT, blew up as the hottest meme coin on Solana since the launch on the letsBONK.fun launchpad.  BCT attracted developers and tech enthusiasts who organized and formed the most active community in meme coins. With so many things coming up for BCT and Bonk Computer, value of the project will catch up to this pure explosion of adoption of the private secure VM and ai technologies provided and currently being utilized by so many people! Join our awesome organic and rapidly growing community now, and be a part of the future of the internet!",
  openGraph: {
    title: "BonkComputer: Community Center",
    description: "The First Meme Powered Community dApp with shared Virtual Machines and Social features by Tapestry. Built on Solana, Bonk Computer Utilizes $BCT, and in some cases $SOL and $BONK, to measure,quantify, and provide secure compute that transcends boundaries and creates new unthought of before possibilities for creating, collaborating, and sharing experiences. Bonk Computer, and $BCT, blew up as the hottest meme coin on Solana since the launch on the letsBONK.fun launchpad.  BCT attracted developers and tech enthusiasts who organized and formed the most active community in meme coins. With so many things coming up for BCT and Bonk Computer, value of the project will catch up to this pure explosion of adoption of the private secure VM and ai technologies provided and currently being utilized by so many people! Join our awesome organic and rapidly growing community now, and be a part of the future of the internet!",
    siteName: "BonkComputer: Community Center",
    url: "https://cc.bonk.computer",
    images: [
      {
        url: "/images/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Bonk Computer Community Center - The First Community Virtual Machine built with $BCT on Solana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BonkComputer: Community Center",
    description: "The First Meme Powered Community dApp with shared Virtual Machines and Social features by Tapestry. Built on Solana, Bonk Computer Utilizes $BCT, and in some cases $SOL and $BONK, to measure,quantify, and provide secure compute that transcends boundaries and creates new unthought of before possibilities for creating, collaborating, and sharing experiences. Bonk Computer, and $BCT, blew up as the hottest meme coin on Solana since the launch on the letsBONK.fun launchpad.  BCT attracted developers and tech enthusiasts who organized and formed the most active community in meme coins. With so many things coming up for BCT and Bonk Computer, value of the project will catch up to this pure explosion of adoption of the private secure VM and ai technologies provided and currently being utilized by so many people! Join our awesome organic and rapidly growing community now, and be a part of the future of the internet!",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical preconnects only */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://quote-api.jup.ag" />
        <link rel="preconnect" href="https://api.mainnet-beta.solana.com" />
        
        {/* DNS prefetch for less critical resources */}
        <link rel="dns-prefetch" href="https://birdeye.so" />
        <link rel="dns-prefetch" href="https://ipfs.io" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
        
        {/* Preload only the most critical image */}
        <link
          rel="preload"
          href="/bctlogo.png"
          as="image"
          type="image/png"
        />
        
        {/* Resource hints for better performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${jetbrainsMono.className} min-h-screen bg-black text-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyClientProvider>
            <Header />
            <RoutePrefetch />
            <Toaster />
            <PrivyDebug />
            {/* Simplified optimization components */}
            <ResourcePreloader />
            <ServiceWorkerRegistration />
            <div className="max-w-6xl mx-auto pt-12 pb-22">{children}</div>
          </PrivyClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
