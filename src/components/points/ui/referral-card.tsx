'use client'

import { useState } from 'react'
import { useReferrals } from '@/components/points/hooks/use-referrals'
import { Card } from '@/components/common/card'
import { Button } from '@/components/common/button'
import { LoadCircle } from '@/components/common/load-circle'
import { CopyPaste } from '@/components/common/copy-paste'
import { cn } from '@/utils/utils'
import { Users, Gift, Share2, Star, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

interface ReferralCardProps {
  userId?: string
  className?: string
  showStats?: boolean
  showReferralList?: boolean
}

export function ReferralCard({
  userId,
  className,
  showStats = true,
  showReferralList = true
}: ReferralCardProps) {
  const { referralStats, loading, error } = useReferrals(userId)
  const [copying, setCopying] = useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const generateReferralUrl = (code: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}?ref=${code}`
  }

  const shareReferral = async () => {
    if (!referralStats) return

    const referralUrl = generateReferralUrl(referralStats.referralCode)
    const shareText = `Join me on BCT and earn 250 bonus points! Use my referral link: ${referralUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BCT - Earn Bonus Points!',
          text: shareText,
          url: referralUrl
        })
      } catch (_error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      setCopying(true)
      try {
        await navigator.clipboard.writeText(shareText)
        toast.success('Referral link copied to clipboard!')
      } catch (_error) {
        toast.error('Failed to copy link')
      } finally {
        setCopying(false)
      }
    }
  }

  if (loading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center">
          <LoadCircle />
          <span className="ml-2">Loading referral data...</span>
        </div>
      </Card>
    )
  }

  if (error || !referralStats) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center text-muted-foreground">
          <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Failed to load referral data</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Gift className="h-6 w-6 text-purple-500" />
        <h2 className="text-2xl font-bold">Referral Program</h2>
      </div>

      {/* Referral Link */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center space-x-2">
          <Share2 className="h-4 w-4" />
          <span>Your Referral Link</span>
        </h3>
        
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between space-x-3">
            <code className="text-sm bg-background px-2 py-1 rounded flex-1 truncate">
              {generateReferralUrl(referralStats.referralCode)}
            </code>
            <CopyPaste 
              content={generateReferralUrl(referralStats.referralCode)}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={shareReferral}
            disabled={copying}
            className="flex-1"
            variant="secondary"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {copying ? 'Copying...' : 'Share Link'}
          </Button>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
          <p className="text-sm text-center">
            <span className="font-semibold">Earn 500 points</span> for each friend who joins!
            <br />
            <span className="text-muted-foreground">Your friends get 250 bonus points too.</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 p-4 rounded-lg border border-purple-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="font-semibold">Total Referrals</span>
            </div>
            <p className="text-3xl font-bold font-mono">{referralStats.totalReferrals}</p>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 rounded-lg border border-green-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Points Earned</span>
            </div>
            <p className="text-3xl font-bold font-mono">
              {formatNumber(referralStats.totalReferralPoints)}
            </p>
          </div>
        </div>
      )}

      {/* Referral List */}
      {showReferralList && referralStats.referrals.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Your Referrals</span>
          </h3>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {referralStats.referrals.map((referral) => (
              <div
                key={referral.privyDid}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {referral.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{referral.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(referral.signupDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="font-mono text-sm">
                      +{formatNumber(referral.pointsEarned)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State for Referrals */}
      {showReferralList && referralStats.referrals.length === 0 && (
        <div className="text-center py-6">
          <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">No referrals yet</p>
          <p className="text-sm text-muted-foreground">
            Share your link to start earning bonus points!
          </p>
        </div>
      )}
    </Card>
  )
} 