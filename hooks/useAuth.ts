import { useEffect } from 'react'
import { useAuthStore, User } from '../store/authStore'

export default function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)
  const loadUser = useAuthStore((s) => s.loadUser)

  useEffect(() => {
    if (isLoading) loadUser()
  }, [])

  const signOut = async () => {
    await clearUser()
  }

  const updateUser = async (patch: Partial<User>) => {
    const current = useAuthStore.getState().user
    if (!current) return
    const updated = { ...current, ...patch }
    await setUser(updated as User)
    return updated
  }

  return { user, isLoading, setUser, clearUser, loadUser, signOut, updateUser }
}
