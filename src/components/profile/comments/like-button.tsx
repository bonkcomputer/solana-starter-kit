import { Button } from '@/components/common/button'
import { cn } from '@/utils/utils'
import { Heart } from 'lucide-react'
import { useState } from 'react'

interface LikeButtonProps {
  initialLikeCount: number
  initiallyLiked: boolean
  onLike: () => void
  onUnlike: () => void
  disabled?: boolean
}

export function LikeButton({
  initialLikeCount,
  initiallyLiked,
  onLike,
  onUnlike,
  disabled,
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [hasLiked, setHasLiked] = useState(initiallyLiked)

  const handleToggleLike = () => {
    if (hasLiked) {
      setLikeCount((prev) => Math.max(0, prev - 1))
      setHasLiked(false)
      onUnlike()
    } else {
      setLikeCount((prev) => prev + 1)
      setHasLiked(true)
      onLike()
    }
  }

  return (
    <div className="flex items-end justify-end">
      <div className="flex items-center space-x-1">
        <p className="text-gray">{likeCount}</p>
        <Button variant="ghost" onClick={handleToggleLike} disabled={disabled}>
          <Heart
            className={cn('text-muted-light', {
              'fill-accent text-muted': hasLiked,
              'text-muted-light': !hasLiked,
            })}
            size={15}
          />
        </Button>
      </div>
    </div>
  )
}
