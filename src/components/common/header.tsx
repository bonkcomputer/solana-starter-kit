'use client'

import { Button } from '@/components/common/button'
import { abbreviateWalletAddress } from '@/components/common/tools'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import {
  Check,
  Clipboard,
  Coins,
  Home,
  LogIn,
  LogOut,
  User,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { CreateProfileContainer } from '../create-profile/create-profile-container'
import { DialectNotificationComponent } from '../notifications/dialect-notifications-component'
import bctLogo from '@/app/bctlogo.png'

export function Header() {
  const { walletAddress, mainUsername, checkProfile } = useCurrentWallet()
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  const [userProfile, setUserProfile] = useState<string | null>(null)
  const { ready, authenticated, logout } = usePrivy()
  const { login } = useLogin()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    setAudio(new Audio('/bonksfx.aac'))
  }, [])

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogoClick = () => {
    if (audio) {
      audio.play().catch(console.error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        (dropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        return
      }
      setIsDropdownOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Simple profile management - check once when authentication state changes
  useEffect(() => {
    if (!ready || !authenticated) {
      setUserProfile(null)
      setShowCreateProfile(false)
      return
    }

    // If we already have a username, use it
    if (mainUsername) {
      setUserProfile(mainUsername)
      setShowCreateProfile(false)
      return
    }

    // If we have a wallet but no username, check for profile once
    if (walletAddress && !mainUsername) {
      checkProfile().then((username) => {
        if (username) {
          setUserProfile(username)
          setShowCreateProfile(false)
        } else {
          // No profile found, show create profile dialog
          setShowCreateProfile(true)
        }
      })
    }
  }, [ready, authenticated, walletAddress, mainUsername, checkProfile])

  const handleProfileCreated = (username: string) => {
    setUserProfile(username)
    setShowCreateProfile(false)
  }

  const handleProfileUsername = (username: string) => {
    setUserProfile(username)
  }

  const handleLogin = () => {
    // If already authenticated and has profile, go to profile
    if (authenticated && userProfile) {
      router.push(`/${userProfile}`)
    } else {
      // Otherwise, trigger login
      login()
    }
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <div className="flex items-center space-x-2" onClick={handleLogoClick}>
              <Image
                src={bctLogo}
                alt="BCT Logo"
                width={32}
                height={32}
                className="cursor-pointer"
              />
              <span className="hidden font-bold sm:inline-block">
                BCT Computer
              </span>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/"
            >
              <Home className="h-4 w-4" />
            </Link>
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/trade"
            >
              <Coins className="h-4 w-4" />
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Show username if logged in, otherwise show login button */}
            {ready && authenticated && userProfile ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm font-medium hover:text-foreground/80"
                >
                  <User className="h-4 w-4" />
                  <span>{userProfile}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-popover p-1 shadow-md">
                    <button
                      onClick={() => {
                        router.push(`/${userProfile}`)
                        setIsDropdownOpen(false)
                      }}
                      className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </button>
                    
                    {walletAddress && (
                      <button
                        onClick={() => handleCopy(walletAddress)}
                        className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        {copied ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Clipboard className="mr-2 h-4 w-4" />
                        )}
                        {copied ? 'Copied!' : abbreviateWalletAddress({ address: walletAddress })}
                      </button>
                    )}

                    <div className="my-1 h-px bg-border" />
                    
                    <button
                      onClick={() => {
                        logout()
                        setIsDropdownOpen(false)
                        setUserProfile(null)
                        setShowCreateProfile(false)
                      }}
                      className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : showCreateProfile ? (
              <CreateProfileContainer
                setIsProfileCreated={handleProfileCreated}
                setProfileUsername={handleProfileUsername}
              />
            ) : (
              <Button
                onClick={handleLogin}
                disabled={!ready}
                className="flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>{authenticated && userProfile ? userProfile : 'Log in'}</span>
              </Button>
            )}

            {ready && authenticated && userProfile && (
              <DialectNotificationComponent />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
