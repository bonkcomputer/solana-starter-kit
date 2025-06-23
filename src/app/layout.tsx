import { Header } from '@/components/common/header'
import { RoutePrefetch } from '@/components/common/route-prefetch'
import { PrivyClientProvider } from '@/components/provider/PrivyClientProvider'
import { ThemeProvider } from '@/components/theme-provider'
import { PrivyDebug } from '@/components/debug/privy-debug'
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-jetbrains-mono'
})

export const metadata: Metadata = {
  title: "BonkComputer: Community Center",
  description: "The First Meme Powered Community dApp with shared Virtual Machines and Social features by Tapestry. Built on Solana, Bonk Computer Utilizes $BCT, and in some cases $SOL and $BONK, to measure,quantify, and provide secure compute that transcends boundaries and creates new unthought of before possibilities for creating, collaborating, and sharing experiences. Bonk Computer, and $BCT, blew up as the hottest meme coin on Solana since the launch on the letsBONK.fun launchpad.  BCT attracted developers and tech enthusiasts who organized and formed the most active community in meme coins. With so many things coming up for BCT and Bonk Computer, value of the project will catch up to this pure explosion of adoption of the private secure VM and ai technologies provided and currently being utilized by so many people! Join our awesome organic and rapidly growing community now, and be a part of the future of the internet!",
  openGraph: {
    title: "BonkComputer: Community Center",
    description: "The First Meme Powered Community dApp with shared Virtual Machines and Social features by Tapestry. Built on Solana, Bonk Computer Utilizes $BCT, and in some cases $SOL and $BONK, to measure,quantify, and provide secure compute that transcends boundaries and creates new unthought of before possibilities for creating, collaborating, and sharing experiences. Bonk Computer, and $BCT, blew up as the hottest meme coin on Solana since the launch on the letsBONK.fun launchpad.  BCT attracted developers and tech enthusiasts who organized and formed the most active community in meme coins. With so many things coming up for BCT and Bonk Computer, value of the project will catch up to this pure explosion of adoption of the private secure VM and ai technologies provided and currently being utilized by so many people! Join our awesome organic and rapidly growing community now, and be a part of the future of the internet!",
    siteName: "BonkComputer: Community Center",
    url: "https://cc.bonk.computer",
    images: [
      {
        url: "https://bpc3-dn19k1msc-operatefun.vercel.app/twitter-image.png?3085bfee7f38e886",
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
    images: ["https://bpc3-dn19k1msc-operatefun.vercel.app/twitter-image.png?3085bfee7f38e886"],
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
        {/* Font preloading */}
        <link
          rel="preload"
          href="/_next/static/css/app/layout.css"
          as="style"
        />
        
        {/* Critical API endpoints preconnect */}
        <link rel="preconnect" href="https://quote-api.jup.ag" />
        <link rel="preconnect" href="https://api.mainnet-beta.solana.com" />
        <link rel="preconnect" href="https://birdeye.so" />
        <link rel="preconnect" href="https://api.helius.xyz" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://ipfs.io" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Preload critical images */}
        <link
          rel="preload"
          href="/bctlogo.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/computerlogo.svg"
          as="image"
          type="image/svg+xml"
        />
        
        {/* Preload critical token logos */}
        <link
          rel="preload"
          href="https://ipfs.io/ipfs/bafkreigxnxbmmov3vziotzzbcni4oja3qxdnrch6wjx6yqvm5xad2m3kce"
          as="image"
          type="image/jpeg"
        />
        <link
          rel="preload"
          href="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
          as="image"
          type="image/png"
        />
        
        {/* Resource hints for better performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        
        {/* Service Worker Registration - Temporarily disabled for debugging */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🔧 Service Worker registration temporarily disabled for debugging');
              // Temporarily disabled to debug login issues
              // if ('serviceWorker' in navigator) {
              //   window.addEventListener('load', () => {
              //     navigator.serviceWorker.register('/sw.js')
              //       .then((registration) => {
              //         console.log('✅ SW registered: ', registration);
              //       })
              //       .catch((registrationError) => {
              //         console.log('❌ SW registration failed: ', registrationError);
              //       });
              //   });
              // }
            `,
          }}
        />
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
            <div className="max-w-6xl mx-auto pt-12 pb-22">{children}</div>
          </PrivyClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
