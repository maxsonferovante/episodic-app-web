"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Box,
  Container,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react"
import { ProtectedLayout } from "@/components/protected-layout"
import { searchSeries } from "@/lib/api"
import type { SeriesSummary } from "@/lib/types"

const IMG_BASE = "https://image.tmdb.org/t/p/w500"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SeriesSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

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
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={4}>
              {results.map((series) => (
                <Link
                  key={series.id}
                  href={`/series/${series.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Box
                    rounded="lg"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor="border.subtle"
                    _hover={{ shadow: "md" }}
                    transition="shadow"
                  >
                    {series.posterPath ? (
                      <Image
                        src={`${IMG_BASE}${series.posterPath}`}
                        alt={series.name}
                        w="full"
                        h={72}
                        objectFit="cover"
                      />
                    ) : (
                      <Box
                        h={72}
                        bg="bg.muted"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text color="fg.muted" fontSize="sm">
                          No image
                        </Text>
                      </Box>
                    )}
                    <Box p={3}>
                      <Text fontWeight="medium" fontSize="sm" truncate>
                        {series.name}
                      </Text>
                      {series.firstAirDate && (
                        <Text fontSize="xs" color="fg.muted">
                          {series.firstAirDate.substring(0, 4)}
                        </Text>
                      )}
                    </Box>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          ) : query.trim() ? (
            <Box py={10} textAlign="center">
              <Text color="fg.muted">No results found</Text>
            </Box>
          ) : (
            <Box py={10} textAlign="center">
              <Text color="fg.muted">Start typing to search</Text>
            </Box>
          )}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" gap={2}>
              <button
                onClick={() => {
                  const p = Math.max(1, page - 1)
                  setPage(p)
                  doSearch(query, p)
                }}
                disabled={page <= 1}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  opacity: page <= 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <Text alignSelf="center" fontSize="sm" px={3}>
                Page {page} of {totalPages}
              </Text>
              <button
                onClick={() => {
                  const p = Math.min(totalPages, page + 1)
                  setPage(p)
                  doSearch(query, p)
                }}
                disabled={page >= totalPages}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  opacity: page >= totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </Box>
          )}
        </Stack>
      </Container>
    </ProtectedLayout>
  )
}
