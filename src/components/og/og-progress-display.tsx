'use client'

import { useOGProgress } from './hooks/use-og-progress'
import { Card } from '@/components/common/card'
import { OGBadge } from '@/components/common/og-badge'

interface ProgressBarProps {
  label: string
  current: number
  required: number
  percentage: number
  formatValue?: (value: number) => string
  icon?: React.ReactNode
}

function ProgressBar({ 
  label, 
  current, 
  required, 
  percentage, 
  formatValue = (val) => val.toString(),
  icon 
}: ProgressBarProps) {
  const isComplete = percentage >= 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className={`text-xs ${isComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
          {formatValue(current)} / {formatValue(required)}
        </span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground text-right">
        {percentage.toFixed(1)}% complete
      </div>
    </div>
  )
}

interface OGProgressDisplayProps {
  username?: string
  showTitle?: boolean
  compact?: boolean
}

export function OGProgressDisplay({ 
  username, 
  showTitle = true, 
  compact = false 
}: OGProgressDisplayProps) {
  const { progress, loading, error } = useOGProgress()

  if (loading) {
    return (
      <Card className={compact ? 'p-3' : 'p-4'}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded" />
            <div className="h-2 bg-muted rounded" />
            <div className="h-2 bg-muted rounded" />
          </div>
        </div>
      </Card>
    )
  }

  if (error || !progress) {
    return null // Don't show anything if there's an error or no data
  }

  if (progress.isOG) {
    return (
      <Card className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm font-medium">You are an OG member!</span>
          {username && (
            <OGBadge username={username} size={compact ? 'sm' : 'md'} />
          )}
        </div>
      </Card>
    )
  }

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`

  return (
    <Card className={compact ? 'p-3' : 'p-4'}>
      {showTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Path to OG Status</h3>
          <p className="text-sm text-muted-foreground">
            Complete any one of these to earn OG status
          </p>
        </div>
      )}

      <div className="space-y-4">
        <ProgressBar
          label="Trading Volume"
          current={progress.progress.tradingVolume.current}
          required={progress.progress.tradingVolume.required}
          percentage={progress.progress.tradingVolume.percentage}
          formatValue={formatCurrency}
          icon={<span className="text-green-500">💹</span>}
        />

        <ProgressBar
          label="Achievements"
          current={progress.progress.achievements.current}
          required={progress.progress.achievements.required}
          percentage={progress.progress.achievements.percentage}
          icon={<span className="text-yellow-500">🏆</span>}
        />

        <ProgressBar
          label="Total Points"
          current={progress.progress.points.current}
          required={progress.progress.points.required}
          percentage={progress.progress.points.percentage}
          formatValue={(val) => val.toLocaleString()}
          icon={<span className="text-blue-500">⭐</span>}
        />
      </div>

      {!compact && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Trading $100k volume is the fastest way to earn OG status. 
            Keep swapping tokens to build your volume!
          </p>
        </div>
      )}
    </Card>
  )
} 