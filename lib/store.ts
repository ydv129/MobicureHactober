import { create } from "zustand"

type Store = {
	results: Record<string, unknown>
	setResult: (key: string, value: unknown) => void
}

export const useStore = create<Store>((set) => ({
	results: {},
	setResult: (key, value) => set((state) => ({ results: { ...state.results, [key]: value } })),
}))
