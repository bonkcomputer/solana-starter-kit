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
  const { walletAddress } = useCurrentWallet()
  const [mainUsername, setMainUsername] = useState<string | null>(null)
  const [isProfileCreated, setIsProfileCreated] = useState<boolean>(false)
  const [profileUsername, setProfileUsername] = useState<string | null>(null)
  const { profiles } = useGetProfiles({
    walletAddress: walletAddress || '',
  })
  const { ready, authenticated, logout } = usePrivy()
  const { login } = useLogin()
  const disableLogin = !ready || (ready && authenticated)
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

  useEffect(() => {
    if (profiles && profiles.length) {
      setMainUsername(profiles[0].profile.username)
    }

    if (isProfileCreated && profileUsername) {
      setMainUsername(profileUsername)
      setIsProfileCreated(false)
      setProfileUsername(null)
    }
  }, [profiles, isProfileCreated, profileUsername])

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

            {ready && authenticated ? (
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
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 shadow-lg rounded-md overflow-hidden z-50">
                        <div className="border-b border-muted-light">
                          <Button
                            variant="ghost"
                            className="px-4 py-2 hover:bg-muted-light w-full"
                            onClick={() => handleCopy(walletAddress)}
                          >
                            {copied ? (
                              <Check size={16} className="mr-2" />
                            ) : (
                              <Clipboard size={16} className="mr-2" />
                            )}
                            {abbreviateWalletAddress({
                              address: walletAddress,
                            })}
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          onClick={() => {
                            router.push(`/${mainUsername}`)
                            setIsDropdownOpen(false)
                          }}
                          className="px-4 py-2 hover:bg-muted-light w-full"
                        >
                          <User size={16} className="mr-2" /> My Profile
                        </Button>

                        <Button
                          variant="ghost"
                          className="px-4 py-2 hover:bg-muted-light w-full !text-red-500"
                          onClick={logout}
                        >
                          <LogOut size={16} className="mr-2" /> Log Out
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <CreateProfileContainer
                  setIsProfileCreated={setIsProfileCreated}
                  setProfileUsername={setProfileUsername}
                />
              )
            ) : (
              <Button
                variant="ghost"
                className='!text-green-500'
                disabled={disableLogin}
                onClick={() =>
                  login({
                    loginMethods: ['wallet'],
                    walletChainType: 'ethereum-and-solana',
                    disableSignup: false,
                  })
                }
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
