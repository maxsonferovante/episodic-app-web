"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react"
import { FiSearch, FiBookOpen, FiClock, FiHome, FiMenu, FiX } from "react-icons/fi"
import { useState } from "react"
import { UserMenu } from "@/components/user-menu"
import { ProfileDialog } from "@/components/profile-dialog"
import { DevCredit } from "@/components/dev-credit"

const navLinks = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/search", label: "Search", icon: FiSearch },
  { href: "/library", label: "Library", icon: FiBookOpen },
  { href: "/history", label: "History", icon: FiClock },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <Flex direction="column" minH="100vh" bg="bg.subtle">
      {/* Navbar — sticky, translucent, hairline border (Vercel header) */}
      <Box
        as="nav"
        position="sticky"
        top={0}
        zIndex={40}
        borderBottomWidth="1px"
        borderColor="border.subtle"
      >
        {/* Accent bar */}
        <Box h={1} w="full" bg="accent.subtle" />

        <Box bg="bg.subtle/80" backdropBlur="md">
          <Flex
            maxW="7xl"
            mx="auto"
            px={{ base: 4, md: 6 }}
            h={16}
            align="center"
            justify="space-between"
          >
            {/* Logo */}
            <HStack gap={2}>
              {isMobile && (
                <IconButton
                  aria-label="Toggle menu"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <FiX /> : <FiMenu />}
                </IconButton>
              )}
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
            </HStack>

            {/* Desktop Nav */}
            {!isMobile && (
              <HStack gap={1}>
                {navLinks.map((link) => {
                  const NavIcon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      style={{ textDecoration: "none" }}
                    >
                      <HStack
                        gap={2}
                        px={3}
                        py={2}
                        rounded="md"
                        color={isActive ? "fg" : "fg.muted"}
                        bg={isActive ? "bg.muted" : "transparent"}
                        _hover={{ bg: "bg.muted", color: "fg" }}
                        transition="backgrounds"
                      >
                        <NavIcon size={16} />
                        <Text fontSize="sm" fontWeight={isActive ? "semibold" : "normal"}>
                          {link.label}
                        </Text>
                      </HStack>
                    </Link>
                  )
                })}
              </HStack>
            )}

            {/* User Menu */}
            <UserMenu onOpenProfile={() => setProfileOpen(true)} />
          </Flex>
        </Box>

        {/* Mobile Menu */}
        {isMobile && mobileOpen && (
          <Box
            borderTopWidth="1px"
            borderColor="border.subtle"
            bg="bg.subtle"
            px={4}
            py={3}
          >
            {navLinks.map((link) => {
              const NavIcon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ textDecoration: "none" }}
                  onClick={() => setMobileOpen(false)}
                >
                  <HStack
                    gap={3}
                    px={3}
                    py={3}
                    rounded="md"
                    color={isActive ? "fg" : "fg.muted"}
                    bg={isActive ? "bg.muted" : "transparent"}
                    _hover={{ bg: "bg.muted", color: "fg" }}
                  >
                    <NavIcon size={18} />
                    <Text fontSize="sm" fontWeight={isActive ? "semibold" : "normal"}>
                      {link.label}
                    </Text>
                  </HStack>
                </Link>
              )
            })}
          </Box>
        )}
      </Box>

      <Box flex={1}>{children}</Box>

      {/* Footer */}
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

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onOpenLibrary={() => router.push("/library")}
      />
    </Flex>
  )
}
