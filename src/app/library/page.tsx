"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Center,
  IconButton,
} from "@chakra-ui/react"
import { FiTrash2 } from "react-icons/fi"
import { ProtectedLayout } from "@/components/protected-layout"
import { SeriesCard } from "@/components/series-card"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { getLibrary, removeFromLibrary } from "@/lib/api"
import type { LibraryItem } from "@/lib/types"

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)

  useEffect(() => {
    getLibrary()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

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
    <ProtectedLayout>
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
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={4}>
              {items.map((item) => (
                <Box key={item.id} position="relative">
                  <Link href={`/series/${item.tmdbId}`} style={{ textDecoration: "none" }}>
                    <SeriesCard
                      id={String(item.tmdbId)}
                      name={item.name}
                      posterPath={item.posterPath}
                      firstAirDate={item.firstAirDate}
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
    </ProtectedLayout>
  )
}
