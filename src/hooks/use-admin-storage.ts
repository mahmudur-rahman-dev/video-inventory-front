import { useLocalStorage } from "./use-local-storage"

const ADMIN_STORAGE_PREFIX = "admin_"

export function useAdminStorage<T>(key: string, initialValue: T): [T, (value: T) => void, () => void] {
  const fullKey = `${ADMIN_STORAGE_PREFIX}${key}`
  const [value, setValue] = useLocalStorage<T>(fullKey, initialValue)

  const clearValue = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(fullKey)
      setValue(initialValue)
    }
  }

  return [value, setValue, clearValue]
}

export function clearAllAdminStorage() {
  if (typeof window === "undefined") return

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(ADMIN_STORAGE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}