"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  IconButton,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react"
import { FiTrash2 } from "react-icons/fi"
import { ProtectedLayout } from "@/components/protected-layout"
import { SeriesCard } from "@/components/series-card"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { LibraryStatusFilter } from "@/components/library-status-filter"
import { getLibrary, removeFromLibrary } from "@/lib/api"
import { ALL_STATUSES, SERIES_STATUS_FILTERS, UNKNOWN_STATUS } from "@/lib/constants"
import type { LibraryItem } from "@/lib/types"

const VALID_FILTERS = new Set(SERIES_STATUS_FILTERS.map((option) => option.value))

function LibraryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)

  // The URL is the source of truth for the filter, so it survives reloads and
  // the browser back/forward buttons. Unknown values fall back to "all".
  const paramStatus = searchParams.get("status")
  const statusFilter =
    paramStatus && VALID_FILTERS.has(paramStatus) ? paramStatus : ALL_STATUSES

  useEffect(() => {
    getLibrary()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === ALL_STATUSES) {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    const query = params.toString()
    router.replace(query ? `/library?${query}` : "/library", { scroll: false })
  }

  const counts = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const item of items) {
      const key = item.status ?? UNKNOWN_STATUS
      acc[key] = (acc[key] ?? 0) + 1
    }
    return acc
  }, [items])

  const filtered = useMemo(
    () =>
      statusFilter === ALL_STATUSES
        ? items
        : items.filter((item) => (item.status ?? UNKNOWN_STATUS) === statusFilter),
    [items, statusFilter],
  )

  const handleConfirmRemove = async () => {
    if (!removeTarget) return
    try {
      await removeFromLibrary(removeTarget)
      setItems((prev) => prev.filter((i) => i.seriesId !== removeTarget))
    } catch {}
    setRemoveTarget(null)
  }

  const targetItem = items.find((i) => i.seriesId === removeTarget)

  return (
    <Container maxW="7xl" py={8} px={{ base: 4, md: 6 }}>
      <Stack gap={6}>
        <Heading size="lg">My Library</Heading>
        {loading ? (
          <Center py={20}>
            <Spinner size="lg" />
          </Center>
        ) : items.length === 0 ? (
          <Box py={20} textAlign="center">
            <Text color="fg.muted">Your library is empty. Search for a series to get started.</Text>
          </Box>
        ) : (
          <Flex direction={{ base: "column", lg: "row" }} gap={6} align="flex-start">
            <Box flex={1} w="full">
              {filtered.length === 0 ? (
                <Box py={20} textAlign="center">
                  <Stack gap={3} align="center">
                    <Text color="fg.muted">No series match this filter.</Text>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFilterChange(ALL_STATUSES)}
                    >
                      Clear filter
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4, xl: 5 }} gap={4}>
                  {filtered.map((item) => (
                    <Box key={item.id} position="relative">
                      <Link href={`/series/${item.tmdbId}`} style={{ textDecoration: "none" }}>
                        <SeriesCard
                          id={String(item.tmdbId)}
                          name={item.name}
                          posterPath={item.posterPath}
                          firstAirDate={item.firstAirDate}
                          status={item.status}
                          progress={item.percentage ?? 0}
                          footerLeft={
                            <Text fontSize="xs" color="fg.muted">
                              {item.watchedEpisodes ?? 0} of {item.totalEpisodes ?? 0} episodes watched
                            </Text>
                          }
                          footerRight={
                            <Text fontSize="xs" fontWeight="semibold" color="fg">
                              {item.percentage ?? 0}%
                            </Text>
                          }
                        />
                      </Link>
                      <IconButton
                        position="absolute"
                        top={2}
                        right={2}
                        size="xs"
                        colorPalette="red"
                        variant="solid"
                        zIndex={10}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setRemoveTarget(item.seriesId)
                        }}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>

            <Box
              as="aside"
              w={{ base: "full", lg: "260px" }}
              flexShrink={0}
              position={{ lg: "sticky" }}
              top={{ lg: "96px" }}
            >
              <Box
                borderWidth="2.5px"
                borderColor="border"
                rounded="xl"
                bg="bg"
                boxShadow="3px 3px 0 0 var(--chakra-colors-border)"
                p={4}
              >
                <Stack gap={3}>
                  <Text fontSize="sm" fontWeight="semibold" color="fg">
                    Status
                  </Text>
                  <LibraryStatusFilter
                    value={statusFilter}
                    onChange={handleFilterChange}
                    counts={counts}
                  />
                  <Text fontSize="xs" color="fg.muted">
                    Showing {filtered.length} of {items.length} series
                  </Text>
                </Stack>
              </Box>
            </Box>
          </Flex>
        )}
      </Stack>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null)
        }}
        title="Remove from Library"
        description={`Are you sure you want to remove "${targetItem?.name}" from your library? Your progress will be lost.`}
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
      />
    </Container>
  )
}

export default function LibraryPage() {
  return (
    <ProtectedLayout>
      <Suspense
        fallback={
          <Center py={20}>
            <Spinner size="lg" />
          </Center>
        }
      >
        <LibraryContent />
      </Suspense>
    </ProtectedLayout>
  )
}
