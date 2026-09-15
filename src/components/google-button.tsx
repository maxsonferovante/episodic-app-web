"use client"

import { GoogleLogin } from "@react-oauth/google"
import { Box, Flex, Text } from "@chakra-ui/react"

/**
 * Google sign-in button styled after the Alpaca APP button: a full-width
 * pill with the four-colour Google "G" and a label.
 *
 * Google's Identity Services only issues the `id_token` the backend needs
 * through its own rendered button, so we keep the real <GoogleLogin> on top
 * (transparent, full-bleed) and paint our branded pill underneath. Clicks
 * land on Google's button; the visual is ours.
 */
interface GoogleButtonProps {
  onSuccess: (credential: string) => void
  onError?: () => void
  label?: string
  /** Pill height. `lg` matches the login card CTA. */
  size?: "md" | "lg"
}

export function GoogleIcon({ boxSize = 4 }: { boxSize?: number }) {
  return (
    <svg
      width={boxSize * 4}
      height={boxSize * 4}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export function GoogleButton({
  onSuccess,
  onError,
  label = "Continue with Google",
  size = "lg",
}: GoogleButtonProps) {
  const height = size === "lg" ? 12 : 10

  return (
    <Box position="relative" w="full" h={height}>
      {/* Branded pill (visual only) */}
      <Flex
        aria-hidden="true"
        align="center"
        justify="center"
        gap={3}
        h="full"
        w="full"
        rounded="full"
        bg="fg"
        color="bg"
        fontWeight="semibold"
        fontSize="sm"
        shadow="xs"
        transition="opacity 0.15s"
        _hover={{ opacity: 0.9 }}
      >
        <GoogleIcon boxSize={4} />
        <Text>{label}</Text>
      </Flex>

      {/* Real Google button — stretched over the pill, invisible but clickable */}
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        opacity={0}
        overflow="hidden"
        cursor="pointer"
        css={{
          "& > div": { width: "100% !important", height: "100% !important" },
          "& iframe": { width: "100% !important", height: "100% !important" },
        }}
      >
        <GoogleLogin
          shape="pill"
          size="large"
          text="continue_with"
          width="400"
          onSuccess={(response) => {
            if (response.credential) {
              onSuccess(response.credential)
            } else {
              onError?.()
            }
          }}
          onError={onError}
        />
      </Box>
    </Box>
  )
}

export default GoogleButton
