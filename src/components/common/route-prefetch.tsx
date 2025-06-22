'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Routes to prefetch based on user behavior
const CRITICAL_ROUTES = [
  '/trade',
  '/token/D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk', // BCT token page
  '/token/So11111111111111111111111111111111111111112', // SOL token page
]

export function RoutePrefetch() {
  const router = useRouter()

  useEffect(() => {
    // Prefetch critical routes after initial load
    const prefetchTimer = setTimeout(() => {
      CRITICAL_ROUTES.forEach(route => {
        router.prefetch(route)
      })
    }, 2000) // Wait 2 seconds after load

    return () => clearTimeout(prefetchTimer)
  }, [router])

  // Prefetch on hover for navigation links
  useEffect(() => {
    const handleMouseEnter = (event: Event) => {
      const target = event.target as HTMLElement
      const link = target.closest('a[href^="/"]') as HTMLAnchorElement
      
      if (link && link.href) {
        const url = new URL(link.href)
        router.prefetch(url.pathname)
      }
    }

    // Add hover listeners to navigation elements
    const navElements = document.querySelectorAll('nav, .navigation')
    navElements.forEach(nav => {
      nav.addEventListener('mouseenter', handleMouseEnter, true)
    })

    return () => {
      navElements.forEach(nav => {
        nav.removeEventListener('mouseenter', handleMouseEnter, true)
      })
    }
  }, [router])

  return null // This component doesn't render anything
} 