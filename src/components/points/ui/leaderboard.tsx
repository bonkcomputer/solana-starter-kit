'use client'

import { useState } from 'react'
import { useLeaderboard } from '@/components/points/hooks/use-leaderboard'
import { LoadCircle } from '@/components/common/load-circle'
import { Card } from '@/components/common/card'
import { Button } from '@/components/common/button'
import { cn } from '@/utils/utils'
import { Trophy, Crown, Medal, Award, Star, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface LeaderboardProps {
  userId?: string
  limit?: number
  className?: string
  showUserRank?: boolean
  showPeriodTabs?: boolean
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'all'

export function Leaderboard({
  userId,
  limit = 50,
  className,
  showUserRank = true,
  showPeriodTabs = true
}: LeaderboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all')
  const { leaderboard, loading, error } = useLeaderboard(limit, selectedPeriod, userId)

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <Trophy className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30'
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30'
      default:
        return 'bg-card border-border'
    }
  }

  const periods: { value: PeriodType; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'daily', label: 'Daily' }
  ]

  if (loading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center">
          <LoadCircle />
          <span className="ml-2">Loading leaderboard...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-muted-foreground">
          <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Failed to load leaderboard</p>
        </div>
      </Card>
    )
  }

  if (!leaderboard) {
    return null
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Leaderboard</h2>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4" />
            <span>{leaderboard.totalUsers} players</span>
          </div>
        </div>

        {/* Period Tabs */}
        {showPeriodTabs && (
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? 'default' : 'ghost'}
                onClick={() => setSelectedPeriod(period.value)}
                className="flex-1"
              >
                {period.label}
              </Button>
            ))}
          </div>
        )}

        {/* User's Rank (if not in top list) */}
        {showUserRank && userId && leaderboard.userRank && leaderboard.userRank > limit && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-center text-sm">
              <span className="font-semibold">Your rank: #{leaderboard.userRank}</span>
              <span className="text-muted-foreground ml-2">
                ({leaderboard.totalUsers - leaderboard.userRank} behind leader)
              </span>
            </p>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-2">
          {leaderboard.users.map((user) => (
            <Link
              key={user.privyDid}
              href={`/${user.username}`}
              className="block hover:transform hover:scale-[1.02] transition-all duration-200"
            >
              <div
                className={cn(
                  'p-4 rounded-lg border flex items-center justify-between',
                  getRankBadgeColor(user.rank),
                  userId === user.privyDid && 'ring-2 ring-blue-500/50'
                )}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex items-center space-x-2 min-w-[60px]">
                    {getRankIcon(user.rank)}
                    <span className="font-bold font-mono">
                      #{user.rank}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    {user.rank <= 3 && (
                      <div className="absolute -top-1 -right-1">
                        {getRankIcon(user.rank)}
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    {userId === user.privyDid && (
                      <p className="text-xs text-blue-500 font-medium">You</p>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold font-mono text-lg">
                      {formatNumber(user.totalPoints)}
                    </span>
                  </div>
                  {selectedPeriod !== 'all' && user.pointsThisPeriod !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      +{formatNumber(user.pointsThisPeriod)} this {selectedPeriod.slice(0, -2)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {leaderboard.users.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </div>
    </Card>
  )
} 