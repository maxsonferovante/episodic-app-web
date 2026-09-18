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
  Input,
} from "@chakra-ui/react"
import { FiPlus, FiSearch, FiChevronRight } from "react-icons/fi"
import { ProtectedLayout } from "@/components/protected-layout"
import { getDashboard, getReleases } from "@/lib/api"
import type { DashboardResponse, UpcomingItem } from "@/lib/types"

const IMG_BASE = "https://image.tmdb.org/t/p/w500"

type ReleasesMode = "week" | "month" | "3months" | "pick"

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

function monthRange(month: string): [string, string] {
  const [y, m] = month.split("-").map(Number)
  const from = `${month}-01`
  const to =
    m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`
  return [from, to]
}

/** "Thursday, Sep 18" from an air date + the API-provided weekday. */
function dayLabel(airDate: string, weekday: string): string {
  const parts = airDate.split("-").map(Number)
  const md = `${MONTHS[parts[1] - 1]} ${parts[2]}`
  return weekday ? `${weekday}, ${md}` : md
}

/** "Sep 18" badge text from an air date. */
function shortDate(airDate: string): string {
  const parts = airDate.split("-").map(Number)
  return `${MONTHS[parts[1] - 1]} ${parts[2]}`
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Releases view mode (library series only). The backend serves any
  // [from, to) window; the modes below just pick the bounds.
  const [mode, setMode] = useState<ReleasesMode>("week")
  const [pickedMonth, setPickedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [releases, setReleases] = useState<UpcomingItem[] | null>(null)
  const [releasesLoading, setReleasesLoading] = useState(true)
  const [releasesError, setReleasesError] = useState(false)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const now = new Date()
    const today = toISODate(now)
    let from = today
    let to = today
    if (mode === "week") {
      to = toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7))
    } else if (mode === "month") {
      const [y, m] = today.slice(0, 7).split("-").map(Number)
      from = `${today.slice(0, 7)}-01`
      to = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`
    } else if (mode === "3months") {
      to = toISODate(new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()))
    } else {
      ;[from, to] = monthRange(pickedMonth)
    }
    getReleases(from, to)
      .then((res) => setReleases(res.items))
      .catch(() => {
        setReleases(null)
        setReleasesError(true)
      })
      .finally(() => setReleasesLoading(false))
  }, [mode, pickedMonth])

  // Items arrive sorted by air date — group consecutive ones per day.
  const releaseGroups: { date: string; weekday: string; items: UpcomingItem[] }[] = []
  for (const item of releases ?? []) {
    const last = releaseGroups[releaseGroups.length - 1]
    if (last && last.date === item.airDate) {
      last.items.push(item)
    } else {
      releaseGroups.push({ date: item.airDate, weekday: item.weekday, items: [item] })
    }
  }

  const modeButton = (value: ReleasesMode, label: string) => {
    const isActive = mode === value
    return (
      <Button
        key={value}
        size="sm"
        flexShrink={0}
        rounded="full"
        px={4}
        fontWeight="semibold"
        variant={isActive ? "outline" : "ghost"}
        bg={isActive ? "bg" : undefined}
        color={isActive ? "fg" : "fg.muted"}
        borderColor="border.subtle"
        shadow={isActive ? "xs" : "none"}
        _hover={{ color: "fg" }}
        onClick={() => {
          if (value !== mode) {
            setReleasesLoading(true)
            setReleasesError(false)
            setMode(value)
          }
        }}
      >
        {label}
      </Button>
    )
  }

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
              rounded="xl"
              borderWidth="2.5px"
              borderColor="border"
              boxShadow="3px 3px 0 0 var(--chakra-colors-border)"
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
                        rounded="xl"
                        overflow="hidden"
                        borderWidth="2.5px"
                        borderColor="border"
                        bg="bg"
                        position="relative"
                        boxShadow="3px 3px 0 0 var(--chakra-colors-border)"
                        _hover={{
                          boxShadow: "4px 4px 0 0 var(--chakra-colors-border)",
                          transform: "translate(-1px, -1px)",
                        }}
                        transition="transform 120ms ease, box-shadow 120ms ease"
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

            {/* Upcoming releases (library series only) */}
            <Box>
              <Flex align="center" gap={2} mb={4} wrap="wrap">
                <Box w={1.5} h={3} bg="accent.subtle" rounded="full" />
                <Heading size="sm" textTransform="uppercase" letterSpacing="wider" color="fg.muted">
                  Upcoming ({releases?.length ?? 0})
                </Heading>
              </Flex>
              <Flex
                gap={1}
                p={1.5}
                mb={4}
                bg="bg.muted"
                rounded="full"
                borderWidth="1px"
                borderColor="border.subtle"
                overflowX="auto"
                alignItems="center"
                css={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
              >
                {modeButton("week", "This week")}
                {modeButton("month", "This month")}
                {modeButton("3months", "Next 3 months")}
                <Input
                  type="month"
                  size="sm"
                  value={pickedMonth}
                  onChange={(e) => {
                    if (e.target.value) {
                      setReleasesLoading(true)
                      setReleasesError(false)
                      setPickedMonth(e.target.value)
                      setMode("pick")
                    }
                  }}
                  maxW={44}
                  rounded="full"
                  borderColor={mode === "pick" ? "border.emphasis" : "border.subtle"}
                  color="fg.muted"
                  fontSize="xs"
                  fontWeight="semibold"
                  flexShrink={0}
                  aria-label="Pick a month"
                />
              </Flex>
              {releasesLoading ? (
                <Center py={10}>
                  <Spinner />
                </Center>
              ) : releasesError ? (
                <Center py={10}>
                  <Text color="fg.muted" fontSize="sm">
                    Failed to load releases
                  </Text>
                </Center>
              ) : releaseGroups.length === 0 ? (
                <Center py={10}>
                  <Text color="fg.muted" fontSize="sm">
                    No releases in this period
                  </Text>
                </Center>
              ) : (
                <Stack gap={6}>
                  {releaseGroups.map((group) => (
                    <Box key={group.date}>
                      <Text fontSize="xs" fontWeight="bold" color="fg.muted" mb={2} textTransform="uppercase" letterSpacing="wider">
                        {dayLabel(group.date, group.weekday)}
                      </Text>
                      <Stack gap={3}>
                        {group.items.map((item) => (
                          <Box
                            key={`${item.series.id}-${item.episode.seasonNumber}-${item.episode.episodeNumber}`}
                            p={4}
                            rounded="xl"
                            borderWidth="2.5px"
                            borderColor="border"
                            bg="bg"
                            position="relative"
                            overflow="hidden"
                            display="flex"
                            alignItems="center"
                            gap={4}
                            boxShadow="2px 2px 0 0 var(--chakra-colors-border)"
                            _hover={{
                              boxShadow: "3px 3px 0 0 var(--chakra-colors-border)",
                              transform: "translate(-1px, -1px)",
                            }}
                            transition="transform 120ms ease, box-shadow 120ms ease"
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
                                {shortDate(item.airDate)}
                              </Badge>
                              <Icon as={FiChevronRight} color="fg.muted" />
                            </Flex>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Empty state */}
            {!data?.continueWatching?.length &&
              !releasesLoading &&
              !releasesError &&
              (releases?.length ?? 0) === 0 && (
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
