"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Badge,
  Center,
  Button,
} from "@chakra-ui/react"
import { ProtectedLayout } from "@/components/protected-layout"
import { getLibrary, removeFromLibrary } from "@/lib/api"
import type { LibraryItem } from "@/lib/types"

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLibrary()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (seriesId: string) => {
    try {
      await removeFromLibrary(seriesId)
      setItems((prev) => prev.filter((i) => i.seriesId !== seriesId))
    } catch {}
  }

  return (
    <ProtectedLayout>
      <Container maxW="7xl" py={8} px={{ base: 4, md: 6 }}>
        <Stack gap={6}>
          <Heading size="lg">My Library</Heading>
          {loading ? (
            <Center py={20}>
              <Spinner size="lg" />
            </Center>
          ) : items.length === 0 ? (
            <Box py={20} textAlign="center">
              <Text color="fg.muted">Your library is empty. Search for a series to get started.</Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
              {items.map((item) => (
                <Box
                  key={item.id}
                  p={4}
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  _hover={{ shadow: "md" }}
                  transition="shadow"
                >
                  <Stack gap={2}>
                    <Heading size="sm">Series {item.seriesId}</Heading>
                    <Badge colorPalette="blue" size="sm">In Library</Badge>
                    <Text fontSize="xs" color="fg.muted">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </Text>
                    <Button
                      size="xs"
                      colorPalette="red"
                      variant="outline"
                      onClick={() => handleRemove(item.seriesId)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>
    </ProtectedLayout>
  )
}
