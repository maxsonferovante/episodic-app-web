"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Box,
  Container,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react"
import { ProtectedLayout } from "@/components/protected-layout"
import { SeriesCard } from "@/components/series-card"
import { searchSeries, addToLibrary, getLibrary } from "@/lib/api"
import type { SeriesSummary, LibraryItem } from "@/lib/types"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SeriesSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [libraryIds, setLibraryIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    getLibrary()
      .then((data) => {
        if (Array.isArray(data)) {
          setLibraryIds(new Set(data.map((i: LibraryItem) => i.seriesId)))
        }
      })
      .catch(() => {})
  }, [])

  const doSearch = useCallback(async (q: string, p: number) => {
    if (!q.trim()) {
      setResults([])
      setTotalPages(0)
      return
    }
    setLoading(true)
    try {
      const data = await searchSeries(q, p)
      setResults(data.items)
      setTotalPages(data.pagination.totalPages)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      doSearch(query, 1)
    }, 400)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  const handleAdd = async (seriesId: string) => {
    try {
      await addToLibrary(seriesId)
      setLibraryIds((prev) => new Set([...prev, seriesId]))
    } catch {}
  }

  return (
    <ProtectedLayout>
      <Container maxW="7xl" py={8} px={{ base: 4, md: 6 }}>
        <Stack gap={6}>
          <Heading size="lg">Search</Heading>
          <Input
            placeholder="Search for a series..."
            size="lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading ? (
            <Box py={10} textAlign="center">
              <Spinner />
            </Box>
          ) : results.length > 0 ? (
            <>
              <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={4}>
                {results.map((series) => {
                  const inLibrary = libraryIds.has(series.id)
                  return (
                    <SeriesCard
                      key={series.id}
                      id={series.id}
                      name={series.name}
                      posterPath={series.posterPath}
                      firstAirDate={series.firstAirDate}
                      variant="search"
                      onAdd={
                        !inLibrary
                          ? () => handleAdd(series.id)
                          : undefined
                      }
                    />
                  )
                })}
              </SimpleGrid>

              {totalPages > 1 && (
                <Flex justifyContent="center" gap={2} mt={4}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const p = Math.max(1, page - 1)
                      setPage(p)
                      doSearch(query, p)
                    }}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <Text alignSelf="center" fontSize="sm" px={3}>
                    Page {page} of {totalPages}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const p = Math.min(totalPages, page + 1)
                      setPage(p)
                      doSearch(query, p)
                    }}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </Flex>
              )}
            </>
          ) : query.trim() ? (
            <Box py={10} textAlign="center">
              <Text color="fg.muted">No results found</Text>
            </Box>
          ) : (
            <Box py={10} textAlign="center">
              <Text color="fg.muted">Start typing to search</Text>
            </Box>
          )}
        </Stack>
      </Container>
    </ProtectedLayout>
  )
}
