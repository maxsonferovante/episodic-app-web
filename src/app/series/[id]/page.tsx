"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Stack,
  Badge,
  Button,
  SimpleGrid,
  Tabs,
  Spinner,
  Center,
} from "@chakra-ui/react"
import { ProtectedLayout } from "@/components/protected-layout"
import { getSeriesDetail, getSeasonDetail, addToLibrary, removeFromLibrary, setEpisodeProgress, getLibrary } from "@/lib/api"
import type { SeriesDetailResponse, SeasonDetail as SeasonDetailType, LibraryItem } from "@/lib/types"

const IMG_BASE = "https://image.tmdb.org/t/p/w500"

export default function SeriesDetailPage() {
  const params = useParams()
  const seriesId = params.id as string
  const [series, setSeries] = useState<SeriesDetailResponse | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [seasonData, setSeasonData] = useState<SeasonDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [seasonLoading, setSeasonLoading] = useState(false)
  const [inLibrary, setInLibrary] = useState(false)

  useEffect(() => {
    if (!seriesId) return
    setLoading(true)
    Promise.all([getSeriesDetail(seriesId), getLibrary().catch(() => [] as LibraryItem[])])
      .then(([data, lib]) => {
        setSeries(data)
        setInLibrary(Array.isArray(lib) ? lib.some((i: LibraryItem) => i.seriesId === seriesId) : false)
        if (data.seasons && data.seasons.length > 0) {
          const firstRealSeason = data.seasons.find((s) => s.seasonNumber > 0) || data.seasons[0]
          setSelectedSeason(firstRealSeason.seasonNumber)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [seriesId])

  useEffect(() => {
    if (!seriesId) return
    setSeasonLoading(true)
    getSeasonDetail(seriesId, selectedSeason)
      .then(setSeasonData)
      .catch(() => {})
      .finally(() => setSeasonLoading(false))
  }, [seriesId, selectedSeason])

  const handleToggleLibrary = async () => {
    if (!seriesId) return
    try {
      if (inLibrary) {
        await removeFromLibrary(seriesId)
        setInLibrary(false)
      } else {
        await addToLibrary(seriesId)
        setInLibrary(true)
      }
    } catch {}
  }

  const handleToggleEpisode = async (episodeId: string, currentStatus?: string) => {
    const newStatus = currentStatus === "WATCHED" ? "UNWATCHED" : "WATCHED"
    try {
      await setEpisodeProgress(episodeId, newStatus as "WATCHED" | "UNWATCHED")
      setSeasonData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          episodes: prev.episodes.map((ep) =>
            ep.id === episodeId ? { ...ep, status: newStatus as "WATCHED" | "UNWATCHED" } : ep,
          ),
        }
      })
    } catch {}
  }

  return (
    <ProtectedLayout>
      <Container maxW="7xl" py={8} px={{ base: 4, md: 6 }}>
        {loading ? (
          <Center py={20}>
            <Spinner size="lg" />
          </Center>
        ) : !series ? (
          <Center py={20}>
            <Text color="fg.muted">Series not found</Text>
          </Center>
        ) : (
          <Stack gap={8}>
            <Box position="relative">
              {series.backdropPath && (
                <Image
                  src={`${IMG_BASE}${series.backdropPath}`}
                  alt={series.name}
                  w="full"
                  h={{ base: 48, md: 72 }}
                  objectFit="cover"
                  rounded="xl"
                />
              )}
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                p={{ base: 4, md: 6 }}
                bg="linear-gradient(transparent, rgba(0,0,0,0.8))"
                rounded="xl"
              >
                <Heading size="xl" color="white">
                  {series.name}
                </Heading>
              </Box>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
              <Box gridColumn={{ md: "span 2" }}>
                <Stack gap={4}>
                  <Stack direction="row" gap={2} flexWrap="wrap">
                    {series.firstAirDate && (
                      <Badge colorPalette="gray">{series.firstAirDate.substring(0, 4)}</Badge>
                    )}
                    <Badge colorPalette="blue">{series.status}</Badge>
                    <Badge colorPalette="green">
                      {series.numberOfSeasons} seasons
                    </Badge>
                  </Stack>
                  <Text>{series.overview}</Text>
                  <Button
                    onClick={handleToggleLibrary}
                    colorPalette={inLibrary ? "red" : "blue"}
                    variant={inLibrary ? "outline" : "solid"}
                    size="sm"
                    alignSelf="flex-start"
                  >
                    {inLibrary ? "Remove from Library" : "Add to Library"}
                  </Button>
                </Stack>
              </Box>

              {series.providers && series.providers.length > 0 && (
                <Box>
                  <Heading size="sm" mb={3}>
                    Where to Watch
                  </Heading>
                  <Stack gap={2}>
                    {series.providers.map((p) => (
                      <Stack key={p.providerId} direction="row" gap={2} align="center">
                        {p.logoPath && (
                          <Image
                            src={`${IMG_BASE}${p.logoPath}`}
                            alt={p.providerName}
                            boxSize={6}
                            rounded="sm"
                          />
                        )}
                        <Text fontSize="sm">{p.providerName}</Text>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}
            </SimpleGrid>

            {series.seasons && series.seasons.length > 0 && (
              <Tabs.Root
                value={String(selectedSeason)}
                onValueChange={(e) => setSelectedSeason(Number(e.value))}
              >
                <Tabs.List overflowX="auto" whiteSpace="nowrap">
                  {series.seasons.map((s) => (
                    <Tabs.Trigger key={s.id} value={String(s.seasonNumber)}>
                      {s.seasonNumber === 0 ? "Extras" : `Season ${s.seasonNumber}`}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                <Box pt={4}>
                  {seasonLoading ? (
                    <Center py={10}>
                      <Spinner />
                    </Center>
                  ) : seasonData ? (
                    <Stack gap={3}>
                      {seasonData.episodes.map((ep) => (
                        <Box
                          key={ep.id}
                          p={4}
                          rounded="lg"
                          borderWidth="1px"
                          borderColor="border.subtle"
                          display="flex"
                          alignItems="center"
                          gap={4}
                        >
                          {ep.stillPath && (
                            <Image
                              src={`${IMG_BASE}${ep.stillPath}`}
                              alt={ep.name}
                              w={24}
                              h={14}
                              rounded="md"
                              objectFit="cover"
                              flexShrink={0}
                            />
                          )}
                          <Box flex={1}>
                            <Text fontWeight="medium" fontSize="sm">
                              E{ep.episodeNumber} - {ep.name}
                            </Text>
                            {ep.overview && (
                              <Text fontSize="xs" color="fg.muted" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {ep.overview}
                              </Text>
                            )}
                            <Stack direction="row" gap={2} mt={1}>
                              {ep.airDate && (
                                <Text fontSize="xs" color="fg.muted">
                                  {ep.airDate}
                                </Text>
                              )}
                              {ep.runtime && (
                                <Text fontSize="xs" color="fg.muted">
                                  {ep.runtime}m
                                </Text>
                              )}
                            </Stack>
                          </Box>
                          <Button
                            size="xs"
                            variant={ep.status === "WATCHED" ? "solid" : "outline"}
                            colorPalette={ep.status === "WATCHED" ? "green" : "gray"}
                            onClick={() => handleToggleEpisode(ep.id, ep.status)}
                          >
                            {ep.status === "WATCHED" ? "Watched" : "Mark Watched"}
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Text color="fg.muted" textAlign="center" py={10}>
                      No episodes available
                    </Text>
                  )}
                </Box>
              </Tabs.Root>
            )}
          </Stack>
        )}
      </Container>
    </ProtectedLayout>
  )
}
