"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  Box,
  Center,
  Heading,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react"
import { GoogleLogin } from "@react-oauth/google"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="lg" />
      </Center>
    )
  }

  if (isAuthenticated) return null

  return (
    <Center minH="100vh" bg="bg.muted">
      <Box
        bg="bg.default"
        p={8}
        rounded="xl"
        shadow="lg"
        w="full"
        maxW="sm"
        mx={4}
      >
        <VStack gap={6}>
          <VStack gap={2}>
            <Heading size="2xl" letterSpacing="tight">
              Episodic
            </Heading>
            <Text color="fg.muted" textAlign="center">
              Track your TV series progress
            </Text>
          </VStack>
          <Box>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  login(credentialResponse.credential).then(() => {
                    router.push("/")
                  })
                }
              }}
              onError={() => {
                console.error("Google login failed")
              }}
            />
          </Box>
        </VStack>
      </Box>
    </Center>
  )
}
