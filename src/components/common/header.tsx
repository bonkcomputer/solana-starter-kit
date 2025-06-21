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
  Menu,
  RefreshCw,
  User,
  Settings,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { useGetProfiles } from '../auth/hooks/use-get-profiles'
import { CreateProfileContainer } from '../create-profile/create-profile-container'
import { DialectNotificationComponent } from '../notifications/dialect-notifications-component'
import bctLogo from '@/app/bctlogo.png'

export function Header() {
  const { walletAddress, mainUsername: currentMainUsername, loadingMainUsername } = useCurrentWallet()
  const [mainUsername, setMainUsername] = useState<string | null>(null)
  const [isProfileCreated, setIsProfileCreated] = useState<boolean>(false)
  const [profileUsername, setProfileUsername] = useState<string | null>(null)
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false)
  const { profiles, loading: profilesLoading } = useGetProfiles({
    walletAddress: walletAddress || '',
  })
  const { ready, authenticated, logout, user } = usePrivy()
  const { login } = useLogin()
  const disableLogin = !ready
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  // Determine if we should show create profile based on authentication and loading states
  const showCreateProfile = ready && authenticated && walletAddress && (!loadingMainUsername || loadingTimeout) && (!profilesLoading || loadingTimeout) && !mainUsername

  // Debug logging
  useEffect(() => {
    console.log('Header state:', {
      ready,
      authenticated,
      walletAddress,
      mainUsername,
      currentMainUsername,
      profilesLength: profiles?.length || 0,
      loadingMainUsername,
      profilesLoading,
      userId: user?.id,
      loadingTimeout,
      showCreateProfile
    })
  }, [ready, authenticated, walletAddress, mainUsername, currentMainUsername, profiles, loadingMainUsername, profilesLoading, user, loadingTimeout, showCreateProfile])

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

  // Updated logic to handle profile states better
  useEffect(() => {
    // Don't do anything if Privy isn't ready or user isn't authenticated
    if (!ready || !authenticated) {
      setMainUsername(null)
      return
    }

    // Priority 1: Use currentMainUsername from useCurrentWallet if available
    if (currentMainUsername) {
      setMainUsername(currentMainUsername)
      return
    }

    // Priority 2: Use profiles from direct API call
    if (profiles && profiles.length > 0) {
      setMainUsername(profiles[0].profile.username)
      return
    }

    // Priority 3: Handle profile creation completion
    if (isProfileCreated && profileUsername) {
      setMainUsername(profileUsername)
      setIsProfileCreated(false)
      setProfileUsername(null)
      return
    }

    // If we're not loading and no profile is found, clear mainUsername
    if (!loadingMainUsername && !profilesLoading) {
      setMainUsername(null)
    }
  }, [currentMainUsername, profiles, isProfileCreated, profileUsername, ready, authenticated, loadingMainUsername, profilesLoading])

  const handleProfileCreated = (username: string) => {
    setIsProfileCreated(true)
    setProfileUsername(username)
    setMainUsername(username)
    // Force a page refresh to ensure all components get the updated state
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  // Determine loading message
  const getLoadingMessage = () => {
    if (!ready) return 'Loading...'
    if (!authenticated) return null
    if ((loadingMainUsername || profilesLoading) && !loadingTimeout) return 'Loading profile...'
    if (!walletAddress) return 'No wallet connected'
    return 'No profile found'
  }

  // Add timeout mechanism to prevent infinite loading
  useEffect(() => {
    if (ready && authenticated && (loadingMainUsername || profilesLoading)) {
      const timeout = setTimeout(() => {
        console.warn('Profile loading timed out, forcing stop')
        setLoadingTimeout(true)
      }, 15000) // 15 second timeout

      return () => clearTimeout(timeout)
    } else {
      setLoadingTimeout(false)
    }
  }, [ready, authenticated, loadingMainUsername, profilesLoading])

  return (
    <>
      <div className="border-b-1 border-muted flex items-center justify-center w-full p-3">
        <div className="max-w-6xl w-full flex items-center justify-between">
          <Link
            href="/"
            className="hover:opacity-80 flex items-center gap-3"
          >
            <Image
              alt="logo"
              src={bctLogo}
              width={32}
              height={32}
              className="transition-transform hover:scale-110"
              onClick={handleLogoClick}
            />
            <h1 className="text-2xl font-nabla">Trading Computer</h1>
          </Link>

          <nav className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Home className="h-4 w-4 mr-2" />
              <span>Home</span>
            </Link>

            <Link
              href="/token"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Coins className="h-4 w-4 mr-2" />
              <span>Tokens</span>
            </Link>

            <Link
              href="/trade"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Swap</span>
            </Link>

            {/* Authentication and Profile Section */}
            {!ready ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : authenticated ? (
              mainUsername ? (
                <div className="flex items-center relative" ref={dropdownRef}>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="space-x-2"
                    >
                      <p className="truncate font-bold">{mainUsername}</p>
                      <Menu size={20} />
                    </Button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 border border-gray-700">
                        {/* User Info Section */}
                        <div className="px-4 py-3 border-b border-gray-700">
                          <p className="text-sm font-medium">{mainUsername}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {abbreviateWalletAddress({ address: walletAddress })}
                          </p>
                        </div>

                        {/* Copy Wallet Address */}
                        <Button
                          variant="ghost"
                          className="px-4 py-2 hover:bg-gray-700 w-full text-left justify-start"
                          onClick={() => handleCopy(walletAddress)}
                        >
                          {copied ? (
                            <Check size={16} className="mr-2" />
                          ) : (
                            <Clipboard size={16} className="mr-2" />
                          )}
                          Copy Address
                        </Button>

                        {/* My Profile */}
                        <Button
                          variant="ghost"
                          onClick={() => {
                            router.push(`/${mainUsername}`)
                            setIsDropdownOpen(false)
                          }}
                          className="px-4 py-2 hover:bg-gray-700 w-full text-left justify-start"
                        >
                          <User size={16} className="mr-2" /> My Profile
                        </Button>

                        {/* Settings placeholder for future */}
                        <Button
                          variant="ghost"
                          className="px-4 py-2 hover:bg-gray-700 w-full text-left justify-start opacity-50 cursor-not-allowed"
                          disabled
                        >
                          <Settings size={16} className="mr-2" /> Settings
                        </Button>

                        {/* Logout */}
                        <div className="border-t border-gray-700">
                          <Button
                            variant="ghost"
                            className="px-4 py-2 hover:bg-gray-700 w-full text-left justify-start !text-red-400"
                            onClick={() => {
                              logout()
                              setIsDropdownOpen(false)
                              setMainUsername(null)
                            }}
                          >
                            <LogOut size={16} className="mr-2" /> Log Out
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : showCreateProfile ? (
                <CreateProfileContainer
                  setIsProfileCreated={handleProfileCreated}
                  setProfileUsername={setProfileUsername}
                />
              ) : (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {getLoadingMessage()}
                  {loadingTimeout && (
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs underline hover:opacity-80"
                    >
                      Refresh
                    </button>
                  )}
                </div>
              )
            ) : (
              <Button
                variant="ghost"
                className='!text-green-500'
                disabled={disableLogin}
                onClick={login}
              >
                <LogIn className="h-4 w-4 mr-2" /> Log in
              </Button>
            )}

            <div className="flex items-center gap-2">
              <DialectNotificationComponent />
              <Link
                href="https://github.com/Primitives-xyz/solana-starter-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 flex items-center"
              >
                <Image
                  width={20}
                  height={20}
                  alt="Github link"
                  src="/logos/github-mark.svg"
                />
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
