'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export function TwitterLoginFix() {
  const { login } = usePrivy()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Enhanced Twitter login with proper X app/web redirect
    const handleTwitterLogin = () => {
      try {
        // First try Privy's Twitter login
        login({
          loginMethods: ['twitter']
        })
      } catch (error) {
        console.error('Privy Twitter login error:', error)
        
        // Fallback: Try to open X app or x.com directly
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        
        if (isMobile) {
          // Try to open X app first, fallback to web
          const xAppUrl = 'twitter://login'
          const xWebUrl = 'https://x.com/login'
          
          // Create a hidden iframe to test if X app is available
          const iframe = document.createElement('iframe')
          iframe.style.display = 'none'
          iframe.src = xAppUrl
          document.body.appendChild(iframe)
          
          // Fallback to web after a short delay
          setTimeout(() => {
            document.body.removeChild(iframe)
            window.open(xWebUrl, '_blank')
          }, 1000)
        } else {
          // Desktop: just open x.com
          window.open('https://x.com/login', '_blank')
        }
      }
    }

    // Find and enhance Twitter login buttons
    const enhanceTwitterButtons = () => {
      try {
        // Look for Privy's Twitter buttons and other Twitter-related buttons
        const selectors = [
          'button[data-testid*="twitter"]',
          'button[data-testid*="x"]',
          'button:contains("Twitter")',
          'button:contains("X")',
          '[class*="twitter"]',
          '[class*="x-login"]',
          'button[aria-label*="Twitter"]',
          'button[aria-label*="X"]'
        ]
        
        selectors.forEach(selector => {
          const buttons = document.querySelectorAll(selector)
          buttons.forEach(element => {
            const button = element as HTMLButtonElement
            if (button && !button.hasAttribute('data-enhanced')) {
              button.setAttribute('data-enhanced', 'true')
              
              // Replace the click handler
              button.onclick = (e) => {
                e.preventDefault()
                e.stopPropagation()
                handleTwitterLogin()
                return false
              }
              
              // Also add event listener for extra coverage
              button.addEventListener('click', (e) => {
                e.preventDefault()
                e.stopPropagation()
                handleTwitterLogin()
              }, { capture: true })
            }
          })
        })
      } catch (error) {
        console.warn('TwitterLoginFix: Error enhancing buttons:', error)
      }
    }

    // Initialize enhancement
    const initEnhancement = () => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceTwitterButtons)
      } else {
        enhanceTwitterButtons()
      }

      // Monitor for dynamically added buttons
      const observer = new MutationObserver(() => {
        enhanceTwitterButtons()
      })

      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'data-testid']
        })
      }

      return () => {
        observer.disconnect()
        document.removeEventListener('DOMContentLoaded', enhanceTwitterButtons)
      }
    }

    const cleanup = initEnhancement()
    return cleanup
  }, [login])

  return null // This is a utility component with no render
}