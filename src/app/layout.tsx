import type { Metadata } from "next"
import { ClientProviders } from "@/components/client-providers"

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
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
