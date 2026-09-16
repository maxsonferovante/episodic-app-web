import type { EpisodeStatus, LibraryStatus, WatchStatus } from "./constants"

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
}

export interface Pagination {
  page: number
  totalPages: number
}

export interface SeriesSummary {
  id: string
  tmdbId: number
  name: string
  posterPath: string | null
  firstAirDate: string | null
  /** True when the caller already has this series in their library. */
  inLibrary?: boolean
}

export interface SeriesDetail extends SeriesSummary {
  originalName: string
  overview: string
  backdropPath: string | null
  lastAirDate: string | null
  status: string
  numberOfSeasons: number
  numberOfEpisodes: number
  providers?: WatchProvider[]
  progress?: {
    watchedEpisodes: number
    totalEpisodes: number
    percentage: number
  }
}

export interface WatchProvider {
  providerId: number
  providerName: string
  logoPath: string
}

export interface Season {
  id: string
  seriesId: string
  tmdbId: number
  seasonNumber: number
  name: string
  overview: string
  posterPath: string | null
  airDate: string | null
  episodeCount: number
  watchedEpisodes?: number
}

export interface Episode {
  id: string
  seriesId: string
  seasonId: string
  tmdbId: number
  episodeNumber: number
  name: string
  overview: string
  stillPath: string | null
  airDate: string | null
  runtime: number | null
  voteAverage: number | null
  status?: EpisodeStatus
}

export interface SeasonDetail extends Season {
  episodes: Episode[]
}

export interface SearchResponse {
  items: SeriesSummary[]
  pagination: Pagination
}

export interface SeriesDetailResponse extends SeriesDetail {
  seasons: Season[]
}

export interface LibraryItem {
  id: string
  seriesId: string
  tmdbId: number
  name: string
  posterPath: string | null
  firstAirDate: string | null
  status?: string | null
  addedAt: string
  watchedEpisodes?: number
  totalEpisodes?: number
  percentage?: number
}

export interface SeriesProgress {
  watchedEpisodes: number
  availableEpisodes: number
  percentage: number
}

export interface LibraryEntry {
  series: SeriesSummary
  progress: SeriesProgress
  status: LibraryStatus
  nextEpisode: { seasonNumber: number; episodeNumber: number } | null
}

export type LibraryResponse = LibraryItem[]

export interface ContinueWatchingItem {
  series: SeriesSummary
  nextEpisode: {
    id: string
    seasonNumber: number
    episodeNumber: number
    name: string
  }
  progress: { percentage: number }
}

export interface UpcomingItem {
  series: SeriesSummary
  episode: { seasonNumber: number; episodeNumber: number; name: string }
  airDate: string
}

export interface HistoryItem {
  episode: {
    id: string
    name: string
    seasonNumber: number
    episodeNumber: number
  }
  series: SeriesSummary
  watchedAt: string
}

export interface DashboardResponse {
  continueWatching: ContinueWatchingItem[]
  upcoming: UpcomingItem[]
  recentHistory: HistoryItem[]
}

export interface HistoryResponse {
  items: HistoryItem[]
  nextCursor: string | null
}

export interface ProgressResponse {
  episode: {
    episodeId: string
    status: WatchStatus
    watchedAt?: string | null
  }
  progress: {
    seriesPercentage: number
    seasonPercentage: number
  }
  nextEpisode: {
    episodeId: string
    seriesId: string
    seasonNumber: number
    episodeNumber: number
  } | null
}

export interface CalendarItem {
  series: SeriesSummary
  episode: { seasonNumber: number; episodeNumber: number; name: string }
  airDate: string
}

export interface CalendarResponse {
  items: CalendarItem[]
}

export interface ApiError {
  code: string
  message?: string
}
