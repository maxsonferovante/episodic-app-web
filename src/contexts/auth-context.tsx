"use client"

import { useCallback, createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import {
  googleLogin,
  setTokens,
  clearTokens,
  getAccessToken,
  setSessionExpiredHandler,
  USER_KEY,
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
  const router = useRouter()

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem("episodic_access_token")
    localStorage.removeItem("episodic_refresh_token")
  }, [])

  // Session-expired middleware: when api.ts can no longer renew the access
  // token (refresh missing/expired/rejected), tear down locally and send the
  // user to /login with a visible reason instead of empty screens.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      logout()
      if (!window.location.pathname.startsWith("/login")) {
        router.push("/login?expired=1")
      }
    })
    return () => setSessionExpiredHandler(null)
  }, [logout, router])

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY)
    const storedAccess = localStorage.getItem("episodic_access_token")
    const storedRefresh = localStorage.getItem("episodic_refresh_token")
    if (stored && storedAccess && storedRefresh) {
      setUser(JSON.parse(stored))
      // setTokens also (re)schedules the proactive refresh, so a returning
      // tab renews an idle-expired access token on app open.
      setTokens(storedAccess, storedRefresh)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (token: string) => {
    const data = await googleLogin(token)
    setUser(data.user)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    // setTokens persists the pair and schedules the proactive refresh.
    setTokens(data.accessToken, data.refreshToken)
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
