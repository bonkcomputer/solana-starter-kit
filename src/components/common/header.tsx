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
  Power,
  Gift,
  Twitter,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { CreateProfileContainer } from '../create-profile/create-profile-container'
import { DialectNotificationComponent } from '../notifications/dialect-notifications-component'
// Temporarily disabled for debugging
// import { preloadService } from '@/utils/preload'
// import { performanceMonitor } from '@/utils/performance'
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
  const [isComputerOn, setIsComputerOn] = useState(false)
  const [computerGlow, setComputerGlow] = useState(false)
  const [showRewardsModal, setShowRewardsModal] = useState(false)
  const [rewardsNumbers, setRewardsNumbers] = useState({
    amount: '0.00',
    value: '0.00'
  })
  const rewardsButtonRef = useRef<HTMLDivElement>(null)
  const rewardsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [showHomeTooltip, setShowHomeTooltip] = useState(false)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapNumbers, setSwapNumbers] = useState({
    revenue: '0.00',
    transactions: '0'
  })
  const swapButtonRef = useRef<HTMLDivElement>(null)
  const swapIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [showComputerModal, setShowComputerModal] = useState(false)
  const [computerNumbers, setComputerNumbers] = useState({
    activeUsers: '0',
    uptime: '0.0%'
  })
  const computerButtonRef = useRef<HTMLDivElement>(null)
  const computerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setAudio(new Audio('/bonksfx.aac'))
    // Temporarily disable preloading and performance monitoring for debugging
    console.log('🔧 Preloading and performance monitoring temporarily disabled for debugging')
    // preloadService.initializePreloading()
    // performanceMonitor.initialize()
  }, [])

  // Load Computer button state from localStorage
  useEffect(() => {
    const savedComputerState = localStorage.getItem('bct-computer-on')
    if (savedComputerState === 'true') {
      setIsComputerOn(true)
    }
  }, [])

  // Preload user-specific data when wallet is connected - temporarily disabled
  useEffect(() => {
    if (walletAddress && authenticated) {
      console.log('🔧 User-specific preloading temporarily disabled for debugging')
      // preloadService.initializePreloading(walletAddress)
    }
  }, [walletAddress, authenticated])

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
    console.log('Header login button clicked - Debug info:')
    console.log('ready:', ready)
    console.log('authenticated:', authenticated)
    console.log('userProfile:', userProfile)
    console.log('walletAddress:', walletAddress)
    console.log('mainUsername:', mainUsername)
    
    // If already authenticated and has profile, go to profile
    if (authenticated && userProfile) {
      router.push(`/${userProfile}`)
    } else if (!authenticated) {
      // Only trigger login if not authenticated
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

  const handleComputerClick = () => {
    // Toggle the on/off state
    const newState = !isComputerOn
    setIsComputerOn(newState)
    // Save to localStorage
    localStorage.setItem('bct-computer-on', newState.toString())
    // Trigger glow effect
    setComputerGlow(true)
    setTimeout(() => setComputerGlow(false), 600)
    // Open BCT Computer App in new tab only when turning ON
    if (newState === true) {
      window.open('https://bonk.computer', '_blank')
    }
  }

  // Animated rewards counter effect
  useEffect(() => {
    if (showRewardsModal) {
      // Start the animated rewards counter
      rewardsIntervalRef.current = setInterval(() => {
        setRewardsNumbers({
          amount: (Math.random() * 999999.99).toFixed(2),
          value: `$${(Math.random() * 9999.99).toFixed(2)}`
        })
      }, 100) // Update every 100ms for fast animation
    } else {
      // Clear interval when modal is hidden
      if (rewardsIntervalRef.current) {
        clearInterval(rewardsIntervalRef.current)
        rewardsIntervalRef.current = null
      }
    }

    return () => {
      if (rewardsIntervalRef.current) {
        clearInterval(rewardsIntervalRef.current)
      }
    }
  }, [showRewardsModal])

  const handleTwitterClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent modal from closing
    window.open('https://x.com/bonkcomputer', '_blank')
  }

  // Animated swap stats effect
  useEffect(() => {
    if (showSwapModal) {
      // Start the animated swap stats
      swapIntervalRef.current = setInterval(() => {
        setSwapNumbers({
          revenue: `$${(Math.random() * 99999.99).toFixed(2)}`,
          transactions: Math.floor(Math.random() * 999999).toLocaleString()
        })
      }, 100) // Update every 100ms for fast animation
    } else {
      // Clear interval when modal is hidden
      if (swapIntervalRef.current) {
        clearInterval(swapIntervalRef.current)
        swapIntervalRef.current = null
      }
    }

    return () => {
      if (swapIntervalRef.current) {
        clearInterval(swapIntervalRef.current)
      }
    }
  }, [showSwapModal])

  // Animated computer stats effect
  useEffect(() => {
    if (showComputerModal) {
      // Start the animated computer stats
      computerIntervalRef.current = setInterval(() => {
        setComputerNumbers({
          activeUsers: Math.floor(Math.random() * 9999).toLocaleString(),
          uptime: `${(Math.random() * 100).toFixed(1)}%`
        })
      }, 100) // Update every 100ms for fast animation
    } else {
      // Clear interval when modal is hidden
      if (computerIntervalRef.current) {
        clearInterval(computerIntervalRef.current)
        computerIntervalRef.current = null
      }
    }

    return () => {
      if (computerIntervalRef.current) {
        clearInterval(computerIntervalRef.current)
      }
    }
  }, [showComputerModal])

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-8">
        <div className="flex items-center justify-between w-full">
          {/* Logo - Left aligned */}
          <div className="flex items-center">
            <Link className="flex items-center space-x-2" href="/">
              <div className="flex items-center space-x-2" onClick={handleLogoClick}>
                <Image
                  src={bctLogo}
                  alt="BCT Logo"
                  width={32}
                  height={32}
                  className="cursor-pointer"
                />
                <span className="hidden font-mono text-yellow-500 uppercase tracking-wider sm:inline-block">
                  BCT Community Center
                </span>
              </div>
            </Link>
          </div>

          {/* All Buttons Group - Center */}
          <div className="flex items-center space-x-3">
            {/* Navigation Links */}
            <div 
              className="relative"
              onMouseEnter={() => setShowHomeTooltip(true)}
              onMouseLeave={() => setShowHomeTooltip(false)}
            >
              <Link
                className="h-9 w-9 flex items-center justify-center rounded bg-black border border-yellow-600/50 text-yellow-600/70 hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all duration-200"
                href="/"
              >
                <Home className="h-3.5 w-3.5" />
              </Link>
              {showHomeTooltip && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur border border-border rounded px-3 py-1.5 shadow-xl whitespace-nowrap z-50">
                  <p className="text-xs text-muted-foreground">Home</p>
                </div>
              )}
            </div>
            <div 
              ref={swapButtonRef}
              className="relative"
              onMouseEnter={() => {
                setShowSwapModal(true)
              }}
              onMouseLeave={() => {
                setShowSwapModal(false)
              }}
            >
              <Link
                className="h-9 w-9 flex items-center justify-center rounded bg-black border border-yellow-600/50 text-yellow-600/70 hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all duration-200"
                href="/trade"
              >
                <Coins className="h-3.5 w-3.5" />
              </Link>
              {/* Swap Stats Modal */}
              {showSwapModal && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur border border-border rounded-lg p-4 shadow-xl min-w-[250px] z-50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-3">Support the Project</p>
                    <div className="mb-3">
                      <div className="text-2xl font-mono font-bold text-foreground">{swapNumbers.revenue}</div>
                      <div className="text-sm text-muted-foreground">Generated Revenue</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-2xl font-mono font-bold text-primary">{swapNumbers.transactions}</div>
                      <div className="text-sm text-muted-foreground">Total Transactions</div>
                    </div>
                    <p className="text-xs text-muted-foreground">Swap here to support BCT!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Rewards Button */}
            <div 
              ref={rewardsButtonRef}
              className="relative"
              onMouseEnter={() => setShowRewardsModal(true)}
              onMouseLeave={() => setShowRewardsModal(false)}
            >
              <button
                className="h-9 w-9 flex items-center justify-center rounded bg-black border border-yellow-600/50 text-yellow-600/70 hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all duration-200"
                aria-label="Rewards"
              >
                <Gift className="h-3.5 w-3.5" />
              </button>
              
              {/* Animated Rewards Modal */}
              {showRewardsModal && (
                <div className="absolute top-full mt-2 right-0 bg-background/95 backdrop-blur border border-border rounded-lg p-4 shadow-xl min-w-[220px] z-50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">Points System</p>
                    <div className="mb-3">
                      <div className="text-2xl font-mono font-bold text-foreground">{rewardsNumbers.amount}</div>
                      <div className="text-sm text-muted-foreground">Staking Rewards</div>
                      <div className="text-lg font-mono font-bold text-green-600 mt-1">{rewardsNumbers.value}</div>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <p className="text-xs text-muted-foreground">Launching Soon</p>
                      <button
                        onClick={handleTwitterClick}
                        className="p-1 rounded-full hover:bg-accent transition-colors duration-200"
                        aria-label="Follow on Twitter"
                      >
                        <Twitter className="h-4 w-4 text-foreground hover:text-primary transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Computer On/Off Button */}
            <div 
              ref={computerButtonRef}
              className="relative"
              onMouseEnter={() => {
                setShowComputerModal(true)
              }}
              onMouseLeave={() => {
                setShowComputerModal(false)
              }}
            >
              <Button
                onClick={handleComputerClick}
                variant="default"
                className={`
                  ${isComputerOn 
                    ? 'bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 shadow-[0_0_20px_rgba(250,204,21,0.5)]' 
                    : 'bg-black border border-yellow-600/50 text-yellow-600/70 hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10'
                  } 
                  ${computerGlow ? 'shadow-[0_0_30px_10px_rgba(250,204,21,0.8)] scale-105' : ''}
                  transition-all duration-300 flex items-center space-x-2 px-4 py-1.5 h-9 rounded font-mono text-xs uppercase tracking-wider relative overflow-hidden
                `}
              >
                <Power className={`h-3.5 w-3.5 transition-all duration-300 ${isComputerOn ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : ''}`} />
                <span>{isComputerOn ? 'ON' : 'OFF'}</span>
                {isComputerOn && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse pointer-events-none" />
                )}
              </Button>
              
              {/* Computer VM Stats Modal */}
              {showComputerModal && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur border border-border rounded-lg p-4 shadow-xl min-w-[220px] z-50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">BCT Computer VM</p>
                    <p className="text-xs text-muted-foreground mb-3">{isComputerOn ? 'Status: ONLINE' : 'Status: OFFLINE'}</p>
                    <div className="mb-3">
                      <div className="text-2xl font-mono font-bold text-foreground">{computerNumbers.activeUsers}</div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-2xl font-mono font-bold text-green-600">{computerNumbers.uptime}</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <p className="text-xs text-muted-foreground">Click to {isComputerOn ? 'visit' : 'power on'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stake Button with Countdown Modal */}
            <div 
              ref={stakeButtonRef}
              className="relative"
              onMouseEnter={() => setShowStakeModal(true)}
              onMouseLeave={() => setShowStakeModal(false)}
            >
              <Button
                variant="default"
                className="bg-black border border-yellow-600/50 text-yellow-600/70 hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all duration-300 flex items-center space-x-2 px-4 py-1.5 h-9 rounded font-mono text-xs uppercase tracking-wider"
              >
                <Zap className="h-3.5 w-3.5" />
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
          </div>

          {/* Right section - User Profile/Login */}
          <div className="flex items-center space-x-3 ml-8">
            {/* Divider between buttons and user section */}
            <div className="h-6 w-px bg-yellow-600/30" />
            
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
                      onClick={async () => {
                        // Clear all local state first
                        setIsDropdownOpen(false)
                        setUserProfile(null)
                        setShowCreateProfile(false)
                        
                        // Clear any cached data in localStorage (except Computer state)
                        // Clear all localStorage except computer state
                        const keysToKeep = ['bct-computer-on']
                        const allKeys = Object.keys(localStorage)
                        allKeys.forEach(key => {
                          if (!keysToKeep.includes(key)) {
                            localStorage.removeItem(key)
                          }
                        })
                        
                        // Clear session storage
                        sessionStorage.clear()
                        
                        // Call Privy logout
                        await logout()
                        
                        // Navigate to home page
                        router.push('/')
                      }}
                      className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (showCreateProfile && authenticated) ? (
              <CreateProfileContainer
                setIsProfileCreated={handleProfileCreated}
                setProfileUsername={handleProfileUsername}
              />
            ) : (
              <Button
                onClick={handleLogin}
                disabled={!ready}
                className="bg-black border border-yellow-600/50 text-yellow-600/70 hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all duration-300 flex items-center space-x-2 px-4 py-1.5 h-9 rounded font-mono text-xs uppercase tracking-wider"
              >
                <LogIn className="h-3.5 w-3.5" />
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
