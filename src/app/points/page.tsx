'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Card } from '@/components/common/card'
import { Button } from '@/components/common/button'
import { PointsDisplay } from '@/components/points/ui/points-display'
import { Leaderboard } from '@/components/points/ui/leaderboard'
import { ReferralCard } from '@/components/points/ui/referral-card'
import { OGProgressDisplay } from '@/components/og/og-progress-display'
import { usePointsHistory } from '@/components/points/hooks/use-points'
import { useUserAchievements, useAllAchievements } from '@/components/points/hooks/use-achievements'
import { LoadCircle } from '@/components/common/load-circle'
import { usePrivy } from '@privy-io/react-auth'
import { useState } from 'react'
import { Star, Trophy, Gift, History, Award, Calendar, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/utils'

export default function PointsPage() {
  const { user } = usePrivy()
  const { mainUsername } = useCurrentWallet()
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'referrals' | 'history' | 'achievements'>('overview')
  
  const { history, loading: historyLoading } = usePointsHistory(user?.id)
  const { achievements: userAchievements, loading: userAchievementsLoading } = useUserAchievements(user?.id)
  const { achievements: allAchievements, loading: allAchievementsLoading } = useAllAchievements()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'PROFILE_CREATION':
        return '🎯'
      case 'DAILY_LOGIN':
        return '📅'
      case 'STREAK_BONUS':
        return '🔥'
      case 'COMMENT_CREATED':
        return '💬'
      case 'LIKE_GIVEN':
        return '❤️'
      case 'FOLLOW_USER':
        return '👥'
      case 'TRADE_COMPLETED':
        return '📈'
      case 'REFERRAL_BONUS':
        return '🎁'
      case 'ACHIEVEMENT_UNLOCKED':
        return '🏆'
      default:
        return '⭐'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Star },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'history', label: 'History', icon: History },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ]

  if (!user || !mainUsername) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">Points System</h2>
          <p className="text-muted-foreground mb-4">
            Please log in and create a profile to view your points.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Star className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Points System</h1>
        </div>
        <p className="text-muted-foreground">
          Earn points by engaging with the community, trading, and referring friends!
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Points Overview */}
          <PointsDisplay 
            userId={user.id} 
            variant="detailed" 
          />

          {/* OG Progress - Compact version */}
          <OGProgressDisplay 
            username={mainUsername}
            showTitle={true}
            compact={false}
          />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Recent Activity</span>
              </h3>
              
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadCircle />
                </div>
              ) : history && history.transactions.length > 0 ? (
                <div className="space-y-3">
                  {history.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getActionIcon(transaction.actionType)}</span>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "font-mono font-bold",
                          transaction.points > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </Card>

            {/* Recent Achievements */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-500" />
                <span>Recent Achievements</span>
              </h3>
              
              {userAchievementsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadCircle />
                </div>
              ) : userAchievements.length > 0 ? (
                <div className="space-y-3">
                  {userAchievements.slice(0, 3).map((userAchievement) => (
                    <div key={userAchievement.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <span className="text-2xl">{userAchievement.achievement.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{userAchievement.achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{userAchievement.achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Unlocked {formatDate(userAchievement.unlockedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-green-600">
                          +{userAchievement.achievement.pointsReward}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">No achievements yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep engaging to unlock achievements!
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Leaderboard userId={user.id} limit={100} />
      )}

      {activeTab === 'referrals' && (
        <ReferralCard userId={user.id} />
      )}

      {activeTab === 'history' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Points History</span>
          </h3>
          
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadCircle />
            </div>
          ) : history && history.transactions.length > 0 ? (
            <div className="space-y-2">
              {history.transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="text-xl">{getActionIcon(transaction.actionType)}</span>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "font-mono font-bold text-lg",
                      transaction.points > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No point history yet</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* User Achievements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-500" />
              <span>Your Achievements ({userAchievements.length})</span>
            </h3>
            
            {userAchievementsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadCircle />
              </div>
            ) : userAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userAchievements.map((userAchievement) => (
                  <div 
                    key={userAchievement.id} 
                    className="p-4 border rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-3xl">{userAchievement.achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold">{userAchievement.achievement.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {userAchievement.achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(userAchievement.unlockedAt)}
                          </span>
                          <span className="font-mono font-bold text-green-600">
                            +{userAchievement.achievement.pointsReward}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No achievements unlocked yet</p>
              </div>
            )}
          </Card>

          {/* All Available Achievements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>All Achievements</span>
            </h3>
            
            {allAchievementsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadCircle />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allAchievements.map((achievement) => {
                  const isUnlocked = userAchievements.some(ua => ua.achievementId === achievement.id)
                  
                  return (
                    <div 
                      key={achievement.id} 
                      className={cn(
                        "p-4 border rounded-lg transition-all",
                        isUnlocked 
                          ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20" 
                          : "bg-muted/50 border-muted-foreground/20 opacity-75"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <span className={cn(
                          "text-3xl",
                          !isUnlocked && "grayscale opacity-50"
                        )}>
                          {achievement.icon}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded",
                              achievement.category === 'SOCIAL' && "bg-blue-500/20 text-blue-600",
                              achievement.category === 'TRADING' && "bg-green-500/20 text-green-600",
                              achievement.category === 'ENGAGEMENT' && "bg-purple-500/20 text-purple-600",
                              achievement.category === 'REFERRAL' && "bg-orange-500/20 text-orange-600",
                              achievement.category === 'MILESTONE' && "bg-red-500/20 text-red-600",
                              achievement.category === 'SPECIAL' && "bg-pink-500/20 text-pink-600"
                            )}>
                              {achievement.category}
                            </span>
                            <span className="font-mono font-bold text-yellow-600">
                              +{achievement.pointsReward}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
} 