'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Button } from '@/components/common/button'
import { useUpdateUsername } from '@/components/profile/hooks/use-update-username'
import { IUser } from '@/models/profile.models'
import { usePrivy } from '@privy-io/react-auth'
import { Pencil, Check, X, Clock, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Props {
  username: string
  data?: IUser | null
  onUsernameUpdate?: (newUsername: string) => void
}

export function UsernameEditor({ username, data: _data, onUsernameUpdate }: Props) {
  const { mainUsername, walletAddress } = useCurrentWallet()
  const { user } = usePrivy()
  
  // Check ownership by comparing mainUsername, or by checking if the profile data matches the current user
  const isOwner = mainUsername === username || 
                  (_data?.privyDid && user?.id && _data.privyDid === user.id) ||
                  (_data?.solanaWalletAddress && walletAddress && _data.solanaWalletAddress === walletAddress)

  const { 
    updateUsername, 
    checkUsernameEligibility,
    getCurrentUsername,
    usernameInfo,
    loading, 
    error, 
    success,
    optimisticUsername,
    setError,
    setSuccess
  } = useUpdateUsername()
  
  const [newUsername, setNewUsername] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [displayUsername, setDisplayUsername] = useState(username)

  // Listen for username update events
  useEffect(() => {
    const handleUsernameUpdated = (event: CustomEvent) => {
      const { newUsername } = event.detail
      setDisplayUsername(newUsername)
      if (onUsernameUpdate) {
        onUsernameUpdate(newUsername)
      }
    }

    const handleUsernameUpdateFailed = (event: CustomEvent) => {
      const { revertTo } = event.detail
      setDisplayUsername(revertTo)
    }

    const handleUsernameUpdateConfirmed = (event: CustomEvent) => {
      const { newUsername } = event.detail
      setDisplayUsername(newUsername)
    }

    window.addEventListener('username-updated', handleUsernameUpdated as EventListener)
    window.addEventListener('username-update-failed', handleUsernameUpdateFailed as EventListener)
    window.addEventListener('username-update-confirmed', handleUsernameUpdateConfirmed as EventListener)

    return () => {
      window.removeEventListener('username-updated', handleUsernameUpdated as EventListener)
      window.removeEventListener('username-update-failed', handleUsernameUpdateFailed as EventListener)
      window.removeEventListener('username-update-confirmed', handleUsernameUpdateConfirmed as EventListener)
    }
  }, [onUsernameUpdate])

  // Update display username when optimistic username changes
  useEffect(() => {
    const currentUsername = getCurrentUsername()
    if (currentUsername) {
      setDisplayUsername(currentUsername)
    }
  }, [getCurrentUsername])

  // Check eligibility when component mounts or when editing starts
  useEffect(() => {
    if (isEditing && !usernameInfo && isOwner) {
      checkUsernameEligibility()
    }
  }, [isEditing, usernameInfo, checkUsernameEligibility, isOwner])

  const handleStartEdit = () => {
    setNewUsername(displayUsername)
    setIsEditing(true)
    setError(null)
    setSuccess(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setNewUsername('')
    setError(null)
    setSuccess(false)
  }

  const handleSaveUsername = async () => {
    if (newUsername === displayUsername) {
      setIsEditing(false)
      return
    }

    const success = await updateUsername(newUsername)
    if (success) {
      setIsEditing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
    setNewUsername(value)
    setError(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOwner) {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-600">Username</p>
        <p className="text-lg font-semibold">@{displayUsername}</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-600 mb-2">Username</p>
      
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">@</span>
            <input
              type="text"
              className="border-b border-muted-light p-2 flex-1 outline-0 text-lg font-semibold"
              value={newUsername}
              placeholder="Enter new username"
              onChange={handleInputChange}
              maxLength={20}
              disabled={loading}
            />
          </div>
          
          {/* Username validation feedback */}
          <div className="text-sm text-gray-500">
            <p>• 3-20 characters</p>
            <p>• Lowercase letters and numbers only</p>
            <p>• Can be changed once per week</p>
          </div>

          {/* Character count */}
          <div className="text-sm text-gray-400">
            {newUsername.length}/20 characters
          </div>

          {/* Username eligibility info */}
          {usernameInfo && !usernameInfo.canChange && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start space-x-2">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-yellow-800">
                <p className="font-medium">Username change limit reached</p>
                <p className="text-sm">
                  You can change your username again on {usernameInfo.nextAllowedChange ? formatDate(usernameInfo.nextAllowedChange) : 'N/A'} 
                  ({usernameInfo.daysRemaining} day(s) remaining)
                </p>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-red-800">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success display */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-green-800">
                <p className="font-medium">Success!</p>
                <p className="text-sm">Username updated successfully</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              className="!w-20 justify-center"
              onClick={handleCancelEdit}
              disabled={loading}
              variant="ghost"
            >
              <X size={16} className="mr-1" />
              Cancel
            </Button>
            <Button
              className="!w-20 justify-center"
              type="submit"
              variant="secondary"
              onClick={handleSaveUsername}
              disabled={loading || !newUsername || newUsername === displayUsername || (usernameInfo?.canChange === false)}
            >
              {loading ? (
                '...'
              ) : (
                <>
                  <Check size={16} className="mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <p className="text-lg font-semibold">
            @{displayUsername}
            {optimisticUsername && (
              <span className="ml-2 text-sm text-blue-600 font-normal">(updating...)</span>
            )}
          </p>
          <Button onClick={handleStartEdit} variant="ghost">
            <Pencil size={16} />
          </Button>
        </div>
      )}

      {/* Last change info (when not editing) */}
      {!isEditing && usernameInfo && usernameInfo.lastUsernameChange && (
        <div className="mt-2 text-xs text-gray-500">
          Last changed: {formatDate(usernameInfo.lastUsernameChange)}
          {!usernameInfo.canChange && (
            <span className="ml-2">
              (Next change available in {usernameInfo.daysRemaining} day(s))
            </span>
          )}
        </div>
      )}
    </div>
  )
} 