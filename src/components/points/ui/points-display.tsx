'use client'

import { useUserPoints } from '@/components/points/hooks/use-points'
import { LoadCircle } from '@/components/common/load-circle'
import { cn } from '@/utils/utils'
import { Trophy, Flame, Star, TrendingUp } from 'lucide-react'

interface PointsDisplayProps {
  userId?: string
  variant?: 'header' | 'profile' | 'compact' | 'detailed'
  className?: string
  showRank?: boolean
  showStreak?: boolean
  showTodayPoints?: boolean
}

export function PointsDisplay({
  userId,
  variant = 'compact',
  className,
  showRank = true,
  showStreak = true,
  showTodayPoints = false
}: PointsDisplayProps) {
  const { points, loading, error } = useUserPoints(userId)

  if (loading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <LoadCircle />
        {variant !== 'compact' && <span className="text-sm text-muted-foreground">Loading...</span>}
      </div>
    )
  }

  if (error || !points) {
    return null
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  if (variant === 'header') {
    return (
      <div className={cn('flex items-center space-x-3 text-sm', className)}>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-mono font-bold text-foreground">
            {formatNumber(points.totalPoints)}
          </span>
        </div>
        
        {showStreak && points.currentStreak > 0 && (
          <div className="flex items-center space-x-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-mono text-orange-500">
              {points.currentStreak}
            </span>
          </div>
        )}

        {showRank && points.rank && (
          <div className="flex items-center space-x-1">
            <Trophy className="h-4 w-4 text-blue-500" />
            <span className="font-mono text-blue-500">
              #{points.rank}
            </span>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Star className="h-4 w-4 text-yellow-500" />
        <span className="font-mono font-bold text-foreground">
          {formatNumber(points.totalPoints)}
        </span>
      </div>
    )
  }

  if (variant === 'profile') {
    return (
      <div className={cn('grid grid-cols-2 gap-4 p-4 bg-card rounded-lg border', className)}>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold font-mono">
              {formatNumber(points.totalPoints)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Total Points</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Trophy className="h-5 w-5 text-blue-500" />
            <span className="text-2xl font-bold font-mono">
              #{points.rank || '—'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Rank</p>
        </div>

        {showStreak && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold font-mono">
                {points.currentStreak}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
        )}

        {showTodayPoints && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold font-mono">
                +{points.todayPoints || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Today</p>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 p-4 rounded-lg border border-yellow-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Total Points</span>
            </div>
            <p className="text-3xl font-bold font-mono">{formatNumber(points.totalPoints)}</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-4 rounded-lg border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Rank</span>
            </div>
            <p className="text-3xl font-bold font-mono">#{points.rank || '—'}</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 p-4 rounded-lg border border-orange-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">Current Streak</span>
            </div>
            <p className="text-3xl font-bold font-mono">{points.currentStreak} days</p>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 rounded-lg border border-green-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Today</span>
            </div>
            <p className="text-3xl font-bold font-mono">+{points.todayPoints || 0}</p>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Streak Information</h3>
          <div className="flex justify-between items-center">
            <span>Longest streak:</span>
            <span className="font-mono font-bold">{points.longestStreak} days</span>
          </div>
          {points.lastLoginDate && (
            <div className="flex justify-between items-center mt-1">
              <span>Last login:</span>
              <span className="font-mono text-sm">
                {new Date(points.lastLoginDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
} 