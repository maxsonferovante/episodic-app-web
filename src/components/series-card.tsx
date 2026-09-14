"use client"

import Link from "next/link"
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  Icon,
} from "@chakra-ui/react"
import { FiPlus, FiTrash2 } from "react-icons/fi"

const IMG_BASE = "https://image.tmdb.org/t/p/w342"

interface SeriesCardProps {
  id: string
  name: string
  posterPath: string | null
  firstAirDate: string | null
  accent?: string
  footerLeft?: React.ReactNode
  footerRight?: React.ReactNode
  onAdd?: () => void
  onRemove?: () => void
  variant?: "library" | "search" | "dashboard"
}

export function SeriesCard({
  id,
  name,
  posterPath,
  firstAirDate,
  accent = "accent",
  footerLeft,
  footerRight,
  onAdd,
  onRemove,
  variant = "dashboard",
}: SeriesCardProps) {
  const cardContent = (
    <Box
      rounded="2xl"
      borderWidth="1px"
      borderColor="border.subtle"
      bg="bg"
      overflow="hidden"
      position="relative"
      _hover={{ shadow: "md", borderColor: "border.emphasized" }}
      transition="all"
      display="flex"
      flexDirection="column"
    >
      {/* Top accent bar */}
      <Box h={1} w="full" bg={accent} />

      {/* Poster */}
      <Box aspectRatio={2 / 3} bg="bg.muted" overflow="hidden">
        {posterPath ? (
          <Image
            src={`${IMG_BASE}${posterPath}`}
            alt={name}
            w="full"
            h="full"
            objectFit="cover"
          />
        ) : (
          <Flex h="full" align="center" justify="center">
            <Text fontSize="sm" color="fg.muted">
              No poster
            </Text>
          </Flex>
        )}
      </Box>

      {/* Gradient divider */}
      <Box h="2px" w="full" bg="accent.subtle" />

      {/* Card body */}
      <Box p={3} flex={1} display="flex" flexDirection="column" gap={2}>
        <Text fontWeight="semibold" fontSize="sm" color="fg" truncate>
          {name}
        </Text>
        {firstAirDate && (
          <Text fontSize="xs" color="fg.muted">
            {firstAirDate.slice(0, 4)}
          </Text>
        )}

        {/* Action buttons */}
        {onAdd && (
          <Button
            size="xs"
            colorPalette="gray"
            rounded="full"
            fontWeight="semibold"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAdd()
            }}
            gap={1}
          >
            <Icon as={FiPlus} />
            Add
          </Button>
        )}
        {onRemove && (
          <Button
            size="xs"
            colorPalette="red"
            variant="subtle"
            rounded="full"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove()
            }}
            gap={1}
          >
            <Icon as={FiTrash2} />
            Remove
          </Button>
        )}

        {/* Footer */}
        {(footerLeft || footerRight) && (
          <Flex
            mt="auto"
            pt={2}
            borderTopWidth="1px"
            borderColor="border.subtle"
            alignItems="center"
            justifyContent="space-between"
            fontSize="xs"
            color="fg.muted"
          >
            <Box>{footerLeft}</Box>
            <Box>{footerRight}</Box>
          </Flex>
        )}
      </Box>
    </Box>
  )

  if (variant === "search") {
    return (
      <Link href={`/series/${id}`} style={{ textDecoration: "none" }}>
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
