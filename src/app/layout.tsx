import type { Metadata } from "next"
import { Provider } from "@/components/ui/provider"
import { GoogleProvider } from "@/components/google-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Episodic",
  description: "Track your TV series progress",
}

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
          <GoogleProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </GoogleProvider>
        </Provider>
      </body>
    </html>
  )
}
