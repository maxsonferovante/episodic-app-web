"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Stack,
  Badge,
  Button,
  Spinner,
  Center,
  Flex,
  Progress,
  Icon,
} from "@chakra-ui/react"
import { FiCheck, FiPlus, FiPlay, FiClock, FiCalendar, FiFilm, FiChevronRight, FiTrendingUp, FiX } from "react-icons/fi"
import { ProtectedLayout } from "@/components/protected-layout"
import {
  getSeriesDetail,
  getSeasonDetail,
  addToLibrary,
  removeFromLibrary,
  setEpisodeProgress,
  setSeasonProgress,
  getEpisodeProgress,
  getLibrary,
} from "@/lib/api"
import type { SeriesDetailResponse, SeasonDetail as SeasonDetailType, LibraryItem, Episode } from "@/lib/types"
import { WatchStatus } from "@/lib/constants"

const IMG_BASE = "https://image.tmdb.org/t/p/w500"
const IMG_ORIGINAL = "https://image.tmdb.org/t/p/original"

export default function SeriesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string

  const [series, setSeries] = useState<SeriesDetailResponse | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [seasonData, setSeasonData] = useState<SeasonDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [seasonLoading, setSeasonLoading] = useState(false)
  const [inLibrary, setInLibrary] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [seasonActionLoading, setSeasonActionLoading] = useState(false)

  // Progress is computed by the backend and returned with the series.
  const totalWatched = series?.progress?.watchedEpisodes ?? 0
  const totalEpisodes = series?.progress?.totalEpisodes ?? 0
  const pct = series?.progress?.percentage ?? 0

  const selectedSeasonMeta = series?.seasons?.find((s) => s.seasonNumber === selectedSeason)
  const seasonFullyWatched =
    !!selectedSeasonMeta &&
    (selectedSeasonMeta.episodeCount ?? 0) > 0 &&
    (selectedSeasonMeta.watchedEpisodes ?? 0) >= (selectedSeasonMeta.episodeCount ?? 0)

  // Load series detail
  useEffect(() => {
    if (!seriesId) return
    setLoading(true)
    getSeriesDetail(seriesId)
      .then((data) => {
        setSeries(data)
        if (data.seasons && data.seasons.length > 0) {
          const firstReal = data.seasons.find((s) => s.seasonNumber > 0) || data.seasons[0]
          setSelectedSeason(firstReal.seasonNumber)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [seriesId])

  // Load library check separately (won't block page if 401)
  useEffect(() => {
    if (!seriesId) return
    getLibrary()
      .then((lib) => setInLibrary(Array.isArray(lib) ? lib.some((i: LibraryItem) => i.seriesId === seriesId || i.seriesId === `ser_${seriesId}`) : false))
      .catch(() => setInLibrary(false))
  }, [seriesId])

  // Load the selected season's episodes (the backend returns each episode status).
  useEffect(() => {
    if (!seriesId || !selectedSeason) return
    setSeasonLoading(true)
    getSeasonDetail(seriesId, selectedSeason)
      .then(setSeasonData)
      .catch(() => {})
      .finally(() => setSeasonLoading(false))
  }, [seriesId, selectedSeason])

  const handleToggleLibrary = async () => {
    if (!seriesId) return
    setActionLoading(true)
    try {
      if (inLibrary) await removeFromLibrary(seriesId)
      else
        await addToLibrary(seriesId, {
          name: series?.name,
          posterPath: series?.posterPath,
          firstAirDate: series?.firstAirDate,
        })
      setInLibrary(!inLibrary)
    } catch {}
    finally {
      setActionLoading(false)
    }
  }

  // Re-read the backend-computed progress (series + the given season).
  const refreshAfterChange = useCallback(
    async (seasonNumber: number) => {
      const [seriesData, season] = await Promise.all([
        getSeriesDetail(seriesId).catch(() => null),
        getSeasonDetail(seriesId, seasonNumber).catch(() => null),
      ])
      if (seriesData) setSeries(seriesData)
      if (season) setSeasonData(season)
    },
    [seriesId],
  )

  const handleToggleEpisode = useCallback(
    async (episodeId: string, currentStatus?: string) => {
      try {
        await setEpisodeProgress(episodeId, currentStatus !== WatchStatus.WATCHED)
        await refreshAfterChange(selectedSeason)
      } catch {}
    },
    [refreshAfterChange, selectedSeason],
  )

  const handleToggleSeason = useCallback(
    async (seasonNumber: number) => {
      const meta = series?.seasons?.find((s) => s.seasonNumber === seasonNumber)
      if (!meta || (meta.episodeCount ?? 0) === 0) return
      const markWatched = (meta.watchedEpisodes ?? 0) < (meta.episodeCount ?? 0)
      setSeasonActionLoading(true)
      try {
        await setSeasonProgress(seriesId, seasonNumber, markWatched)
        await refreshAfterChange(seasonNumber)
      } catch {}
      finally {
        setSeasonActionLoading(false)
      }
    },
    [series, seriesId, refreshAfterChange],
  )

  const handleEpisodeClick = (episode: Episode) => {
    // The catalog lambda regenerates episode ids on every request, so we route
    // with a stable season/episode slug instead of the volatile id.
    router.push(`/series/${seriesId}/episodes/${selectedSeason}-${episode.episodeNumber}`)
  }

  return (
    <ProtectedLayout>
      {loading ? (
        <Center minH="60vh">
          <Spinner size="lg" />
        </Center>
      ) : !series ? (
        <Center minH="60vh">
          <Text color="fg.muted">Series not found</Text>
        </Center>
      ) : (
        <Container maxW="6xl" py={8} px={{ base: 4, md: 6 }}>
          <Stack gap={8}>
            {/* Banner + Poster */}
            <Box position="relative" rounded="2xl" overflow="hidden">
              {series.backdropPath ? (
                <Image
                  src={`${IMG_ORIGINAL}${series.backdropPath}`}
                  alt=""
                  w="full"
                  aspectRatio={16 / 9}
                  objectFit="cover"
                  objectPosition="center"
                />
              ) : (
                <Box w="full" aspectRatio={16 / 9} bg="bg.muted" />
              )}
              <Box
                position="absolute"
                inset={0}
                bg="linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)"
              />
              <Flex position="absolute" bottom={0} left={0} right={0} p={{ base: 4, md: 8 }} gap={6} alignItems="flex-end">
                <Box
                  flexShrink={0}
                  w={{ base: 24, md: 36 }}
                  rounded="lg"
                  overflow="hidden"
                  shadow="2xl"
                  borderWidth="2px"
                  borderColor="white/20"
                  display={{ base: "none", md: "block" }}
                >
                  {series.posterPath ? (
                    <Image src={`${IMG_BASE}${series.posterPath}`} alt={series.name} w="full" aspectRatio={2 / 3} objectFit="cover" />
                  ) : (
                    <Box bg="bg.muted" aspectRatio={2 / 3} display="flex" alignItems="center" justifyContent="center">
                      <Icon as={FiFilm} boxSize={8} color="fg.muted" />
                    </Box>
                  )}
                </Box>
                <Stack gap={2} flex={1}>
                  <Heading size="2xl" color="white" letterSpacing="tight">
                    {series.name}
                  </Heading>
                  <Flex gap={2} flexWrap="wrap">
                    {series.firstAirDate && <Badge colorPalette="gray">{series.firstAirDate.slice(0, 4)}</Badge>}
                    <Badge colorPalette={series.status === "Ended" ? "gray" : "green"}>
                      {series.status === "Ended" ? "Ended" : "Airing"}
                    </Badge>
                    <Badge colorPalette="blue">
                      {series.numberOfSeasons} season{series.numberOfSeasons > 1 ? "s" : ""}
                    </Badge>
                    <Badge colorPalette="amber">
                      {totalEpisodes} episode{totalEpisodes !== 1 ? "s" : ""}
                    </Badge>
                  </Flex>
                </Stack>
              </Flex>
            </Box>

            {/* Overall Progress */}
            <Box p={5} rounded="2xl" borderWidth="1px" borderColor="border.subtle" bg="bg" shadow="sm">
              <Stack gap={3}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex gap={2} alignItems="center">
                    <Icon as={FiTrendingUp} color="fg.accent" />
                    <Text fontSize="sm" fontWeight="semibold">
                      {pct}% complete
                    </Text>
                  </Flex>
                  <Button
                    size="sm"
                    rounded="full"
                    colorPalette={inLibrary ? "green" : "gray"}
                    variant={inLibrary ? "subtle" : "solid"}
                    fontWeight="semibold"
                    onClick={handleToggleLibrary}
                    loading={actionLoading}
                  >
                    <Icon as={inLibrary ? FiCheck : FiPlus} />
                    {inLibrary ? "In Library" : "Add to Library"}
                  </Button>
                </Flex>
                <Progress.Root value={pct} size="sm" rounded="full">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="xs" color="fg.muted">
                  {totalWatched} of {totalEpisodes} episodes watched
                </Text>
              </Stack>
            </Box>

            {/* Overview */}
            {series.overview && (
              <Text fontSize="sm" color="fg.muted" lineHeight="relaxed">
                {series.overview}
              </Text>
            )}

            {/* Where to Watch */}
            {series.providers && series.providers.length > 0 && (
              <Box>
                <Heading size="sm" mb={3}>
                  Where to Watch
                </Heading>
                <Flex gap={3} flexWrap="wrap">
                  {series.providers.slice(0, 6).map((p) => (
                    <Flex key={p.providerId} gap={2} align="center" px={3} py={2} rounded="lg" borderWidth="1px" borderColor="border.subtle">
                      {p.logoPath && <Image src={`${IMG_BASE}${p.logoPath}`} alt={p.providerName} boxSize={5} rounded="sm" objectFit="contain" />}
                      <Text fontSize="xs">{p.providerName}</Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            )}

            {/* Season Tabs */}
            {series.seasons && series.seasons.length > 0 && (
              <Box>
                {/* Seasons segmented control */}
                <Box
                  role="tablist"
                  aria-label="Seasons"
                  display="flex"
                  gap={1}
                  p={1.5}
                  bg="bg.muted"
                  rounded="full"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  overflowX="auto"
                  css={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
                >
                  {series.seasons.map((s) => {
                    const isActive = s.seasonNumber === selectedSeason
                    const watched = s.watchedEpisodes ?? 0
                    const total = s.episodeCount ?? 0
                    const seasonPct = total > 0 ? Math.round((watched / total) * 100) : 0
                    return (
                      <Button
                        key={s.id}
                        role="tab"
                        aria-selected={isActive}
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
                        onClick={() => setSelectedSeason(s.seasonNumber)}
                      >
                        {s.seasonNumber === 0 ? "Specials" : `T${s.seasonNumber}`}
                        {total > 0 && (
                          <Text
                            as="span"
                            fontSize="xs"
                            fontFamily="mono"
                            color={seasonPct === 100 ? "fg.success" : isActive ? "fg.muted" : "fg.subtle"}
                          >
                            {watched}/{total}
                          </Text>
                        )}
                      </Button>
                    )
                  })}
                </Box>

                  {/* Season Progress Bar */}
                  {selectedSeasonMeta && (selectedSeasonMeta.episodeCount ?? 0) > 0 && (
                    <Box mt={3} mb={4}>
                      <Flex justifyContent="space-between" alignItems="center" gap={3} wrap="wrap" mb={1}>
                        <Text fontSize="xs" color="fg.muted">
                          Season progress
                        </Text>
                        <Flex align="center" gap={3}>
                          <Text fontSize="xs" fontWeight="semibold">
                            {selectedSeasonMeta.watchedEpisodes ?? 0}/{selectedSeasonMeta.episodeCount} episodes
                          </Text>
                          <Button
                            size="xs"
                            variant="outline"
                            rounded="full"
                            borderColor="border.subtle"
                            fontWeight="semibold"
                            loading={seasonActionLoading}
                            onClick={() => handleToggleSeason(selectedSeason)}
                          >
                            <Icon as={seasonFullyWatched ? FiX : FiCheck} />
                            {seasonFullyWatched ? "Unmark season" : "Mark season watched"}
                          </Button>
                        </Flex>
                      </Flex>
                      <Progress.Root
                        value={Math.round(
                          ((selectedSeasonMeta.watchedEpisodes ?? 0) / Math.max(selectedSeasonMeta.episodeCount ?? 0, 1)) * 100
                        )}
                        size="xs"
                        rounded="full"
                      >
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                  )}

                  {/* Episodes List */}
                  {seasonLoading ? (
                    <Center py={10}>
                      <Spinner />
                    </Center>
                  ) : seasonData ? (
                    <Stack gap={2}>
                      {seasonData.episodes.map((ep) => {
                        const isWatched = ep.status === WatchStatus.WATCHED
                        const isFuture = ep.airDate ? new Date(ep.airDate) > new Date() : false
                        return (
                          <Box
                            key={ep.id}
                            p={3}
                            rounded="lg"
                            borderWidth="1px"
                            borderColor={isWatched ? "green.200" : "border.subtle"}
                            bg={isWatched ? "green.50" : "bg"}
                            _hover={{ shadow: "sm" }}
                            transition="all"
                            cursor="pointer"
                            display="flex"
                            alignItems="center"
                            gap={4}
                            opacity={isFuture ? 0.5 : 1}
                            onClick={() => handleEpisodeClick(ep)}
                          >
                            {/* Episode Number Badge */}
                            <Center
                              w={10}
                              h={10}
                              rounded="lg"
                              bg={isWatched ? "green.500" : "bg.muted"}
                              color={isWatched ? "white" : "fg.muted"}
                              fontWeight="bold"
                              fontSize="sm"
                              flexShrink={0}
                            >
                              {ep.episodeNumber}
                            </Center>

                            {/* Still Image */}
                            {ep.stillPath && (
                              <Image
                                src={`${IMG_BASE}${ep.stillPath}`}
                                alt=""
                                w={28}
                                aspectRatio={16 / 9}
                                rounded="md"
                                objectFit="cover"
                                flexShrink={0}
                              />
                            )}

                            {/* Episode Info */}
                            <Box flex={1} minW={0}>
                              <Flex alignItems="center" gap={2}>
                                <Text fontWeight="semibold" fontSize="sm" truncate>
                                  {ep.name}
                                </Text>
                                {isWatched && (
                                  <Icon as={FiCheck} color="green.500" flexShrink={0} />
                                )}
                              </Flex>
                              {ep.overview && (
                                <Text fontSize="xs" color="fg.muted" truncate mt={0.5}>
                                  {ep.overview}
                                </Text>
                              )}
                              <Flex gap={3} mt={1} fontSize="xs" color="fg.muted">
                                {ep.airDate && (
                                  <Flex gap={1} align="center">
                                    <Icon as={FiCalendar} boxSize={3} />
                                    {ep.airDate}
                                  </Flex>
                                )}
                                {ep.runtime && (
                                  <Flex gap={1} align="center">
                                    <Icon as={FiClock} boxSize={3} />
                                    {ep.runtime}m
                                  </Flex>
                                )}
                                {isFuture && <Badge colorPalette="gray" size="xs">Coming soon</Badge>}
                              </Flex>
                            </Box>

                            {/* Toggle + Navigate */}
                            <Flex gap={2} flexShrink={0} onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="xs"
                                variant={isWatched ? "solid" : "outline"}
                                colorPalette={isWatched ? "green" : "gray"}
                                onClick={() => handleToggleEpisode(ep.id, ep.status)}
                              >
                                <Icon as={isWatched ? FiCheck : FiPlay} />
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                colorPalette="gray"
                                onClick={() => handleEpisodeClick(ep)}
                              >
                                <FiChevronRight />
                              </Button>
                            </Flex>
                          </Box>
                        )
                      })}
                    </Stack>
                  ) : (
                    <Center py={10}>
                      <Text color="fg.muted">No episodes available</Text>
                    </Center>
                  )}
              </Box>
            )}
          </Stack>
        </Container>
      )}
    </ProtectedLayout>
  )
}
