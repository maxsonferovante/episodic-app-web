"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  Badge,
  Progress,
  Spinner,
  Center,
  VStack,
  Flex,
  Button,
  Icon,
  Image,
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiChevronRight } from "react-icons/fi"
import { ProtectedLayout } from "@/components/protected-layout"
import { getDashboard } from "@/lib/api"
import type { DashboardResponse } from "@/lib/types"

const IMG_BASE = "https://image.tmdb.org/t/p/w500"

export default function DashboardPage() {
  const router = useRouter()
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
            {/* Greeting + Action Buttons */}
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "start", md: "center" }}
              justify="space-between"
              gap={6}
              bg="bg"
              p={{ base: 6, md: 8 }}
              rounded="3xl"
              borderWidth="1px"
              borderColor="border.subtle"
              shadow="xs"
            >
              <Box>
                <Heading size="2xl" letterSpacing="tight">
                  Welcome back!
                </Heading>
                <Text color="fg.muted" fontSize="sm" mt={1}>
                  Track your TV series, never lose your place.
                </Text>
              </Box>

              <Flex gap={3} wrap="wrap">
                <Button
                  colorPalette="gray"
                  rounded="full"
                  gap={1.5}
                  fontWeight="bold"
                  fontSize="sm"
                  onClick={() => router.push("/search")}
                >
                  <Icon as={FiPlus} />
                  Add Series
                </Button>
                <Button
                  variant="outline"
                  rounded="full"
                  gap={1.5}
                  fontWeight="bold"
                  fontSize="sm"
                  onClick={() => router.push("/library")}
                >
                  <Icon as={FiSearch} color="fg.accent" />
                  My Library
                </Button>
              </Flex>
            </Flex>

            {/* Continue Watching */}
            {data?.continueWatching && data.continueWatching.length > 0 && (
              <Box>
                <Flex align="center" gap={2} mb={4}>
                  <Box w={1.5} h={3} bg="accent" rounded="full" />
                  <Heading size="sm" textTransform="uppercase" letterSpacing="wider" color="fg.muted">
                    Continue Watching ({data.continueWatching.length})
                  </Heading>
                </Flex>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
                  {data.continueWatching.map((item) => (
                    <Link
                      key={item.series.id}
                      href={`/series/${item.series.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Box
                        rounded="2xl"
                        overflow="hidden"
                        borderWidth="1px"
                        borderColor="border.subtle"
                        bg="bg"
                        position="relative"
                        _hover={{ shadow: "md" }}
                        transition="all"
                      >
                        {/* Top accent bar */}
                        <Box h={1} w="full" bg="accent" />

                        {item.series.posterPath && (
                          <Image
                            src={`${IMG_BASE}${item.series.posterPath}`}
                            alt={item.series.name}
                            w="full"
                            h={64}
                            objectFit="cover"
                          />
                        )}

                        {/* Gradient divider */}
                        <Box h="2px" w="full" bg="accent.subtle" />

                        <Box p={3}>
                          <Text fontWeight="semibold" fontSize="sm" truncate>
                            {item.series.name}
                          </Text>
                          <Text fontSize="xs" color="fg.muted" mt={1}>
                            S{item.nextEpisode.seasonNumber}E{item.nextEpisode.episodeNumber}
                          </Text>
                          <Progress.Root
                            value={item.progress.percentage}
                            size="sm"
                            mt={2}
                            colorPalette="blue"
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

            {/* Upcoming */}
            {data?.upcoming && data.upcoming.length > 0 && (
              <Box>
                <Flex align="center" gap={2} mb={4}>
                  <Box w={1.5} h={3} bg="accent.subtle" rounded="full" />
                  <Heading size="sm" textTransform="uppercase" letterSpacing="wider" color="fg.muted">
                    Upcoming ({data.upcoming.length})
                  </Heading>
                </Flex>
                <Stack gap={3}>
                  {data.upcoming.map((item, i) => (
                    <Box
                      key={i}
                      p={4}
                      rounded="2xl"
                      borderWidth="1px"
                      borderColor="border.subtle"
                      bg="bg"
                      position="relative"
                      overflow="hidden"
                      display="flex"
                      alignItems="center"
                      gap={4}
                      _hover={{ shadow: "sm" }}
                      transition="all"
                      cursor="pointer"
                      onClick={() =>
                        router.push(
                          `/series/${item.series.id}/episodes/${item.episode.seasonNumber}-${item.episode.episodeNumber}`,
                        )
                      }
                    >
                      <Box h={1} w="full" bg="accent.subtle" position="absolute" top={0} left={0} />
                      {item.series.posterPath && (
                        <Image
                          src={`${IMG_BASE}${item.series.posterPath}`}
                          alt={item.series.name}
                          boxSize={12}
                          rounded="md"
                          objectFit="cover"
                          flexShrink={0}
                        />
                      )}
                      <Box flex={1}>
                        <Text fontWeight="semibold" fontSize="sm">
                          {item.series.name}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                          S{item.episode.seasonNumber}E{item.episode.episodeNumber}
                          {item.episode.name ? ` — ${item.episode.name}` : ""}
                        </Text>
                      </Box>
                      <Flex align="center" gap={2}>
                        <Badge colorPalette="blue" size="sm">
                          {item.airDate}
                        </Badge>
                        <Icon as={FiChevronRight} color="fg.muted" />
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Empty state */}
            {!data?.continueWatching?.length &&
              !data?.upcoming?.length && (
                <Center py={20}>
                  <VStack gap={3}>
                    <Text fontSize="lg" fontWeight="medium">
                      Nothing here yet
                    </Text>
                    <Text color="fg.muted">
                      Search for a series to get started
                    </Text>
                    <Button
                      colorPalette="gray"
                      rounded="full"
                      gap={1.5}
                      onClick={() => router.push("/search")}
                    >
                      <Icon as={FiSearch} />
                      Search Series
                    </Button>
                  </VStack>
                </Center>
              )}
          </Stack>
        )}
      </Container>
    </ProtectedLayout>
  )
}
