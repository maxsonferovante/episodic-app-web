"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Box,
  Container,
  Heading,
  Spinner,
  Stack,
  Text,
  Center,
} from "@chakra-ui/react"
import { ProtectedLayout } from "@/components/protected-layout"
import { getHistory } from "@/lib/api"
import type { HistoryItem } from "@/lib/types"

export default function HistoryPage() {
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
              {items.map((item, i) => (
                <Box
                  key={`${item.episode.id}-${i}`}
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
                  <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
                    {new Date(item.watchedAt).toLocaleDateString()}{" "}
                    {new Date(item.watchedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Box>
              ))}
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
