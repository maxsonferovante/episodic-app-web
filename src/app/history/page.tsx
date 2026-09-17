"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Container,
  Heading,
  Spinner,
  Stack,
  Text,
  Center,
  Badge,
  Flex,
  Icon,
} from "@chakra-ui/react"
import { FiCheck, FiX, FiChevronRight } from "react-icons/fi"
import { ProtectedLayout } from "@/components/protected-layout"
import { getHistory } from "@/lib/api"
import type { HistoryItem } from "@/lib/types"

const MARK_WATCHED = "MARK_WATCHED"

export default function HistoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const data = await getHistory(cursor || undefined)
      setItems((prev) => [...prev, ...data.items])
      setCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
    } catch {
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }, [cursor, loadingMore, hasMore])

  useEffect(() => {
    getHistory()
      .then((data) => {
        setItems(data.items)
        setCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <ProtectedLayout>
      <Container maxW="7xl" py={8} px={{ base: 4, md: 6 }}>
        <Stack gap={6}>
          <Heading size="lg">Watch History</Heading>
          {loading ? (
            <Center py={20}>
              <Spinner size="lg" />
            </Center>
          ) : items.length === 0 ? (
            <Box py={20} textAlign="center">
              <Text color="fg.muted">No watch history yet</Text>
            </Box>
          ) : (
            <Stack gap={3}>
              {items.map((item, i) => {
                const marked = item.eventType === MARK_WATCHED
                return (
                  <Box
                    key={`${item.episode.id}-${i}`}
                    p={4}
                    rounded="lg"
                    borderWidth="1px"
                    borderColor="border.subtle"
                    display="flex"
                    alignItems="center"
                    gap={4}
                    cursor="pointer"
                    _hover={{ shadow: "sm" }}
                    transition="all"
                    onClick={() =>
                      router.push(
                        `/series/${item.series.id}/episodes/${item.episode.seasonNumber}-${item.episode.episodeNumber}`,
                      )
                    }
                  >
                    <Box flex={1}>
                      <Flex alignItems="center" gap={2}>
                        <Text fontWeight="medium" fontSize="sm">
                          {item.series.name}
                        </Text>
                        <Badge
                          colorPalette={marked ? "green" : "gray"}
                          size="xs"
                          variant="subtle"
                        >
                          <Flex gap={1} align="center">
                            <Icon as={marked ? FiCheck : FiX} boxSize={3} />
                            {marked ? "Watched" : "Unwatched"}
                          </Flex>
                        </Badge>
                      </Flex>
                      <Text fontSize="xs" color="fg.muted">
                        S{item.episode.seasonNumber}E{item.episode.episodeNumber}
                        {item.episode.name ? ` - ${item.episode.name}` : ""}
                      </Text>
                    </Box>
                    <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
                      {new Date(item.watchedAt).toLocaleDateString()}{" "}
                      {new Date(item.watchedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Icon as={FiChevronRight} color="fg.muted" flexShrink={0} />
                  </Box>
                )
              })}
              <div ref={sentinelRef} />
              {loadingMore && (
                <Center py={4}>
                  <Spinner size="sm" />
                </Center>
              )}
            </Stack>
          )}
        </Stack>
      </Container>
    </ProtectedLayout>
  )
}
