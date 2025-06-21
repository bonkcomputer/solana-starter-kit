import { Card } from '@/components/common/card'
import { LikeButton } from '@/components/profile/comments/like-button'
import { formatRelativeTime } from '@/utils/utils'
import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PopulatedComment } from '../hooks/use-get-comments'

interface CommentItemsProps {
  comment: PopulatedComment
  handleLike: (commentId: string, tapestryCommentId: string) => void
  handleUnlike: (commentId: string, tapestryCommentId: string) => void
  currentUserId?: string
}

export function CommentItems({
  comment,
  handleLike,
  handleUnlike,
  currentUserId,
}: CommentItemsProps) {
  const isLikedByCurrentUser = comment.likes.some(like => like.userId === currentUserId)
  const hasTapestryId = !!comment.tapestryCommentId;

  return (
    <Card className="w-full space-y-4">
      <div className="flex space-x-1 items-center justify-end text-gray text-sm">
        <p className="pr-2">
          {formatRelativeTime(comment.createdAt)} by
        </p>
        {comment.author.image ? (
          <Image
            src={comment.author.image}
            alt="avatar"
            width={15}
            height={15}
            className="object-cover rounded-full"
            unoptimized
          />
        ) : (
          <div className="bg-muted-light rounded-full w-[15px] h-[15px] flex items-center justify-center">
            <User size={13} className="text-muted" />
          </div>
        )}
        <Link href={`/${comment.author.username}`} className="hover:underline">
          <p>{comment.author.username}</p>
        </Link>
      </div>

      <div>
        <p>{comment.text}</p>
      </div>

      <LikeButton
        initialLikeCount={comment.likes.length}
        initiallyLiked={isLikedByCurrentUser}
        onLike={() => {
            if (comment.tapestryCommentId) {
                handleLike(comment.id, comment.tapestryCommentId)
            }
        }}
        onUnlike={() => {
            if (comment.tapestryCommentId) {
                handleUnlike(comment.id, comment.tapestryCommentId)
            }
        }}
        disabled={!hasTapestryId}
      />
    </Card>
  )
}
