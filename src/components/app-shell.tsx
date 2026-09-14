"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  useBreakpointValue,
  Icon,
} from "@chakra-ui/react"
import { FiSearch, FiBookOpen, FiClock, FiHome, FiMenu, FiX } from "react-icons/fi"
import { useState } from "react"
import { UserMenu } from "@/components/user-menu"

const navLinks = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/search", label: "Search", icon: FiSearch },
  { href: "/library", label: "Library", icon: FiBookOpen },
  { href: "/history", label: "History", icon: FiClock },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Flex direction="column" minH="100vh">
      {/* Navbar com backdrop-blur e accent bar */}
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

        <Box
          bg="bg.default/80"
          backdropBlur="md"
        >
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
                  <Box
                    bg="accent.subtle"
                    color="fg.accent"
                    p={1.5}
                    rounded="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    shadow="xs"
                  >
                    <Icon as={FiHome} boxSize={4} />
                  </Box>
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color="fg.default"
                    letterSpacing="tight"
                  >
                    Episodic
                  </Text>
                </HStack>
              </Link>
            </HStack>

            {/* Desktop Nav */}
            {!isMobile && (
              <HStack gap={1}>
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
                      <HStack
                        gap={2}
                        px={3}
                        py={2}
                        rounded="md"
                        color={isActive ? "fg.default" : "fg.muted"}
                        bg={isActive ? "bg.muted" : "transparent"}
                        _hover={{ bg: "bg.muted" }}
                        transition="backgrounds"
                      >
                        <Icon size={16} />
                        <Text fontSize="sm" fontWeight={isActive ? "medium" : "normal"}>
                          {link.label}
                        </Text>
                      </HStack>
                    </Link>
                  )
                })}
              </HStack>
            )}

            {/* User Menu */}
            <UserMenu />
          </Flex>
        </Box>

        {/* Mobile Menu */}
        {isMobile && mobileOpen && (
          <Box borderTopWidth="1px" borderColor="border.subtle" px={4} pb={4}>
            {navLinks.map((link) => {
              const Icon = link.icon
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
                    color={isActive ? "fg.default" : "fg.muted"}
                    bg={isActive ? "bg.muted" : "transparent"}
                    _hover={{ bg: "bg.muted" }}
                  >
                    <Icon size={18} />
                    <Text fontSize="sm" fontWeight={isActive ? "medium" : "normal"}>
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
        py={3}
        px={6}
        textAlign="center"
      >
        <Text fontSize="xs" color="fg.muted" fontFamily="mono">
          Episodic
        </Text>
      </Box>
    </Flex>
  )
}
