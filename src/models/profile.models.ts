import { IPaginatedResponse } from '@/models/common.models'

export interface ISocialCounts {
  followers: number
  following: number
}

export interface IProfileResponse {
  walletAddress?: string
  socialCounts: ISocialCounts
  profile: IProfile
  namespace: INamespace
}

export interface IProfile {
  id: string
  namespace: string
  created_at: number
  username: string
  bio?: string | null
  image?: string | null
}

export interface INamespace {
  id: number
  name: string
  readableName: string | null
  faviconURL: string | null
  created_at: string
  updatedAt: string
  isDefault: boolean
  team_id: number
}

export type IProfileList = {
  profile: IProfile
  wallet: {
    address: string
  }
  namespace: INamespace
}
export interface IGetSocialResponse extends IPaginatedResponse {
  profiles: IProfile[]
}

export interface IGetFollowersStateResponse {
  isFollowing: boolean
}
export interface ISuggestedProfile {
  namespaces: {
    name: string
    readableName: string
    faviconURL: string
  }[]
  profile: {
    blockchain: string
    namespace: string
    id: string
    username: string
    image: string
  }
  contact: {
    id: string
    type: string
  }
  wallet: { address: string }
}

export interface ISearch {
  profile: IProfile
  socialCounts: ISocialCounts
  walletAddress: string
  namespaces: INamespace
}

export interface IIdentitiesResponse {
  identities: IIdentity[]
  page: number
  pageSize: number
  totalCount: number
}

export interface IIdentity {
  profiles: IProfileList[]
  wallet: {
    address: string
  }
}

export interface IWallet {
  id: string
  created_at: number
  blockchain: string
  wallet_type: string
}

export interface IProfileWithWallets extends IProfile {
  wallets: IWallet[]
}

export interface IProfileTokenDetails {
  profiles: IProfileWithWallets[]
}

export interface IUser {
    privyDid: string;
    createdAt: string; // ISO date string
    username: string;
    bio: string | null;
    image: string | null;
    solanaWalletAddress: string | null;
    embeddedWalletAddress: string | null;
}
