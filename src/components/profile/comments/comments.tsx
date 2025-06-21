'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Alert } from '@/components/common/alert'
import { CommentInput } from '@/components/profile/comments/comment-input'
import { CommentList } from '@/components/profile/comments/comment-list'
import { useCreateComment } from '@/components/profile/hooks/use-create-comment'
import { useCreateLike, useDeleteLike } from '@/components/profile/hooks/use-create-like'
import { useGetComments } from '@/components/profile/hooks/use-get-comments'
import { useGetProfileInfo } from '../hooks/use-get-profile-info'
import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'

interface Props {
  username: string; // The username of the profile being viewed
}

export function Comments({ username }: Props) {
  const { user: currentUser } = usePrivy();
  const { mainUsername: currentUserUsername } = useCurrentWallet();
  const { profile: viewedProfile } = useGetProfileInfo(username);

  const { comments, loading, refetch } = useGetComments({
    profileId: viewedProfile?.privyDid || '',
  });

  const { createComment, loading: commentLoading, error: commentError, success: commentSuccess } = useCreateComment();
  const { createLike, error: likeError, success: likeSuccess } = useCreateLike();
  const { deleteLike, error: unlikeError, success: unlikeSuccess } = useDeleteLike();

  const [commentText, setCommentText] = useState('');

  // Refetch comments after a new comment, like, or unlike
  useEffect(() => {
    if (commentSuccess || likeSuccess || unlikeSuccess) {
      refetch();
      if (commentSuccess) {
        setCommentText('');
      }
    }
  }, [commentSuccess, likeSuccess, unlikeSuccess, refetch]);

  const handleSubmitComment = () => {
    if (currentUser?.id && viewedProfile?.privyDid && currentUserUsername && viewedProfile?.username) {
        createComment({
            authorId: currentUser.id,
            profileId: viewedProfile.privyDid,
            text: commentText,
            authorUsername: currentUserUsername,
            profileUsername: viewedProfile.username,
        });
    } else {
        console.error("Cannot post comment, user or profile information is missing.");
    }
  }

  const handleLike = (commentId: string, tapestryCommentId: string) => {
    if (currentUser?.id && currentUserUsername) {
        createLike({
            userId: currentUser.id,
            commentId,
            username: currentUserUsername,
            tapestryCommentId,
        })
    }
  }

  const handleUnlike = (commentId: string, tapestryCommentId: string) => {
    if (currentUser?.id && currentUserUsername) {
        deleteLike({
            userId: currentUser.id,
            commentId,
            username: currentUserUsername,
            tapestryCommentId,
        })
    }
  }

  return (
    <>
      <CommentInput
        commentText={commentText}
        setCommentText={setCommentText}
        handleSubmit={handleSubmitComment}
        loading={commentLoading}
      />

      <CommentList
        comments={comments}
        loading={loading}
        handleLike={handleLike}
        handleUnlike={handleUnlike}
        currentUserId={currentUser?.id}
      />

      {commentSuccess && (
        <Alert type="success" message="Comment sent successfully!" duration={5000} />
      )}
      {commentError && (
        <Alert type="error" message={`Error sending comment: ${commentError}`} duration={5000} />
      )}
      {likeSuccess && (
        <Alert type="success" message="Like success!" duration={5000} />
      )}
      {likeError && (
        <Alert type="error" message={`Error like: ${likeError}`} duration={5000} />
      )}
      {unlikeSuccess && (
        <Alert type="success" message="Unlike success!" duration={5000} />
      )}
      {unlikeError && (
        <Alert type="error" message={`Error unlike: ${unlikeError}`} duration={5000} />
      )}
    </>
  )
}
