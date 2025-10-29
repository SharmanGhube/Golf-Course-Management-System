import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  role: 'admin' | 'staff' | 'member' | 'customer'
  membership_type: 'premium' | 'standard' | 'basic'
  membership_expiry?: string
  handicap?: number
  avatar_url?: string
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
