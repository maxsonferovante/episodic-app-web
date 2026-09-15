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

/**
 * User context menu anchored to the avatar — same disposition as the
 * Alpaca APP `UserMenuDropdown`: identity header, navigation items,
 * a separator and a destructive logout.
 */
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
          p={1}
          rounded="full"
          borderWidth="1px"
          borderColor="transparent"
          cursor="pointer"
          _hover={{ bg: "bg.muted", borderColor: "border.subtle" }}
          transition="backgrounds, border-color"
        >
          <Avatar.Root size="sm">
            <Avatar.Image src={user?.avatarUrl ?? undefined} alt={user?.name ?? ""} />
            <Avatar.Fallback name={user?.name} bg="bg.muted" fontWeight="bold">
              {initials}
            </Avatar.Fallback>
          </Avatar.Root>
          <Icon as={FiChevronDown} boxSize={3.5} color="fg.muted" />
        </Flex>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            rounded="2xl"
            w={60}
            p={1.5}
            shadow="menu"
            borderWidth="1px"
            borderColor="border.subtle"
            bg="bg.panel"
          >
          {/* Header */}
          <Box
            px={3}
            py={2}
            borderBottomWidth="1px"
            borderColor="border.subtle"
            mb={1}
          >
            <Text fontSize="sm" fontWeight="bold" color="fg" truncate>
              {user?.name}
            </Text>
            <Text fontSize="xs" color="fg.muted" fontFamily="mono" truncate>
              {user?.email}
            </Text>
          </Box>

          {/* My Profile */}
          {onOpenProfile && (
            <Menu.Item value="profile" gap={2.5} rounded="lg" onClick={onOpenProfile}>
              <Icon as={FiUser} color="fg.accent" />
              <Text fontSize="sm">My Profile</Text>
            </Menu.Item>
          )}

          {/* Library */}
          <Menu.Item value="library" gap={2.5} rounded="lg" asChild>
            <Link href="/library" style={{ textDecoration: "none" }}>
              <Icon as={FiBookOpen} color="fg.accent" />
              <Text fontSize="sm">My Library</Text>
            </Link>
          </Menu.Item>

          {/* Privacy */}
          <Menu.Item value="privacy" gap={2.5} rounded="lg" asChild>
            <Link href="/privacy-policy" style={{ textDecoration: "none" }}>
              <Icon as={FiShield} color="fg.accent" />
              <Text fontSize="sm">Privacy Policy</Text>
            </Link>
          </Menu.Item>

          {/* Terms */}
          <Menu.Item value="terms" gap={2.5} rounded="lg" asChild>
            <Link href="/terms-of-use" style={{ textDecoration: "none" }}>
              <Icon as={FiFileText} color="fg.accent" />
              <Text fontSize="sm">Terms of Use</Text>
            </Link>
          </Menu.Item>

          <Menu.Separator borderColor="border.subtle" />

          {/* Logout */}
          <Menu.Item
            value="logout"
            color="fg.error"
            gap={2.5}
            rounded="lg"
            _hover={{ bg: "bg.error" }}
            onClick={logout}
          >
            <Icon as={FiLogOut} />
            <Text fontSize="sm">Logout</Text>
          </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
