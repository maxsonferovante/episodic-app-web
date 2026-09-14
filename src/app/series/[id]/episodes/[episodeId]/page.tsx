"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
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
  Icon,
  Breadcrumb,
} from "@chakra-ui/react"
import {
  FiCheck,
  FiPlay,
  FiClock,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiFilm,
  FiArrowLeft,
} from "react-icons/fi"
import { ProtectedLayout } from "@/components/protected-layout"
import {
  getSeriesDetail,
  getSeasonDetail,
  getEpisodeProgress,
  setEpisodeProgress,
} from "@/lib/api"
import type { Episode, SeasonDetail, SeriesDetailResponse, EpisodeProgress as EpisodeProgressType } from "@/lib/types"

const IMG_BASE = "https://image.tmdb.org/t/p/w500"
const IMG_ORIGINAL = "https://image.tmdb.org/t/p/original"

export default function EpisodeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string
  const episodeId = params.episodeId as string

  const [series, setSeries] = useState<SeriesDetailResponse | null>(null)
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [seasonNumber, setSeasonNumber] = useState<number>(0)
  const [progress, setProgress] = useState<EpisodeProgressType | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [prevEpisode, setPrevEpisode] = useState<Episode | null>(null)
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null)

  // Load series and find episode
  useEffect(() => {
    if (!seriesId || !episodeId) return
    setLoading(true)
    getSeriesDetail(seriesId)
      .then(async (data) => {
        setSeries(data)
        // Find which season contains this episode
        const realSeasons = data.seasons?.filter((s) => s.seasonNumber > 0) ?? []
        for (const season of realSeasons) {
          const seasonData = await getSeasonDetail(seriesId, season.seasonNumber)
          const found = seasonData.episodes.find((ep) => ep.id === episodeId)
          if (found) {
            setEpisode(found)
            setSeasonNumber(season.seasonNumber)
            // Find prev/next episodes
            const idx = seasonData.episodes.findIndex((ep) => ep.id === episodeId)
            setPrevEpisode(idx > 0 ? seasonData.episodes[idx - 1] : null)
            setNextEpisode(idx < seasonData.episodes.length - 1 ? seasonData.episodes[idx + 1] : null)
            break
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [seriesId, episodeId])

  // Load episode progress
  useEffect(() => {
    if (!episodeId) return
    getEpisodeProgress(episodeId)
      .then(setProgress)
      .catch(() => {})
  }, [episodeId])

  const handleToggleWatched = useCallback(async () => {
    if (!episodeId) return
    setActionLoading(true)
    const newStatus = progress?.status === "WATCHED" ? "UNWATCHED" : "WATCHED"
    try {
      await setEpisodeProgress(episodeId, newStatus)
      setProgress((prev) => (prev ? { ...prev, status: newStatus } : { episodeId, status: newStatus, watchedAt: new Date().toISOString() }))
    } catch {}
    finally {
      setActionLoading(false)
    }
  }, [episodeId, progress])

  const isWatched = progress?.status === "WATCHED"
  const watchedAt = progress?.watchedAt
  const isFuture = episode?.airDate ? new Date(episode.airDate) > new Date() : false

  return (
    <ProtectedLayout>
      {loading ? (
        <Center minH="60vh">
          <Spinner size="lg" />
        </Center>
      ) : !episode || !series ? (
        <Center minH="60vh">
          <Text color="fg.muted">Episódio não encontrado</Text>
        </Center>
      ) : (
        <Container maxW="4xl" py={8} px={{ base: 4, md: 6 }}>
          <Stack gap={6}>
            {/* Breadcrumb */}
            <Breadcrumb.Root>
              <Breadcrumb.List>
                <Breadcrumb.Item>
                  <Breadcrumb.Link asChild>
                    <Link href={`/series/${seriesId}`}>
                      <Flex gap={1} align="center" fontSize="sm" color="fg.muted">
                        <FiChevronLeft />
                        {series.name}
                      </Flex>
                    </Link>
                  </Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.CurrentLink fontSize="sm" fontWeight="semibold">
                    T{seasonNumber} E{episode.episodeNumber} - {episode.name}
                  </Breadcrumb.CurrentLink>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb.Root>

            {/* Back button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.back()}
              alignSelf="flex-start"
              gap={1}
            >
              <FiArrowLeft />
              Voltar à série
            </Button>

            {/* Episode Banner */}
            <Box position="relative" rounded="2xl" overflow="hidden">
              {episode.stillPath ? (
                <Image
                  src={`${IMG_ORIGINAL}${episode.stillPath}`}
                  alt={episode.name}
                  w="full"
                  h={{ base: 48, md: 64 }}
                  objectFit="cover"
                />
              ) : (
                <Box w="full" h={48} bg="bg.muted" display="flex" alignItems="center" justifyContent="center">
                  <Icon as={FiFilm} boxSize={12} color="fg.muted" />
                </Box>
              )}
              <Box
                position="absolute"
                inset={0}
                bg="linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)"
              />
              <Flex
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                p={{ base: 4, md: 6 }}
                gap={4}
                alignItems="flex-end"
              >
                <Box flex={1}>
                  <Flex gap={2} alignItems="center" mb={2}>
                    <Badge colorPalette="blue" size="sm">
                      T{seasonNumber} E{episode.episodeNumber}
                    </Badge>
                    {isWatched && (
                      <Badge colorPalette="green" size="sm">
                        <Flex gap={1} align="center">
                          <FiCheck />
                          Assistido
                        </Flex>
                      </Badge>
                    )}
                    {isFuture && (
                      <Badge colorPalette="gray" size="sm">
                        Em breve
                      </Badge>
                    )}
                  </Flex>
                  <Heading size="xl" color="white" letterSpacing="tight">
                    {episode.name}
                  </Heading>
                </Box>
              </Flex>
            </Box>

            {/* Watched Status Card */}
            <Box p={5} rounded="2xl" borderWidth="1px" borderColor={isWatched ? "green.200" : "border.subtle"} bg={isWatched ? "green.50" : "bg.default"} shadow="sm">
              <Stack gap={3}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex gap={2} alignItems="center">
                    <Icon as={isWatched ? FiCheck : FiPlay} color={isWatched ? "green.500" : "fg.accent"} />
                    <Text fontSize="sm" fontWeight="semibold">
                      {isWatched ? "Assistido" : "Não assistido"}
                    </Text>
                  </Flex>
                  <Button
                    size="sm"
                    variant={isWatched ? "outline" : "solid"}
                    colorPalette={isWatched ? "green" : "gray"}
                    onClick={handleToggleWatched}
                    loading={actionLoading}
                  >
                    <Icon as={isWatched ? FiCheck : FiPlay} />
                    {isWatched ? "Marcar como não assistido" : "Marcar como assistido"}
                  </Button>
                </Flex>
                {watchedAt && isWatched && (
                  <Flex gap={2} alignItems="center">
                    <Icon as={FiCalendar} boxSize={3} color="fg.muted" />
                    <Text fontSize="xs" color="fg.muted">
                      Assistido em{" "}
                      {new Date(watchedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Flex>
                )}
              </Stack>
            </Box>

            {/* Episode Info */}
            <Stack gap={3}>
              {episode.overview && (
                <Text fontSize="sm" color="fg.muted" lineHeight="relaxed">
                  {episode.overview}
                </Text>
              )}
              <Flex gap={4} flexWrap="wrap" fontSize="sm" color="fg.muted">
                {episode.airDate && (
                  <Flex gap={1.5} align="center">
                    <Icon as={FiCalendar} boxSize={4} />
                    <Text>{new Date(episode.airDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</Text>
                  </Flex>
                )}
                {episode.runtime && (
                  <Flex gap={1.5} align="center">
                    <Icon as={FiClock} boxSize={4} />
                    <Text>{episode.runtime} minutos</Text>
                  </Flex>
                )}
                {episode.voteAverage && (
                  <Badge colorPalette="amber">{episode.voteAverage.toFixed(1)} ★</Badge>
                )}
              </Flex>
            </Stack>

            {/* Navigation: Previous / Next Episode */}
            <Flex gap={3} pt={4}>
              {prevEpisode ? (
                <Button
                  flex={1}
                  variant="outline"
                  onClick={() => router.push(`/series/${seriesId}/episodes/${prevEpisode.id}`)}
                  gap={2}
                  justifyContent="flex-start"
                >
                  <FiChevronLeft />
                  <Stack align="start" gap={0}>
                    <Text fontSize="xs" color="fg.muted">Anterior</Text>
                    <Text fontSize="sm" fontWeight="semibold" truncate maxW="200px">
                      E{prevEpisode.episodeNumber} - {prevEpisode.name}
                    </Text>
                  </Stack>
                </Button>
              ) : (
                <Box flex={1} />
              )}

              {nextEpisode && (
                <Button
                  flex={1}
                  variant="outline"
                  onClick={() => router.push(`/series/${seriesId}/episodes/${nextEpisode.id}`)}
                  gap={2}
                  justifyContent="flex-end"
                >
                  <Stack align="end" gap={0}>
                    <Text fontSize="xs" color="fg.muted">Próximo</Text>
                    <Text fontSize="sm" fontWeight="semibold" truncate maxW="200px">
                      E{nextEpisode.episodeNumber} - {nextEpisode.name}
                    </Text>
                  </Stack>
                  <FiChevronRight />
                </Button>
              )}
            </Flex>
          </Stack>
        </Container>
      )}
    </ProtectedLayout>
  )
}
