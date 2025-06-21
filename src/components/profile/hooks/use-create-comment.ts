'use client'

import { useCallback, useState } from 'react'

interface Props {
  authorId: string;        // privyDid of the comment author
  profileId: string;       // privyDid of the profile being commented on
  text: string;
  authorUsername: string;  // For Tapestry
  profileUsername: string; // For Tapestry
}

export const useCreateComment = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const createComment = useCallback(
    async ({ authorId, profileId, text, authorUsername, profileUsername }: Props) => {
      setLoading(true)
      setError(null)
      setSuccess(false)

      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ authorId, profileId, text, authorUsername, profileUsername }),
        })

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to create comment')
        }

        setSuccess(true)
        return await response.json();
        
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { createComment, loading, error, success }
}
