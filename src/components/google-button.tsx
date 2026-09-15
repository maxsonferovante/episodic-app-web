"use client"

import { GoogleLogin } from "@react-oauth/google"
import { Box } from "@chakra-ui/react"

interface GoogleButtonProps {
  onSuccess: (credential: string) => void
  onError?: () => void
}

/**
 * Google sign-in using Google Identity Services' own rendered button, styled
 * as a pill. Everything (iframes, popup, id_token) is handled by Google, so
 * there is no overlay hack.
 */
export function GoogleButton({ onSuccess, onError }: GoogleButtonProps) {
  return (
    <Box w="full" display="flex" justifyContent="center">
      <GoogleLogin
        shape="pill"
        theme="outline"
        size="large"
        text="continue_with"
        logo_alignment="left"
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
  )
}

export default GoogleButton
