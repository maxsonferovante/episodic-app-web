"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  Stack,
  Badge,
  Progress,
  Spinner,
  Center,
  VStack,
} from "@chakra-ui/react"
import { ProtectedLayout } from "@/components/protected-layout"
import { getDashboard } from "@/lib/api"
import type { DashboardResponse } from "@/lib/types"

const IMG_BASE = "https://image.tmdb.org/t/p/w500"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedLayout>
      <Container maxW="7xl" py={8} px={{ base: 4, md: 6 }}>
        {loading ? (
          <Center py={20}>
            <Spinner size="lg" />
          </Center>
        ) : error ? (
          <Center py={20}>
            <Text color="fg.muted">{error}</Text>
          </Center>
        ) : (
          <Stack gap={10}>
            {data?.continueWatching && data.continueWatching.length > 0 && (
              <Box>
                <Heading size="lg" mb={4}>
                  Continue Watching
                </Heading>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
                  {data.continueWatching.map((item) => (
                    <Link
                      key={item.series.id}
                      href={`/series/${item.series.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        rounded="lg"
                        overflow="hidden"
                        borderWidth="1px"
                        borderColor="border.subtle"
                        _hover={{ shadow: "md" }}
                        transition="shadow"
                      >
                        {item.series.posterPath && (
                          <Image
                            src={`${IMG_BASE}${item.series.posterPath}`}
                            alt={item.series.name}
                            w="full"
                            h={64}
                            objectFit="cover"
                          />
                        )}
                        <Box p={3}>
                          <Text fontWeight="medium" fontSize="sm" truncate>
                            {item.series.name}
                          </Text>
                          <Text fontSize="xs" color="fg.muted">
                            S{item.nextEpisode.seasonNumber}E{item.nextEpisode.episodeNumber}
                          </Text>
                          <Progress.Root
                            value={item.progress.percentage}
                            size="sm"
                            mt={2}
                          >
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                        </Box>
                      </Box>
                    </Link>
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {data?.upcoming && data.upcoming.length > 0 && (
              <Box>
                <Heading size="lg" mb={4}>
                  Upcoming
                </Heading>
                <Stack gap={3}>
                  {data.upcoming.map((item, i) => (
                    <Box
                      key={i}
                      p={4}
                      rounded="lg"
                      borderWidth="1px"
                      borderColor="border.subtle"
                      display="flex"
                      alignItems="center"
                      gap={4}
                    >
                      {item.series.posterPath && (
                        <Image
                          src={`${IMG_BASE}${item.series.posterPath}`}
                          alt={item.series.name}
                          boxSize={12}
                          rounded="md"
                          objectFit="cover"
                        />
                      )}
                      <Box flex={1}>
                        <Text fontWeight="medium" fontSize="sm">
                          {item.series.name}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          S{item.episode.seasonNumber}E{item.episode.episodeNumber}
                          {item.episode.name ? ` - ${item.episode.name}` : ""}
                        </Text>
                      </Box>
                      <Badge colorPalette="blue" size="sm">
                        {item.airDate}
                      </Badge>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {data?.recentHistory && data.recentHistory.length > 0 && (
              <Box>
                <Heading size="lg" mb={4}>
                  Recent History
                </Heading>
                <Stack gap={3}>
                  {data.recentHistory.map((item, i) => (
                    <Box
                      key={i}
                      p={4}
                      rounded="lg"
                      borderWidth="1px"
                      borderColor="border.subtle"
                      display="flex"
                      alignItems="center"
                      gap={4}
                    >
                      <Box flex={1}>
                        <Text fontWeight="medium" fontSize="sm">
                          {item.series.name}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          S{item.episode.seasonNumber}E{item.episode.episodeNumber}
                          {item.episode.name ? ` - ${item.episode.name}` : ""}
                        </Text>
                      </Box>
                      <Text fontSize="xs" color="fg.muted">
                        {new Date(item.watchedAt).toLocaleDateString()}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {!data?.continueWatching?.length &&
              !data?.upcoming?.length &&
              !data?.recentHistory?.length && (
                <Center py={20}>
                  <VStack gap={2}>
                    <Text fontSize="lg" fontWeight="medium">
                      Nothing here yet
                    </Text>
                    <Text color="fg.muted">
                      Search for a series to get started
                    </Text>
                  </VStack>
                </Center>
              )}
          </Stack>
        )}
      </Container>
    </ProtectedLayout>
  )
}
