"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Box,
  Center,
  Heading,
  Text,
  VStack,
  Spinner,
  Button,
  Icon,
  Flex,
  Grid,
  Badge,
} from "@chakra-ui/react"
import { GoogleButton } from "@/components/google-button"
import { DevCredit } from "@/components/dev-credit"
import { useAuth } from "@/contexts/auth-context"
import { FiTv, FiClock, FiBookOpen, FiStar, FiChevronDown } from "react-icons/fi"

const faqItems = [
  {
    q: "How tracking works",
    a: "Search for your favourite series, add them to your library and mark episodes as watched. The app computes your progress and suggests the next episode automatically.",
  },
  {
    q: "Data privacy",
    a: "We use Google OAuth only to identify you and associate your progress. We never share your data with third parties.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Box borderBottomWidth="1px" borderColor="border.subtle" pt={2}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        w="full"
        justifyContent="space-between"
        fontWeight="semibold"
        fontSize="xs"
        px={0}
      >
        {q}
        <Icon
          as={FiChevronDown}
          transform={open ? "rotate(180deg)" : "none"}
          transition="transform 0.2s"
        />
      </Button>
      {open && (
        <Text fontSize="xs" color="fg.muted" py={2} pr={4}>
          {a}
        </Text>
      )}
    </Box>
  )
}

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
    <Box minH="100vh" bg="bg.subtle">
      <Flex
        direction="column"
        justify="center"
        gap={{ base: 8, md: 10 }}
        maxW="5xl"
        mx="auto"
        px={{ base: 6, md: 10 }}
        py={{ base: 12, md: 16 }}
        minH="100vh"
      >
        {/* Header (above both columns) */}
        <VStack align="start" gap={2}>
          <Heading size="3xl" letterSpacing="tight">
            Episodic
          </Heading>
          <Text color="fg.muted" fontSize="sm" fontWeight="medium">
            Track your TV series progress
          </Text>
        </VStack>

        {/* Equal-height columns — the two cards align top and bottom */}
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          gap={{ base: 8, md: 10 }}
          alignItems="stretch"
        >
          {/* Presentation card */}
          <Box
            p={6}
            rounded="2xl"
            borderWidth="1px"
            borderColor="border.subtle"
            bg="bg"
            shadow="sm"
            h="full"
            display="flex"
            flexDirection="column"
          >
            <Text fontSize="sm" fontWeight="semibold" mb={3}>
              Your personal series catalogue, organised and always up to date.
            </Text>
            <VStack align="start" gap={3} mt={4}>
              {[
                { icon: FiTv, text: "Search any series in the catalogue" },
                { icon: FiBookOpen, text: "Add it to your personal library" },
                { icon: FiClock, text: "Mark episodes as watched" },
                { icon: FiStar, text: "Track progress per season and series" },
              ].map(({ icon, text }) => (
                <Flex key={text} gap={2} align="center" fontSize="xs" color="fg.muted">
                  <Icon as={icon} color="fg.accent" />
                  <Text>{text}</Text>
                </Flex>
              ))}
            </VStack>

            <Box mt="auto" pt={4} borderTopWidth="1px" borderColor="border.subtle">
              {faqItems.map((item) => (
                <FaqItem key={item.q} {...item} />
              ))}
            </Box>
          </Box>

          {/* Login card */}
          <Flex
            bg="bg"
            rounded="3xl"
            shadow="lg"
            borderWidth="1px"
            borderColor="border.subtle"
            overflow="hidden"
            direction="column"
            h="full"
          >
            <Box h={1.5} w="full" bg="accent" />
            <VStack flex={1} justify="center" p={8} gap={6}>
              <Center
                w={14}
                h={14}
                rounded="full"
                bg="bg.muted"
                shadow="sm"
              >
                <Icon as={FiTv} boxSize={6} color="fg.accent" />
              </Center>
              <VStack gap={1}>
                <Heading size="lg">Sign in</Heading>
                <Text fontSize="xs" color="fg.muted">
                  Sign in with your Google account to continue.
                </Text>
              </VStack>
              <Box w="full">
                <GoogleButton
                  onSuccess={(credential) => {
                    login(credential).then(() => {
                      router.push("/")
                    })
                  }}
                  onError={() => {
                    console.error("Google login failed")
                  }}
                />
              </Box>
              <VStack gap={2} pt={1}>
                <Text fontSize="xs" color="fg.muted" fontFamily="mono">
                  Episodic
                </Text>
                <DevCredit size="md" />
              </VStack>
            </VStack>
          </Flex>

          {/* Badge under the left column */}
          <Badge
            gridColumn={{ md: "1" }}
            justifySelf="flex-start"
            alignSelf="start"
            colorPalette="green"
            variant="subtle"
            fontSize="xs"
          >
            ✓ Unlimited library · Automatic progress
          </Badge>
        </Grid>
      </Flex>
    </Box>
  )
}
