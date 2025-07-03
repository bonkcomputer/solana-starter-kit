import { socialfi } from '@/utils/socialfi'

// Profile Management Functions
export const getFollowers = async ({ username }: { username: string }) => {
  try {
    const response = await socialfi.profiles.followersList({
      id: username,
      apiKey: process.env.TAPESTRY_API_KEY || '',
    })
    return response
  } catch (error: any) {
    console.warn('Tapestry API error for followers:', error.message || error)
    // Return empty result instead of throwing
    return { profiles: [], page: 0, pageSize: 0 }
  }
}

export const getFollowing = async ({ username }: { username: string }) => {
  try {
    const response = await socialfi.profiles.followingList({
      id: username,
      apiKey: process.env.TAPESTRY_API_KEY || '',
    })
    return response
  } catch (error: any) {
    console.warn('Tapestry API error for following:', error.message || error)
    // Return empty result instead of throwing
    return { profiles: [], page: 0, pageSize: 0 }
  }
}

// Direct Profile Reading from Tapestry
export const getTapestryProfile = async ({ username }: { username: string }) => {
  try {
    const response = await socialfi.profiles.profilesDetail({
      id: username,
      apiKey: process.env.TAPESTRY_API_KEY || '',
    })
    return response
  } catch (error: any) {
    console.warn('Tapestry API error for profile:', error.message || error)
    return null
  }
}

// Enhanced Profile Creation with Execution Options
export const createTapestryProfile = async ({
  walletAddress,
  username,
  bio,
  image,
  execution = 'FAST_UNCONFIRMED'
}: {
  walletAddress: string
  username: string
  bio?: string
  image?: string
  execution?: 'FAST_UNCONFIRMED' | 'QUICK_SIGNATURE' | 'CONFIRMED_AND_PARSED'
}) => {
  try {
    const response = await socialfi.profiles.findOrCreateCreate(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
      },
      {
        walletAddress,
        username,
        bio,
        image,
        blockchain: 'SOLANA',
        execution,
      }
    )
    return response
  } catch (error: any) {
    console.error('Tapestry profile creation error:', error.message || error)
    throw error
  }
}

// Enhanced Profile Update
export const updateTapestryProfile = async ({
  username,
  bio,
  image,
  properties
}: {
  username: string
  bio?: string
  image?: string
  properties?: Array<{ key: string; value: string }>
}) => {
  try {
    const updateData: any = {}
    if (bio !== undefined) updateData.bio = bio
    if (image !== undefined) updateData.image = image
    if (properties) updateData.properties = properties

    const response = await socialfi.profiles.profilesUpdate(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
        id: username,
      },
      updateData
    )
    return response
  } catch (error: any) {
    console.error('Tapestry profile update error:', error.message || error)
    throw error
  }
}

// Get Suggested Profiles
export const getSuggestedProfiles = async ({ walletAddress }: { walletAddress: string }) => {
  try {
    const response = await socialfi.profiles.suggestedDetail({
      apiKey: process.env.TAPESTRY_API_KEY || '',
      identifier: walletAddress,
    })
    return response
  } catch (error: any) {
    console.warn('Tapestry API error for suggested profiles:', error.message || error)
    return { profiles: [] }
  }
}

// Get Token Owners (for discovering users who hold specific tokens)
export const getTokenOwners = async ({ tokenAddress }: { tokenAddress: string }) => {
  try {
    const response = await socialfi.profiles.tokenOwnersDetail({
      apiKey: process.env.TAPESTRY_API_KEY || '',
      tokenAddress,
    })
    return response
  } catch (error: any) {
    console.warn('Tapestry API error for token owners:', error.message || error)
    return { profiles: [] }
  }
}

// Get Identity Information
export const getTapestryIdentity = async ({ walletAddress }: { walletAddress: string }) => {
  try {
    const response = await socialfi.identities.identitiesDetail({
      id: walletAddress,
      apiKey: process.env.TAPESTRY_API_KEY || '',
    })
    return response
  } catch (error: any) {
    console.warn('Tapestry API error for identity:', error.message || error)
    return null
  }
}

// Follow/Unfollow Functions
export const followUser = async ({ 
  followerUsername, 
  followeeUsername 
}: { 
  followerUsername: string
  followeeUsername: string 
}) => {
  try {
    const response = await socialfi.followers.postFollowers(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
      },
      {
        startId: followerUsername,
        endId: followeeUsername,
      }
    )
    return response
  } catch (error: any) {
    console.error('Tapestry follow error:', error.message || error)
    throw error
  }
}

export const unfollowUser = async ({ 
  followerUsername, 
  followeeUsername 
}: { 
  followerUsername: string
  followeeUsername: string 
}) => {
  try {
    const response = await socialfi.followers.removeCreate(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
      },
      {
        startId: followerUsername,
        endId: followeeUsername,
      }
    )
    return response
  } catch (error: any) {
    console.error('Tapestry unfollow error:', error.message || error)
    throw error
  }
}

// Check Follow State
export const getFollowState = async ({ 
  followerUsername, 
  followeeUsername 
}: { 
  followerUsername: string
  followeeUsername: string 
}) => {
  try {
    const response = await socialfi.followers.stateList({
      apiKey: process.env.TAPESTRY_API_KEY || '',
      startId: followerUsername,
      endId: followeeUsername,
    })
    return response
  } catch (error: any) {
    console.warn('Tapestry follow state error:', error.message || error)
    return null
  }
}

// Comments Functions
export const createTapestryComment = async ({
  authorUsername,
  targetUsername,
  text
}: {
  authorUsername: string
  targetUsername: string
  text: string
}) => {
  try {
    const response = await socialfi.comments.commentsCreate(
      { apiKey: process.env.TAPESTRY_API_KEY || '' },
      {
        profileId: authorUsername,
        targetProfileId: targetUsername,
        text,
      }
    )
    return response
  } catch (error: any) {
    console.error('Tapestry comment creation error:', error.message || error)
    throw error
  }
}

export const getTapestryCommentsAndLikes = async ({
  targetUsername,
}: {
  targetUsername: string;
}) => {
  try {
    const response = await socialfi.comments.commentsList({
      apiKey: process.env.TAPESTRY_API_KEY || '',
      targetProfileId: targetUsername,
    });
    // The SDK should return a list of comments, each with likes.
    // If the structure is different, this may need adjustment.
    return response.comments || [];
  } catch (error: any) {
    console.warn('Tapestry get comments error:', error.message || error);
    return []; // Return empty array on error to prevent crashes
  }
};

// Likes Functions
export const createTapestryLike = async ({
  username,
  tapestryCommentId
}: {
  username: string
  tapestryCommentId: string
}) => {
  try {
    const response = await socialfi.likes.likesCreate(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
        nodeId: tapestryCommentId,
      },
      { startId: username }
    )
    return response
  } catch (error: any) {
    console.error('Tapestry like creation error:', error.message || error)
    throw error
  }
}

export const deleteTapestryLike = async ({
  username,
  tapestryCommentId
}: {
  username: string
  tapestryCommentId: string
}) => {
  try {
    const response = await socialfi.likes.likesDelete(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
        nodeId: tapestryCommentId,
      },
      {
        startId: username,
      }
    )
    return response
  } catch (error: any) {
    console.error('Tapestry like deletion error:', error.message || error)
    throw error
  }
}

export const updateTapestryUsername = async ({
  oldUsername,
  newUsername
}: {
  oldUsername: string
  newUsername: string
}) => {
  try {
    const response = await socialfi.profiles.profilesUpdate(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
        id: oldUsername,
      },
      {
        username: newUsername,
      },
    )
    return response
  } catch (error: any) {
    console.error('Tapestry username update error:', error.message || error)
    throw error
  }
}
