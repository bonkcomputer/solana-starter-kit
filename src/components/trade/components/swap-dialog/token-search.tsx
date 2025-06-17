'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TokenSearchHeader } from "./token-search-header"
import { TokenList } from "./token-list"
import { useTokenSearch } from "../../hooks/use-token-search"
import { ITokenInfo, ITokenSearchProps, ITokenSearchResult } from "../../models/jupiter/jup-api-models"

export function TokenSearch({
  openModal,
  onSelect,
  onClose,
}: ITokenSearchProps) {
  const {
    searchQuery,
    searchResults,
    isLoading,
    error,
    verifiedOnly,
    sortOptions,
    sortBy,
    setSearchQuery,
    setVerifiedOnly,
    setSortBy,
  } = useTokenSearch()

  const handleSelect = (token: ITokenSearchResult) => {
    const selectedToken: ITokenInfo = {
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logoURI: token.logoURI,
    }
    onSelect(selectedToken)
    onClose()
  }

  return (
    <Dialog open={openModal} onOpenChange={onClose}>
      <DialogContent className="max-w-lg flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
          <DialogDescription>
            Search for a token to swap or select one from the list below.
          </DialogDescription>
          <TokenSearchHeader
            searchQuery={searchQuery}
            verifiedOnly={verifiedOnly}
            sortOptions={sortOptions}
            setSearchQuery={setSearchQuery}
            setVerifiedOnly={setVerifiedOnly}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          <TokenList
            isLoading={isLoading}
            error={error}
            searchQuery={searchQuery}
            searchResults={searchResults}
            verifiedOnly={verifiedOnly}
            sortBy={sortBy}
            onSelect={handleSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
