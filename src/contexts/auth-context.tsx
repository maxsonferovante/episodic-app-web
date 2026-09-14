"use client"

import { useCallback, createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"
import {
  googleLogin,
  setTokens,
  clearTokens,
  getAccessToken,
} from "@/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("episodic_user")
    const storedAccess = localStorage.getItem("episodic_access_token")
    const storedRefresh = localStorage.getItem("episodic_refresh_token")
    if (stored && storedAccess && storedRefresh) {
      setUser(JSON.parse(stored))
      setTokens(storedAccess, storedRefresh)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (token: string) => {
    const data = await googleLogin(token)
    setUser(data.user)
    localStorage.setItem("episodic_user", JSON.stringify(data.user))
    localStorage.setItem("episodic_access_token", data.accessToken)
    localStorage.setItem("episodic_refresh_token", data.refreshToken)
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    localStorage.removeItem("episodic_user")
    localStorage.removeItem("episodic_access_token")
    localStorage.removeItem("episodic_refresh_token")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!getAccessToken(),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
