"use client"

import { useEffect, useState } from "react"
import {
  Avatar,
  Box,
  Button,
  Dialog,
  Flex,
  Icon,
  Portal,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"
import { FiBookOpen, FiHeart, FiMail } from "react-icons/fi"
import { useAuth } from "@/contexts/auth-context"
import { getLibrary } from "@/lib/api"
import type { LibraryItem } from "@/lib/types"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenLibrary?: () => void
}

/**
 * Profile modal — ported from the Alpaca APP `ProfileDialog`: a centred
 * avatar with a badge, the account identity, a single meaningful stat card
 * and the primary navigation action.
 */
export function ProfileDialog({
  open,
  onOpenChange,
  onOpenLibrary,
}: ProfileDialogProps) {
  const { user } = useAuth()
  const [libraryCount, setLibraryCount] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    getLibrary()
      .then((data) =>
        setLibraryCount(Array.isArray(data) ? (data as LibraryItem[]).length : 0),
      )
      .catch(() => setLibraryCount(null))
  }, [open])

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <Dialog.Root open={open} onOpenChange={(details) => onOpenChange(details.open)}>
      <Portal>
        <Dialog.Backdrop backdropBlur="sm" bg="black/20" />
        <Dialog.Positioner
          position="fixed"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={{ base: 4, md: 6 }}
        >
          <Dialog.Content
            w="full"
            maxW="sm"
            rounded="2xl"
            p={6}
            shadow="modal"
            borderWidth="1px"
            borderColor="border.subtle"
          >
            <Stack align="center" textAlign="center" gap={4}>
              <Dialog.Title srOnly>User profile</Dialog.Title>
              <Dialog.Description srOnly>
                Details of the signed-in account.
              </Dialog.Description>

              {/* Avatar */}
              <Box position="relative">
                <Avatar.Root size="2xl" borderWidth="2px" borderColor="border.subtle" shadow="xs">
                  <Avatar.Image src={user?.avatarUrl ?? undefined} alt={user?.name ?? ""} />
                  <Avatar.Fallback name={user?.name} bg="bg.muted" fontWeight="bold">
                    {initials}
                  </Avatar.Fallback>
                </Avatar.Root>
                <Flex
                  position="absolute"
                  bottom={-1}
                  right={-1}
                  bg="fg"
                  color="bg"
                  p={1.5}
                  rounded="full"
                  shadow="xs"
                >
                  <Icon as={FiHeart} boxSize={3.5} />
                </Flex>
              </Box>

              {/* Identity */}
              <Stack gap={1}>
                <Text fontSize="lg" fontWeight="bold" color="fg">
                  {user?.name}
                </Text>
                <Flex align="center" justify="center" gap={1.5} color="fg.muted">
                  <Icon as={FiMail} boxSize={3} />
                  <Text fontSize="xs" fontFamily="mono">
                    {user?.email}
                  </Text>
                </Flex>
              </Stack>

              {/* Stat */}
              <Flex
                w="full"
                bg="bg.subtle"
                borderWidth="1px"
                borderColor="border.subtle"
                rounded="xl"
                p={4}
                align="center"
                justify="space-between"
              >
                <Flex align="center" gap={2.5} color="fg.muted">
                  <Icon as={FiBookOpen} boxSize={4} color="fg.accent" />
                  <Text fontSize="xs">Series in your library</Text>
                </Flex>
                {libraryCount === null ? (
                  <Skeleton h={6} w={8} rounded="full" />
                ) : (
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color="fg"
                    bg="bg.muted"
                    px={3}
                    py={1}
                    rounded="full"
                  >
                    {libraryCount}
                  </Text>
                )}
              </Flex>

              {/* Actions */}
              <Stack w="full" gap={2} pt={1}>
                {onOpenLibrary && (
                  <Button
                    w="full"
                    colorPalette="gray"
                    rounded="full"
                    h={11}
                    fontWeight="semibold"
                    fontSize="sm"
                    onClick={() => {
                      onOpenChange(false)
                      onOpenLibrary()
                    }}
                  >
                    <Icon as={FiBookOpen} />
                    My Library
                  </Button>
                )}
                <Button
                  w="full"
                  variant="outline"
                  rounded="full"
                  borderColor="border.subtle"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </Stack>
            </Stack>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default ProfileDialog
