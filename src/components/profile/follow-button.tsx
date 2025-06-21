'use client'

import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { LoadCircle } from '@/components/common/load-circle'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { useFollowUser } from './hooks/use-follow-user'
import { useGetFollowerState } from './hooks/use-get-follower-state'
import { useGetProfileInfo } from './hooks/use-get-profile-info'
import { useUnfollowUser } from './hooks/use-unfollow-user'
import { usePrivy } from '@privy-io/react-auth'

interface Props {
  username: string // The username of the profile being viewed
}

export function FollowButton({ username }: Props) {
  const { user: currentUser } = usePrivy();
  const { mainUsername: currentUserUsername, loadingMainUsername } = useCurrentWallet();
  
  // Get the profile info for the user being viewed
  const { profile: viewedProfile, loading: loadingViewedProfile } = useGetProfileInfo(username);
  
  const { followUser, loading: followLoading, error: followError, success: followSuccess } = useFollowUser();
  const { unfollowUser, loading: unfollowLoading, error: unfollowError, success: unfollowSuccess } = useUnfollowUser();

  const { isFollowing, loading: followStateLoading, error: followStateError } = useGetFollowerState({
    followerId: currentUser?.id || '',
    followingId: viewedProfile?.privyDid || '',
  });

  const handleFollowToggleClicked = async () => {
    if (currentUser?.id && viewedProfile?.privyDid && currentUserUsername && viewedProfile?.username) {
      if (isFollowing) {
        await unfollowUser({
            followerPrivyDid: currentUser.id,
            followeePrivyDid: viewedProfile.privyDid,
            followerUsername: currentUserUsername,
            followeeUsername: viewedProfile.username,
        });
      } else {
        await followUser({
            followerPrivyDid: currentUser.id,
            followeePrivyDid: viewedProfile.privyDid,
            followerUsername: currentUserUsername,
            followeeUsername: viewedProfile.username,
        });
      }
    } else {
      console.error('Missing user information for follow action');
    }
  };

  const loading = loadingMainUsername || loadingViewedProfile || followLoading || unfollowLoading || followStateLoading;
  const error = followError || unfollowError || followStateError;
  const success = followSuccess || unfollowSuccess;

  if (!currentUser?.id || currentUserUsername === username) {
    return null;
  }

  return (
    <>
      {loading ? (
        <span>
          <LoadCircle />
        </span>
      ) : (
        <Button onClick={handleFollowToggleClicked} disabled={loading}>
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      )}

      {success && (
        <Alert
          type="success"
          message="Action successful!"
          duration={5000}
        />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          duration={5000}
        />
      )}
    </>
  )
}
