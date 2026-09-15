"use client"

import Link from "next/link"
import {
  Box,
  Container,
  Flex,
  HStack,
  Heading,
  Icon,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react"
import { FiArrowLeft } from "react-icons/fi"
import { DevCredit } from "@/components/dev-credit"

interface LegalLayoutProps {
  title: string
  updatedAt: string
  children: React.ReactNode
}

/** Public shell for legal pages (no auth required). */
export function LegalLayout({ title, updatedAt, children }: LegalLayoutProps) {
  return (
    <Flex direction="column" minH="100vh" bg="bg.subtle">
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={40}
        borderBottomWidth="1px"
        borderColor="border.subtle"
        bg="bg.subtle/80"
        backdropBlur="md"
      >
        <Flex
          maxW="3xl"
          mx="auto"
          px={{ base: 4, md: 6 }}
          h={16}
          align="center"
          justify="space-between"
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <HStack gap={2}>
              <Image
                src="/logo.svg"
                alt="Episodic"
                boxSize={8}
                rounded="lg"
                objectFit="contain"
              />
              <Text fontSize="lg" fontWeight="bold" color="fg" letterSpacing="tight">
                Episodic
              </Text>
            </HStack>
          </Link>
          <Link href="/" style={{ textDecoration: "none" }}>
            <HStack gap={1.5} color="fg.muted" _hover={{ color: "fg" }} transition="color">
              <Icon as={FiArrowLeft} boxSize={4} />
              <Text fontSize="sm">Back</Text>
            </HStack>
          </Link>
        </Flex>
      </Box>

      <Box as="main" flex={1} py={{ base: 8, md: 14 }} px={{ base: 4, md: 6 }}>
        <Container maxW="3xl" px={0}>
          <Heading size="2xl" letterSpacing="tight" mb={1}>
            {title}
          </Heading>
          <Text fontSize="sm" color="fg.muted" mb={8}>
            Last updated: {updatedAt}
          </Text>
          <VStack align="stretch" gap={7}>
            {children}
          </VStack>
        </Container>
      </Box>

      <Box
        as="footer"
        bg="bg.muted"
        borderTopWidth="1px"
        borderColor="border.subtle"
        py={4}
        px={6}
      >
        <Flex direction="column" align="center" gap={2}>
          <Text fontSize="xs" color="fg.muted" fontFamily="mono">
            Episodic
          </Text>
          <DevCredit />
        </Flex>
      </Box>
    </Flex>
  )
}

interface LegalSectionProps {
  title: string
  children: React.ReactNode
}

/** A titled block of body copy within a legal page. */
export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <Box>
      <Heading size="sm" mb={2}>
        {title}
      </Heading>
      <VStack align="stretch" gap={3} fontSize="sm" color="fg.muted" lineHeight="relaxed">
        {children}
      </VStack>
    </Box>
  )
}

export default LegalLayout
