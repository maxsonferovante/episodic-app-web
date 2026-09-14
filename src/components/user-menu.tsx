"use client"

import Link from "next/link"
import {
  Box,
  Flex,
  Text,
  Avatar,
  Menu,
  Portal,
  Icon,
} from "@chakra-ui/react"
import {
  FiUser,
  FiBookOpen,
  FiLogOut,
  FiChevronDown,
  FiShield,
  FiFileText,
} from "react-icons/fi"
import { useAuth } from "@/contexts/auth-context"

interface UserMenuProps {
  onOpenProfile?: () => void
}

export function UserMenu({ onOpenProfile }: UserMenuProps) {
  const { user, logout } = useAuth()
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Flex
          as="button"
          align="center"
          gap={1.5}
          px={2}
          py={1}
          rounded="full"
          _hover={{ bg: "bg.muted" }}
          transition="backgrounds"
        >
          <Avatar.Root size="sm">
            {user?.name ? (
              <Avatar.Fallback name={user.name} />
            ) : (
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            )}
          </Avatar.Root>
          <Icon as={FiChevronDown} boxSize={3.5} color="fg.muted" />
        </Flex>
      </Menu.Trigger>
      <Portal>
        <Menu.Content rounded="2xl" w={56} p={1.5}>
          {/* Header */}
          <Box px={3} py={2} borderBottomWidth="1px" borderColor="border.subtle" mb={1}>
            <Text fontSize="sm" fontWeight="bold" truncate>
              {user?.name}
            </Text>
            <Text fontSize="xs" color="fg.muted" truncate>
              {user?.email}
            </Text>
          </Box>

          {/* My Profile */}
          {onOpenProfile && (
            <Menu.Item
              value="profile"
              gap={2.5}
              onClick={onOpenProfile}
            >
              <Icon as={FiUser} color="fg.accent" />
              <Text fontSize="sm">My Profile</Text>
            </Menu.Item>
          )}

          {/* Library */}
          <Link href="/library" style={{ textDecoration: "none" }}>
            <Menu.Item value="library" gap={2.5}>
              <Icon as={FiBookOpen} color="fg.accent" />
              <Text fontSize="sm">My Library</Text>
            </Menu.Item>
          </Link>

          {/* Privacy */}
          <Menu.Item value="privacy" gap={2.5}>
            <Icon as={FiShield} color="fg.accent" />
            <Text fontSize="sm">Privacy Policy</Text>
          </Menu.Item>

          {/* Terms */}
          <Menu.Item value="terms" gap={2.5}>
            <Icon as={FiFileText} color="fg.accent" />
            <Text fontSize="sm">Terms of Use</Text>
          </Menu.Item>

          <Menu.Separator />

          {/* Logout */}
          <Menu.Item
            value="logout"
            color="fg.error"
            gap={2.5}
            onClick={logout}
          >
            <Icon as={FiLogOut} />
            <Text fontSize="sm">Logout</Text>
          </Menu.Item>
        </Menu.Content>
      </Portal>
    </Menu.Root>
  )
}
