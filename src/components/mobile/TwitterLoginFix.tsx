'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export function TwitterLoginFix() {
  const { login } = usePrivy()

  useEffect(() => {
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
    }

    // Initial fix
    fixTwitterButtons()

    // Monitor for dynamically added buttons
    const observer = new MutationObserver(() => {
      fixTwitterButtons()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      observer.disconnect()
    }
  }, [login])

  return null // This is a utility component with no render
}