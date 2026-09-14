"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Spinner, Center } from "@chakra-ui/react"
import { useAuth } from "@/contexts/auth-context"
import { AppShell } from "@/components/app-shell"

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="lg" color="fg.muted" />
      </Center>
    )
  }

  if (!isAuthenticated) return null

  return <AppShell>{children}</AppShell>
}
