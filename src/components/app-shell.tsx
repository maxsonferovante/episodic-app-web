"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Avatar,
  Menu,
  Portal,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react"
import { FiSearch, FiBookOpen, FiClock, FiHome, FiMenu, FiX } from "react-icons/fi"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

const navLinks = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/search", label: "Search", icon: FiSearch },
  { href: "/library", label: "Library", icon: FiBookOpen },
  { href: "/history", label: "History", icon: FiClock },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Flex direction="column" minH="100vh">
      <Box
        as="nav"
        bg="bg.muted"
        borderBottomWidth="1px"
        borderColor="border.subtle"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex
          maxW="7xl"
          mx="auto"
          px={{ base: 4, md: 6 }}
          h={16}
          align="center"
          justify="space-between"
        >
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
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="fg.default"
                letterSpacing="tight"
              >
                Episodic
              </Text>
            </Link>
          </HStack>

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

          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                aria-label="User menu"
                variant="ghost"
                rounded="full"
                size="sm"
              >
                <Avatar.Root size="sm">
                  <Avatar.Fallback name={user?.name || "?"} />
                </Avatar.Root>
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Content>
                <Menu.Item value="name" disabled>
                  <Text fontSize="sm" fontWeight="medium">
                    {user?.name}
                  </Text>
                </Menu.Item>
                <Menu.Item value="email" disabled>
                  <Text fontSize="xs" color="fg.muted">
                    {user?.email}
                  </Text>
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item
                  value="logout"
                  color="fg.error"
                  onClick={logout}
                >
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Portal>
          </Menu.Root>
        </Flex>

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

      <Box
        as="footer"
        bg="bg.muted"
        borderTopWidth="1px"
        borderColor="border.subtle"
        py={4}
        px={6}
        textAlign="center"
      >
        <Text fontSize="xs" color="fg.muted">
          Powered by TMDB
        </Text>
      </Box>
    </Flex>
  )
}
