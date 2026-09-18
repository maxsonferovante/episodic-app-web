"use client"

import { NativeSelect } from "@chakra-ui/react"
import { SERIES_STATUS_FILTERS } from "@/lib/constants"

interface LibraryStatusFilterProps {
  value: string
  onChange: (value: string) => void
  /** Number of series per filter value, shown next to each option. */
  counts: Record<string, number>
}

export function LibraryStatusFilter({ value, onChange, counts }: LibraryStatusFilterProps) {
  return (
    <NativeSelect.Root size="sm">
      <NativeSelect.Field
        aria-label="Filter by series status"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        borderWidth="2.5px"
        borderColor="border"
        bg="bg"
        fontWeight="semibold"
      >
        {SERIES_STATUS_FILTERS.map((option) => (
          <option key={option.value} value={option.value}>
            {`${option.label} (${counts[option.value] ?? 0})`}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  )
}
