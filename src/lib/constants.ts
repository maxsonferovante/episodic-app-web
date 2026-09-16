/**
 * Shared status constants — single source of truth for the string values the
 * API and UI exchange. Mirror of the backend `shared::enums` module.
 */

/** Watch status of an episode for the current user. */
export const WatchStatus = {
  WATCHED: "WATCHED",
  UNWATCHED: "UNWATCHED",
  UPCOMING: "UPCOMING",
} as const
export type WatchStatus = (typeof WatchStatus)[keyof typeof WatchStatus]

/** Per-episode status returned by the catalog API. */
export const EpisodeStatus = {
  UPCOMING: "UPCOMING",
  AVAILABLE: "AVAILABLE",
  WATCHED: "WATCHED",
  UNWATCHED: "UNWATCHED",
} as const
export type EpisodeStatus = (typeof EpisodeStatus)[keyof typeof EpisodeStatus]

/** Library entry status. */
export const LibraryStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  CAUGHT_UP: "CAUGHT_UP",
  COMPLETED: "COMPLETED",
} as const
export type LibraryStatus = (typeof LibraryStatus)[keyof typeof LibraryStatus]

/** TMDB series status values, as returned by the library/catalog API. */
export const SeriesStatus = {
  RETURNING: "Returning Series",
  IN_PRODUCTION: "In Production",
  PLANNED: "Planned",
  ENDED: "Ended",
  CANCELED: "Canceled",
  PILOT: "Pilot",
} as const
export type SeriesStatus = (typeof SeriesStatus)[keyof typeof SeriesStatus]

/** Friendly label + badge colour for each TMDB status. */
export const SERIES_STATUS_META: Record<SeriesStatus, { label: string; colorPalette: string }> = {
  [SeriesStatus.RETURNING]: { label: "Airing", colorPalette: "green" },
  [SeriesStatus.ENDED]: { label: "Ended", colorPalette: "gray" },
  [SeriesStatus.CANCELED]: { label: "Canceled", colorPalette: "red" },
  [SeriesStatus.IN_PRODUCTION]: { label: "In Production", colorPalette: "blue" },
  [SeriesStatus.PLANNED]: { label: "Planned", colorPalette: "purple" },
  [SeriesStatus.PILOT]: { label: "Pilot", colorPalette: "orange" },
}

/** Sentinel values for the library status filter. */
export const ALL_STATUSES = "all"
export const UNKNOWN_STATUS = "unknown"

/** Options offered by the library status filter, in display order. */
export const SERIES_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: ALL_STATUSES, label: "All statuses" },
  ...Object.values(SeriesStatus).map((status) => ({
    value: status,
    label: SERIES_STATUS_META[status].label,
  })),
  { value: UNKNOWN_STATUS, label: "Unknown" },
]
