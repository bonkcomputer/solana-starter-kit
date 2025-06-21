import { LoadCircle } from '@/components/common/load-circle'
import { CommentItems } from './comment-items'
import { PopulatedComment } from '../hooks/use-get-comments';

interface CommentListProps {
  comments: PopulatedComment[];
  loading: boolean
  handleLike: (commentId: string, tapestryCommentId: string) => void;
  handleUnlike: (commentId: string, tapestryCommentId: string) => void;
  currentUserId?: string;
}

export function CommentList({
  comments,
  loading,
  handleLike,
  handleUnlike,
  currentUserId,
}: CommentListProps) {
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <LoadCircle />
      </div>
    )
  }
  return (
    <div className="flex flex-col space-y-4">
      {comments?.map((comment, index) => (
        <CommentItems
          key={index}
          comment={comment}
          handleLike={handleLike}
          handleUnlike={handleUnlike}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
