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
  Tabs,
} from "@chakra-ui/react"
import { FiCheck, FiPlus, FiPlay, FiClock, FiCalendar, FiFilm, FiChevronRight, FiTrendingUp } from "react-icons/fi"
import { ProtectedLayout } from "@/components/protected-layout"
import {
  getSeriesDetail,
  getSeasonDetail,
  addToLibrary,
  removeFromLibrary,
  setEpisodeProgress,
  getEpisodeProgress,
  getLibrary,
} from "@/lib/api"
import type { SeriesDetailResponse, SeasonDetail as SeasonDetailType, LibraryItem, Episode, EpisodeProgress } from "@/lib/types"

const IMG_BASE = "https://image.tmdb.org/t/p/w500"
const IMG_ORIGINAL = "https://image.tmdb.org/t/p/original"

interface SeasonProgress {
  watched: number
  total: number
}

export default function SeriesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string

  const [series, setSeries] = useState<SeriesDetailResponse | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [seasonData, setSeasonData] = useState<SeasonDetailType | null>(null)
  const [seasonProgressMap, setSeasonProgressMap] = useState<Record<number, SeasonProgress>>({})
  const [loading, setLoading] = useState(true)
  const [seasonLoading, setSeasonLoading] = useState(false)
  const [inLibrary, setInLibrary] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [allSeasonsData, setAllSeasonsData] = useState<Record<number, SeasonDetailType>>({})

  const totalWatched = Object.values(seasonProgressMap).reduce((a, b) => a + b.watched, 0)
  const totalEpisodes = Object.values(seasonProgressMap).reduce((a, b) => a + b.total, 0)
  const pct = totalEpisodes > 0 ? Math.round((totalWatched / totalEpisodes) * 100) : 0

  // Load series detail + library check
  useEffect(() => {
    if (!seriesId) return
    setLoading(true)
    Promise.all([
      getSeriesDetail(seriesId),
      getLibrary().catch(() => [] as LibraryItem[]),
    ])
      .then(([data, lib]) => {
        setSeries(data)
        setInLibrary(
          Array.isArray(lib)
            ? lib.some((i: LibraryItem) => i.seriesId === seriesId || i.seriesId === `ser_${seriesId}`)
            : false
        )
        if (data.seasons && data.seasons.length > 0) {
          const firstReal = data.seasons.find((s) => s.seasonNumber > 0) || data.seasons[0]
          setSelectedSeason(firstReal.seasonNumber)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [seriesId])

  // Load all seasons to compute progress
  useEffect(() => {
    if (!series || !series.seasons) return
    const realSeasons = series.seasons.filter((s) => s.seasonNumber > 0)
    Promise.all(realSeasons.map((s) => getSeasonDetail(seriesId, s.seasonNumber)))
      .then((seasons) => {
        const map: Record<number, SeasonDetailType> = {}
        const progressMap: Record<number, SeasonProgress> = {}
        seasons.forEach((s) => {
          map[s.seasonNumber] = s
          const watched = s.episodes.filter((ep) => ep.status === "WATCHED").length
          progressMap[s.seasonNumber] = { watched, total: s.episodes.length }
        })
        setAllSeasonsData(map)
        setSeasonProgressMap(progressMap)
      })
      .catch(() => {})
  }, [series, seriesId])

  // Load selected season detail
  useEffect(() => {
    if (!seriesId || !selectedSeason) return
    setSeasonLoading(true)
    getSeasonDetail(seriesId, selectedSeason)
      .then((data) => {
        setSeasonData(data)
        // Update progress for this season
        const watched = data.episodes.filter((ep) => ep.status === "WATCHED").length
        setSeasonProgressMap((prev) => ({ ...prev, [selectedSeason]: { watched, total: data.episodes.length } }))
      })
      .catch(() => {})
      .finally(() => setSeasonLoading(false))
  }, [seriesId, selectedSeason])

  const handleToggleLibrary = async () => {
    if (!seriesId) return
    setActionLoading(true)
    try {
      if (inLibrary) await removeFromLibrary(seriesId)
      else await addToLibrary(seriesId)
      setInLibrary(!inLibrary)
    } catch {}
    finally {
      setActionLoading(false)
    }
  }

  const handleToggleEpisode = useCallback(
    async (episodeId: string, currentStatus?: string) => {
      const newStatus = currentStatus === "WATCHED" ? "UNWATCHED" : "WATCHED"
      try {
        await setEpisodeProgress(episodeId, newStatus as "WATCHED" | "UNWATCHED")
        // Update local season data
        setSeasonData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            episodes: prev.episodes.map((ep) =>
              ep.id === episodeId ? { ...ep, status: newStatus as "WATCHED" | "UNWATCHED" } : ep
            ),
          }
        })
        // Update progress map
        if (seasonData) {
          const updatedEpisodes = seasonData.episodes.map((ep) =>
            ep.id === episodeId ? { ...ep, status: newStatus as "WATCHED" | "UNWATCHED" } : ep
          )
          const watched = updatedEpisodes.filter((ep) => ep.status === "WATCHED").length
          setSeasonProgressMap((prev) => ({ ...prev, [selectedSeason]: { watched, total: seasonData.episodes.length } }))
        }
      } catch {}
    },
    [selectedSeason, seasonData]
  )

  const handleEpisodeClick = (episode: Episode) => {
    router.push(`/series/${seriesId}/episodes/${episode.id}`)
  }

  return (
    <ProtectedLayout>
      {loading ? (
        <Center minH="60vh">
          <Spinner size="lg" />
        </Center>
      ) : !series ? (
        <Center minH="60vh">
          <Text color="fg.muted">Série não encontrada</Text>
        </Center>
      ) : (
        <Container maxW="6xl" py={8} px={{ base: 4, md: 6 }}>
          <Stack gap={8}>
            {/* Banner + Poster */}
            <Box position="relative" rounded="2xl" overflow="hidden">
              {series.backdropPath && (
                <Image
                  src={`${IMG_ORIGINAL}${series.backdropPath}`}
                  alt=""
                  w="full"
                  h={{ base: 56, md: 80 }}
                  objectFit="cover"
                />
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
                      {series.status === "Ended" ? "Encerrada" : "Em exibição"}
                    </Badge>
                    <Badge colorPalette="blue">
                      {series.numberOfSeasons} temporada{series.numberOfSeasons > 1 ? "s" : ""}
                    </Badge>
                    <Badge colorPalette="amber">
                      {totalEpisodes} episódio{totalEpisodes !== 1 ? "s" : ""}
                    </Badge>
                  </Flex>
                </Stack>
              </Flex>
            </Box>

            {/* Overall Progress */}
            <Box p={5} rounded="2xl" borderWidth="1px" borderColor="border.subtle" bg="bg.default" shadow="sm">
              <Stack gap={3}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex gap={2} alignItems="center">
                    <Icon as={FiTrendingUp} color="fg.accent" />
                    <Text fontSize="sm" fontWeight="semibold">
                      {pct}% concluído
                    </Text>
                  </Flex>
                  <Button
                    size="sm"
                    colorPalette={inLibrary ? "red" : "blue"}
                    variant={inLibrary ? "surface" : "solid"}
                    onClick={handleToggleLibrary}
                    loading={actionLoading}
                  >
                    <Icon as={inLibrary ? FiCheck : FiPlus} />
                    {inLibrary ? "Na Biblioteca" : "Adicionar"}
                  </Button>
                </Flex>
                <Progress.Root value={pct} size="sm" rounded="full">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="xs" color="fg.muted">
                  {totalWatched} de {totalEpisodes} episódios assistidos
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
                  Onde Assistir
                </Heading>
                <Flex gap={3} flexWrap="wrap">
                  {series.providers.slice(0, 6).map((p) => (
                    <Flex key={p.providerId} gap={2} align="center" px={3} py={2} rounded="lg" borderWidth="1px" borderColor="border.subtle">
                      {p.logoPath && <Image src={`${IMG_BASE}${p.logoPath}`} alt={p.providerName} boxSize={5} rounded="sm" />}
                      <Text fontSize="xs">{p.providerName}</Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            )}

            {/* Season Tabs */}
            {series.seasons && series.seasons.length > 0 && (
              <Box>
                <Tabs.Root value={String(selectedSeason)} onValueChange={(e) => setSelectedSeason(Number(e.value))}>
                  <Tabs.List overflowX="auto" whiteSpace="nowrap" gap={2} pb={1}>
                    {series.seasons.map((s) => {
                      const isActive = s.seasonNumber === selectedSeason
                      const prog = seasonProgressMap[s.seasonNumber]
                      const seasonPct = prog ? Math.round((prog.watched / Math.max(prog.total, 1)) * 100) : 0
                      return (
                        <Box key={s.id} flexShrink={0}>
                          <Tabs.Trigger value={String(s.seasonNumber)} asChild>
                            <Button size="sm" variant={isActive ? "solid" : "ghost"} colorPalette="gray" whiteSpace="nowrap">
                              {s.seasonNumber === 0 ? "Extras" : `T${s.seasonNumber}`}
                              {prog && prog.total > 0 && (
                                <Badge size="xs" colorPalette={seasonPct === 100 ? "green" : "gray"} ml={1}>
                                  {prog.watched}/{prog.total}
                                </Badge>
                              )}
                            </Button>
                          </Tabs.Trigger>
                        </Box>
                      )
                    })}
                  </Tabs.List>

                  {/* Season Progress Bar */}
                  {seasonProgressMap[selectedSeason] && (
                    <Box mt={3} mb={4}>
                      <Flex justifyContent="space-between" mb={1}>
                        <Text fontSize="xs" color="fg.muted">
                          Progresso da Temporada
                        </Text>
                        <Text fontSize="xs" fontWeight="semibold">
                          {seasonProgressMap[selectedSeason].watched}/{seasonProgressMap[selectedSeason].total} episódios
                        </Text>
                      </Flex>
                      <Progress.Root
                        value={Math.round(
                          (seasonProgressMap[selectedSeason].watched / Math.max(seasonProgressMap[selectedSeason].total, 1)) * 100
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
                        const isWatched = ep.status === "WATCHED"
                        const isFuture = ep.airDate ? new Date(ep.airDate) > new Date() : false
                        return (
                          <Box
                            key={ep.id}
                            p={3}
                            rounded="lg"
                            borderWidth="1px"
                            borderColor={isWatched ? "green.200" : "border.subtle"}
                            bg={isWatched ? "green.50" : "bg.default"}
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
                                h={16}
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
                                {isFuture && <Badge colorPalette="gray" size="xs">Em breve</Badge>}
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
                      <Text color="fg.muted">Nenhum episódio disponível</Text>
                    </Center>
                  )}
                </Tabs.Root>
              </Box>
            )}
          </Stack>
        </Container>
      )}
    </ProtectedLayout>
  )
}
