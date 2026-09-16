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
import type { Episode, SeriesDetailResponse, ProgressResponse } from "@/lib/types"
import { WatchStatus } from "@/lib/constants"

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
  const [progress, setProgress] = useState<ProgressResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [prevEpisode, setPrevEpisode] = useState<Episode | null>(null)
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null)

  // Load series and resolve the episode. The URL param is either a stable
  // `{season}-{episode}` slug (preferred) or a legacy backend episode id.
  useEffect(() => {
    if (!seriesId || !episodeId) return
    const slug = /^(\d+)-(\d+)$/.exec(episodeId)
    setLoading(true)

    getSeriesDetail(seriesId)
      .then(async (data) => {
        setSeries(data)
        const realSeasons = data.seasons ?? []

        const applyFound = (eps: Episode[], seasonNo: number, idx: number) => {
          setEpisode(eps[idx])
          setSeasonNumber(seasonNo)
          setPrevEpisode(idx > 0 ? eps[idx - 1] : null)
          setNextEpisode(idx < eps.length - 1 ? eps[idx + 1] : null)
        }

        // New format: fetch only the target season.
        if (slug) {
          const seasonNo = Number(slug[1])
          const episodeNo = Number(slug[2])
          const seasonData = await getSeasonDetail(seriesId, seasonNo).catch(() => null)
          if (seasonData) {
            const idx = seasonData.episodes.findIndex((ep) => ep.episodeNumber === episodeNo)
            if (idx >= 0) applyFound(seasonData.episodes, seasonNo, idx)
          }
          return
        }

        // Legacy format: scan seasons for the volatile backend id.
        for (const season of realSeasons) {
          const seasonData = await getSeasonDetail(seriesId, season.seasonNumber).catch(() => null)
          if (!seasonData) continue
          const idx = seasonData.episodes.findIndex((ep) => ep.id === episodeId)
          if (idx >= 0) {
            applyFound(seasonData.episodes, season.seasonNumber, idx)
            break
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [seriesId, episodeId])

  const episodeDbId = episode?.id

  // Load episode progress
  useEffect(() => {
    if (!episodeDbId) return
    getEpisodeProgress(episodeDbId)
      .then(setProgress)
      .catch(() => {})
  }, [episodeDbId])

  const handleToggleWatched = useCallback(async () => {
    if (!episodeDbId) return
    setActionLoading(true)
    const newStatus =
      progress?.episode.status === WatchStatus.WATCHED ? WatchStatus.UNWATCHED : WatchStatus.WATCHED
    try {
      const res = await setEpisodeProgress(episodeDbId, newStatus === WatchStatus.WATCHED)
      setProgress(res)
    } catch {}
    finally {
      setActionLoading(false)
    }
  }, [episodeDbId, progress])

  const isWatched = progress?.episode.status === WatchStatus.WATCHED
  const watchedAt = progress?.episode.watchedAt
  const isFuture = episode?.airDate ? new Date(episode.airDate) > new Date() : false

  return (
    <ProtectedLayout>
      {loading ? (
        <Center minH="60vh">
          <Spinner size="lg" />
        </Center>
      ) : !episode || !series ? (
        <Center minH="60vh">
          <Text color="fg.muted">Episode not found</Text>
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
              Back to series
            </Button>

            {/* Episode Banner */}
            <Box position="relative" rounded="2xl" overflow="hidden">
              {episode.stillPath ? (
                <Image
                  src={`${IMG_ORIGINAL}${episode.stillPath}`}
                  alt={episode.name}
                  w="full"
                  aspectRatio={16 / 9}
                  objectFit="cover"
                  objectPosition="center"
                />
              ) : (
                <Box w="full" aspectRatio={16 / 9} bg="bg.muted" display="flex" alignItems="center" justifyContent="center">
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
                          Watched
                        </Flex>
                      </Badge>
                    )}
                    {isFuture && (
                      <Badge colorPalette="gray" size="sm">
                        Coming soon
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
            <Box p={5} rounded="2xl" borderWidth="1px" borderColor={isWatched ? "green.200" : "border.subtle"} bg={isWatched ? "green.50" : "bg"} shadow="sm">
              <Stack gap={3}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex gap={2} alignItems="center">
                    <Icon as={isWatched ? FiCheck : FiPlay} color={isWatched ? "green.500" : "fg.accent"} />
                    <Text fontSize="sm" fontWeight="semibold">
                      {isWatched ? "Watched" : "Not watched"}
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
                    {isWatched ? "Mark as unwatched" : "Mark as watched"}
                  </Button>
                </Flex>
                {watchedAt && isWatched && (
                  <Flex gap={2} alignItems="center">
                    <Icon as={FiCalendar} boxSize={3} color="fg.muted" />
                    <Text fontSize="xs" color="fg.muted">
                      Watched on{" "}
                      {new Date(watchedAt).toLocaleDateString("en-US", {
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
                    <Text>{new Date(episode.airDate).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}</Text>
                  </Flex>
                )}
                {episode.runtime && (
                  <Flex gap={1.5} align="center">
                    <Icon as={FiClock} boxSize={4} />
                    <Text>{episode.runtime} min</Text>
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
                  onClick={() => router.push(`/series/${seriesId}/episodes/${seasonNumber}-${prevEpisode.episodeNumber}`)}
                  gap={2}
                  justifyContent="flex-start"
                >
                  <FiChevronLeft />
                  <Stack align="start" gap={0}>
                    <Text fontSize="xs" color="fg.muted">Previous</Text>
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
                  onClick={() => router.push(`/series/${seriesId}/episodes/${seasonNumber}-${nextEpisode.episodeNumber}`)}
                  gap={2}
                  justifyContent="flex-end"
                >
                  <Stack align="end" gap={0}>
                    <Text fontSize="xs" color="fg.muted">Next</Text>
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
