import { ITokenSearchResult } from "./models/jupiter/jup-api-models"

export const SOL_MINT = 'So11111111111111111111111111111111111111112'
export const BAD_SOL_MINT = 'So11111111111111111111111111111111111111111'
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const BCT_MINT = 'D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk'
export const BCT_TOKEN_DECIMAL = 6

export enum SortOptionsDetails {
  MARKETCAP = 'marketcap',
  VOLUME = 'volume',
  NAME = 'name',
  BALANCE = 'balance',
}


export const DEFAULT_TOKENS: ITokenSearchResult[] = [
  {
    name: 'Solana Social Explorer',
    symbol: 'SSE',
    address: 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump',
    decimals: 6,
    logoURI:
      'https://ipfs.io/ipfs/QmT4fG3jhXv3dcvEVdkvAqi8RjXEmEcLS48PsUA5zSb1RY',
    verified: true,
    market_cap: 7836380.32118586,
    price: 0.007971767374586932,
    volume_24h_usd: 10566433.718458362,
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    verified: true,
    market_cap: 1842335985.249657,
    price: 1,
    volume_24h_usd: 76544935.249657,
  },
  {
    name: 'SOL',
    symbol: 'SOL',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    verified: true,
    market_cap: 47835674523.34,
    price: 109.23,
    volume_24h_usd: 1234567890.34,
  },
  {
    name: 'Jupiter',
    symbol: 'JUP',
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    decimals: 6,
    logoURI: 'https://static.jup.ag/jup/icon.png',
    verified: true,
    market_cap: 2514767005.3796864,
    price: 0.8002922960187652,
    volume_24h_usd: 78987069.65993138,
  },
]
