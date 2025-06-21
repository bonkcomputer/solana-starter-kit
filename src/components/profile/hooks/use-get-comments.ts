'use client'

import { useCallback, useEffect, useState } from 'react'

interface Props {
  profileId: string
}

// This type now directly reflects the data returned from our /api/comments endpoint
export interface PopulatedComment {
    id: string;
    text: string;
    createdAt: string; // Dates are serialized as strings over HTTP
    authorId: string;
    profileId: string;
    tapestryCommentId: string | null; // Can be null for older comments
    author: {
        username: string;
        image: string | null;
    };
    likes: {
        id: string;
        userId: string;
        commentId: string;
    }[];
}

export const useGetComments = ({ profileId }: Props) => {
  const [comments, setComments] = useState<PopulatedComment[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!profileId) return;
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/comments?profileId=${profileId}`, {
        method: 'GET',
      })

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to fetch comments')
      }
      
      const result = await response.json();
      setComments(result)

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return { comments, loading, error, refetch: fetchComments }
}
