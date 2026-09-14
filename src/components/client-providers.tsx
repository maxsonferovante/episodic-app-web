"use client"

import dynamic from "next/dynamic"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

const Provider = dynamic(
  () => import("@/components/ui/provider").then((m) => m.Provider),
  { ssr: false },
)

const GoogleProvider = dynamic(
  () => import("@/components/google-provider").then((m) => m.GoogleProvider),
  { ssr: false },
)

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <GoogleProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </GoogleProvider>
    </Provider>
  )
}
