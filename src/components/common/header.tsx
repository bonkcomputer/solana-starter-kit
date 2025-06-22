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
  Zap,
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
  const [showStakeModal, setShowStakeModal] = useState(false)
  const [countdownNumbers, setCountdownNumbers] = useState({
    days: '??',
    hours: '??',
    minutes: '??',
    seconds: '??'
  })
  const stakeButtonRef = useRef<HTMLDivElement>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // Animated countdown effect
  useEffect(() => {
    if (showStakeModal) {
      // Start the animated countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdownNumbers({
          days: Math.floor(Math.random() * 30).toString().padStart(2, '0'),
          hours: Math.floor(Math.random() * 24).toString().padStart(2, '0'),
          minutes: Math.floor(Math.random() * 60).toString().padStart(2, '0'),
          seconds: Math.floor(Math.random() * 60).toString().padStart(2, '0')
        })
      }, 100) // Update every 100ms for fast animation
    } else {
      // Clear interval when modal is hidden
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [showStakeModal])

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
            {/* Stake Button with Countdown Modal */}
            <div 
              ref={stakeButtonRef}
              className="relative"
              onMouseEnter={() => setShowStakeModal(true)}
              onMouseLeave={() => setShowStakeModal(false)}
            >
              <Button
                variant="default"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span>Stake</span>
              </Button>
              
              {/* Animated Countdown Modal */}
              {showStakeModal && (
                <div className="absolute top-full mt-2 right-0 bg-background/95 backdrop-blur border border-border rounded-lg p-4 shadow-xl min-w-[200px] z-50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">$BCT Staking Program</p>
                    <p className="text-xs text-muted-foreground mb-3">Launching Soon</p>
                    <div className="flex justify-center items-center space-x-3">
                      <div className="text-center">
                        <div className="text-lg font-mono font-bold text-foreground">{countdownNumbers.days}</div>
                        <div className="text-xs text-muted-foreground">days</div>
                      </div>
                      <span className="text-foreground">:</span>
                      <div className="text-center">
                        <div className="text-lg font-mono font-bold text-foreground">{countdownNumbers.hours}</div>
                        <div className="text-xs text-muted-foreground">hrs</div>
                      </div>
                      <span className="text-foreground">:</span>
                      <div className="text-center">
                        <div className="text-lg font-mono font-bold text-foreground">{countdownNumbers.minutes}</div>
                        <div className="text-xs text-muted-foreground">min</div>
                      </div>
                      <span className="text-foreground">:</span>
                      <div className="text-center">
                        <div className="text-lg font-mono font-bold text-foreground">{countdownNumbers.seconds}</div>
                        <div className="text-xs text-muted-foreground">sec</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
