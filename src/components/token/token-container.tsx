'use client'

import { TokenInfos } from '@/components/token/token-infos'

export function TokenContainer() {
  const tokenList = [
    'D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk',
    'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump',
    '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC',
    '61V8vBaqAGMpgDQi4JcAwo1dmBGHsyhzodcPqnEVpump',
    '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    'EqQFU4AoRVKJjQrpshmp89YxHAgNecCpJdMS8PJLpump',
    '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
    'HNg5PYJmtqcmzXrv6S9zP1CDKk5BgDuyFBxbvNApump',
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {tokenList.map((id, index) => (
        <TokenInfos key={index} id={id} />
      ))}
    </div>
  )
}
