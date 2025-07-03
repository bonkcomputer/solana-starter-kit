'use client'

import { Comments } from '@/components/profile/comments/comments'
import { FollowList } from '@/components/profile/follow-list'
import { MyProfile } from '@/components/profile/my-profile'
import { DisplaySuggestedAndGlobal } from '@/components/suggested-and-creators-invite/hooks/display-suggested-and-global'
import type { IGetSocialResponse } from '@/models/profile.models'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { PortfolioView } from './portfolio-view'

interface Props {
  username: string
}

export function ProfileContent({ username }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [followers, setFollowers] = useState<IGetSocialResponse | null>(null)
  const [following, setFollowing] = useState<IGetSocialResponse | null>(null)
  const [profileUsername, setProfileUsername] = useState(username)
  const [selectedTab, setSelectedTab] = useState<
    'profile' | 'portfolio' | 'nfts'
  >('profile')

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      try {
        let actualUsername = username

        try {
          new PublicKey(username)
          const profilesResponse = await fetch(
            `/api/profiles?walletAddress=${username}`,
          )
          const profilesData = await profilesResponse.json()
          if (profilesData.profiles && profilesData.profiles.length > 0) {
            actualUsername = profilesData.profiles[0].username
            setProfileUsername(actualUsername)
          }
        } catch {
          actualUsername = username
        }

        const [followersResponse, followingResponse] = await Promise.all([
          fetch(`/api/followers/list?username=${actualUsername}&type=followers`),
          fetch(`/api/followers/list?username=${actualUsername}&type=following`)
        ])

        if (!followersResponse.ok || !followingResponse.ok) {
          console.error("Failed to fetch social data")
          setFollowers({ profiles: [], page: 0, pageSize: 0 })
          setFollowing({ profiles: [], page: 0, pageSize: 0 })
          return
        }

        const followersData = await followersResponse.json()
        const followingData = await followingResponse.json()

        setFollowers({ profiles: followersData.list, page: 0, pageSize: 0 })
        setFollowing({ profiles: followingData.list, page: 0, pageSize: 0 })
      } catch (error) {
        console.error('Failed to initialize profile content:', error)
        setFollowers({ profiles: [], page: 0, pageSize: 0 })
        setFollowing({ profiles: [], page: 0, pageSize: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    if (username) {
      init()
    }
  }, [username])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-muted mb-4" />
          <div className="h-4 w-40 bg-muted rounded mb-2" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <MyProfile username={profileUsername} />

      {/* Tabs */}
      <div className="bg-card rounded-lg p-1 flex">
        <button
          type="button"
          className={`flex-1 py-3 px-4 rounded-md text-center transition-all duration-200 ${
            selectedTab === 'profile'
              ? 'button-primary font-medium shadow-lg'
              : 'text-muted-foreground hover:bg-muted'
          }`}
          onClick={() => setSelectedTab('profile')}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span>Profile</span>
          </div>
        </button>
        <button
          type="button"
          className={`flex-1 py-3 px-4 rounded-md text-center transition-all duration-200 ${
            selectedTab === 'portfolio'
              ? 'button-primary font-medium shadow-lg'
              : 'text-muted-foreground hover:bg-muted'
          }`}
          onClick={() => setSelectedTab('portfolio')}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            <span>Tokens</span>
          </div>
        </button>
        <button
          type="button"
          className={`flex-1 py-3 px-4 rounded-md text-center transition-all duration-200 ${
            selectedTab === 'nfts'
              ? 'button-primary font-medium shadow-lg'
              : 'text-muted-foreground hover:bg-muted'
          }`}
          onClick={() => setSelectedTab('nfts')}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <span>NFTs</span>
          </div>
        </button>
      </div>

      {selectedTab === 'profile' ? (
        <>
          <div className="flex w-full justify-between space-x-4">
            <FollowList
              followers={
                followers || {
                  profiles: [],
                  page: 0,
                  pageSize: 0,
                }
              }
              following={
                following || {
                  profiles: [],
                  page: 0,
                  pageSize: 0,
                }
              }
            />
            <DisplaySuggestedAndGlobal username={profileUsername} />
          </div>
          <Comments username={profileUsername} />
        </>
      ) : (
        <PortfolioView
          username={username}
          initialTokenType={selectedTab === 'nfts' ? 'nft' : 'fungible'}
        />
      )}
    </div>
  )
}
