import { PopularTokensTable } from '@/components/token/popular-tokens-table'
import TokenChartSwapContainer from '@/components/trade/components/token-chart-swap-container'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { RecentTrades } from '@/components/recent-trades/recent-trades'

// This is a server component (the default for page.tsx in Next.js App Router)
export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <main className="flex-1">
        <section className="container py-8">
          <Suspense
            fallback={
              <div className="h-[500px] flex items-center justify-center">
                Loading chart and swap...
              </div>
            }
          >
            <TokenChartSwapContainer
              defaultTokenAddress="So11111111111111111111111111111111111111112" // SOL address
              defaultTokenSymbol="SOL"
            />
          </Suspense>
        </section>
        <section className="container py-8">
          <h2 className="text-2xl font-bold mb-6">Popular Tokens</h2>
          <PopularTokensTable />
        </section>
        <section className="container py-8">
          <h2 className="text-2xl font-bold mb-6">Recent Trades</h2>
          <RecentTrades />
        </section>
      </main>
      <footer className="border-t border-zinc-800 py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              alt="logo"
              src="/computerlogo.svg"
              width={32}
              height={32}
            />
            <span className="font-bold">BCT Trading Computer</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              href="https://x.com/bonkcomputer"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Twitter
            </Link>
            <Link
              href="https://t.me/bonkcomputerchat"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Telegram
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
