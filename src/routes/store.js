
import { persisted } from 'svelte-local-storage-store'

export const preferences = persisted("preferences", {
    dark: false,
    names: false,
})