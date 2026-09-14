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
  Image,
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

  const tmdbPoster = (path: string | null) =>
    path ? `https://image.tmdb.org/t/p/w342${path}` : null

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
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={4}>
              {items.map((item) => (
                <Box
                  key={item.id}
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  overflow="hidden"
                  _hover={{ shadow: "md" }}
                  transition="shadow"
                >
                  <Box aspectRatio={2/3} bg="bg.muted">
                    {tmdbPoster(item.posterPath) ? (
                      <Image
                        src={tmdbPoster(item.posterPath)}
                        alt={item.name}
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    ) : (
                      <Center h="full">
                        <Text fontSize="sm" color="fg.muted">No poster</Text>
                      </Center>
                    )}
                  </Box>
                  <Box p={3}>
                    <Stack gap={1}>
                      <Heading size="xs" noOfLines={2}>{item.name}</Heading>
                      {item.firstAirDate && (
                        <Text fontSize="xs" color="fg.muted">
                          {item.firstAirDate.slice(0, 4)}
                        </Text>
                      )}
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
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>
    </ProtectedLayout>
  )
}
