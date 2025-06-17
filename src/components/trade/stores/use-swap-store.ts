// import { SOL_MINT, BCT_MINT } from '@/utils/constants'
import { create } from 'zustand'
import { SOL_MINT, BCT_MINT } from '../constants'

export interface ISwapInputs {
  inputMint: string
  outputMint: string
  inputAmount: number
}

interface State {
  open: boolean
  inputs: ISwapInputs
  setOpen: (open: boolean) => void
  setInputs: (inputs: ISwapInputs) => void
}

export const useSwapStore = create<State>()((set) => ({
  open: false,
  inputs: {
    inputMint: SOL_MINT,
    outputMint: BCT_MINT,
    inputAmount: 0,
  },
  setOpen: (open) =>
    set(() => ({
      open,
    })),
  setInputs: (inputs: ISwapInputs) =>
    set(() => ({
      inputs: {
        ...inputs,
        inputMint: inputs.inputMint || SOL_MINT,
        outputMint: inputs.outputMint || BCT_MINT,
        inputAmount: inputs.inputAmount || 0,
      },
    })),
}))
