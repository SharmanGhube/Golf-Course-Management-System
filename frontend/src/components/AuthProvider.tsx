'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuthStore } from '@/lib/auth'
import { authAPI } from '@/lib/api'

interface AuthContextType {
  // Context methods can be added here if needed
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { token, setAuth, logout } = useAuthStore()

  useEffect(() => {
    // Verify token on app load
    const verifyToken = async () => {
      if (token) {
        try {
          const user = await authAPI.getProfile()
          setAuth(user, token)
        } catch (error) {
          console.error('Token verification failed:', error)
          logout()
        }
      }
    }

    verifyToken()
  }, [token, setAuth, logout])

  const value: AuthContextType = {
    // Add context values here if needed
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
