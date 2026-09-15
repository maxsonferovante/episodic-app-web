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
