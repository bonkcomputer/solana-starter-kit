'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export function TwitterLoginFix() {
  const { login } = usePrivy()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Fix Twitter login button functionality
    const handleTwitterLogin = () => {
      try {
        login({
          loginMethods: ['twitter']
        })
      } catch (error) {
        console.error('Twitter login error:', error)
        // Fallback to email login
        login({
          loginMethods: ['email']
        })
      }
    }

    // Find and fix Twitter login buttons
    const fixTwitterButtons = () => {
      try {
        const twitterButtons = document.querySelectorAll('button[data-testid*="twitter"], button:contains("Twitter"), [class*="twitter"]')
        
        twitterButtons.forEach(button => {
          if (button && !button.hasAttribute('data-fixed')) {
            button.setAttribute('data-fixed', 'true')
            button.addEventListener('click', (e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTwitterLogin()
            })
          }
        })
      } catch (error) {
        console.warn('TwitterLoginFix: Error fixing buttons:', error)
      }
    }

    // Wait for document to be ready
    const initFix = () => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixTwitterButtons)
      } else {
        fixTwitterButtons()
      }

      // Monitor for dynamically added buttons
      const observer = new MutationObserver(() => {
        fixTwitterButtons()
      })

      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        })
      }

      return () => {
        observer.disconnect()
        document.removeEventListener('DOMContentLoaded', fixTwitterButtons)
      }
    }

    const cleanup = initFix()
    return cleanup
  }, [login])

  return null // This is a utility component with no render
}