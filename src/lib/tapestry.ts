import { socialfi } from '@/utils/socialfi'

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
