'use client'

import { useState } from 'react'

interface LikeProps {
  userId: string // privyDid of the user liking the comment
  commentId: string // CUID of the comment being liked
  username: string // For Tapestry
  tapestryCommentId: string // For Tapestry
}

export const useCreateLike = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const createLike = async (props: LikeProps) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to like comment')
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { createLike, loading, error, success }
}

export const useDeleteLike = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const deleteLike = async (props: LikeProps) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const response = await fetch('/api/likes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(props),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to unlike comment')
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { deleteLike, loading, error, success }
}
