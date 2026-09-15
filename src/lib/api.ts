import type {
  AuthResponse,
  RefreshResponse,
  SearchResponse,
  SeriesDetailResponse,
  SeasonDetail,
  Episode,
  LibraryResponse,
  LibraryItem,
  DashboardResponse,
  HistoryResponse,
  ProgressResponse,
  CalendarResponse,
} from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

const ACCESS_KEY = "episodic_access_token"
const REFRESH_KEY = "episodic_refresh_token"

function getStoredAccess(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_KEY)
}
function getStoredRefresh(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_KEY)
}

let accessToken: string | null = null
let refreshToken: string | null = null

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  }
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }
}

export function getAccessToken() {
  return accessToken || getStoredAccess()
}

async function refreshAccessToken(): Promise<string | null> {
  const currentRefresh = refreshToken || getStoredRefresh()
  if (!currentRefresh) return null
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: currentRefresh }),
    })
    if (!res.ok) return null
    const data: RefreshResponse = await res.json()
    accessToken = data.accessToken
    refreshToken = currentRefresh
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_KEY, data.accessToken)
    }
    return data.accessToken
  } catch {
    return null
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  // Hydrate from localStorage on first request
  if (!accessToken) accessToken = getStoredAccess()
  if (!refreshToken) refreshToken = getStoredRefresh()

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json")
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`)
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ code: "UNKNOWN" }))
    throw error
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export async function googleLogin(
  token: string,
): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/v1/auth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: token }),
  })
  setTokens(data.accessToken, data.refreshToken)
  return data
}

export async function searchSeries(
  q: string,
  page = 1,
): Promise<SearchResponse> {
  return request(`/api/v1/series/search?q=${encodeURIComponent(q)}&page=${page}`)
}

export async function getSeriesDetail(
  seriesId: string,
): Promise<SeriesDetailResponse> {
  return request(`/api/v1/series/${seriesId}`)
}

/**
 * The catalog lambda serialises episodes with snake_case keys while the rest
 * of the API uses camelCase. Normalise defensively so the UI keeps working
 * regardless of which casing the backend returns.
 */
function normalizeEpisode(raw: Record<string, unknown>): Episode {
  const pick = <T>(...keys: string[]): T | undefined => {
    for (const key of keys) {
      if (raw[key] !== undefined && raw[key] !== null) return raw[key] as T
    }
    return undefined
  }

  return {
    id: String(pick("id") ?? ""),
    seriesId: String(pick("seriesId", "series_id") ?? ""),
    seasonId: String(pick("seasonId", "season_id") ?? ""),
    tmdbId: Number(pick("tmdbId", "tmdb_id") ?? 0),
    episodeNumber: Number(pick("episodeNumber", "episode_number") ?? 0),
    name: String(pick("name") ?? ""),
    overview: String(pick("overview") ?? ""),
    stillPath: (pick<string | null>("stillPath", "still_path") ?? null) as string | null,
    airDate: (pick<string | null>("airDate", "air_date") ?? null) as string | null,
    runtime: (pick<number | null>("runtime") ?? null) as number | null,
    voteAverage: (pick<number | null>("voteAverage", "vote_average") ?? null) as number | null,
    status: pick<Episode["status"]>("status"),
  }
}

export async function getSeasonDetail(
  seriesId: string,
  seasonNumber: number,
): Promise<SeasonDetail> {
  const data = await request<SeasonDetail>(
    `/api/v1/series/${seriesId}/seasons/${seasonNumber}`,
  )
  const rawEpisodes = (data.episodes ?? []) as unknown as Record<string, unknown>[]
  return {
    ...data,
    seasonNumber: data.seasonNumber ?? seasonNumber,
    episodes: rawEpisodes.map(normalizeEpisode),
  }
}

export async function getLibrary(): Promise<LibraryResponse> {
  return request("/api/v1/library")
}

export async function addToLibrary(
  seriesId: string,
  meta?: {
    name?: string | null
    posterPath?: string | null
    firstAirDate?: string | null
  },
): Promise<LibraryItem> {
  return request(`/api/v1/library/${seriesId}`, {
    method: "PUT",
    body: JSON.stringify({
      name: meta?.name ?? null,
      posterPath: meta?.posterPath ?? null,
      firstAirDate: meta?.firstAirDate ?? null,
    }),
  })
}

export async function removeFromLibrary(
  seriesId: string,
): Promise<void> {
  return request(`/api/v1/library/${seriesId}`, { method: "DELETE" })
}

export async function getDashboard(): Promise<DashboardResponse> {
  return request("/api/v1/dashboard")
}

export async function getHistory(
  cursor?: string,
  limit = 20,
): Promise<HistoryResponse> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set("cursor", cursor)
  return request(`/api/v1/history?${params}`)
}

export async function getEpisodeProgress(
  episodeId: string,
): Promise<ProgressResponse> {
  return request(`/api/v1/episodes/${episodeId}/progress`)
}

export async function setEpisodeProgress(
  episodeId: string,
  watched: boolean,
): Promise<ProgressResponse> {
  return request(`/api/v1/episodes/${episodeId}/progress`, {
    method: "PUT",
    body: JSON.stringify({ watched }),
  })
}

export interface SeasonProgressResult {
  seriesId: string
  seasonNumber: number
  watched: boolean
  updatedEpisodes: number
}

/** Mark/unmark every episode of a season in a single request. */
export async function setSeasonProgress(
  seriesId: string,
  seasonNumber: number,
  watched: boolean,
): Promise<SeasonProgressResult> {
  return request(
    `/api/v1/episodes/season/${encodeURIComponent(seriesId)}/${seasonNumber}/progress`,
    {
      method: "PUT",
      body: JSON.stringify({ watched }),
    },
  )
}

export async function getCalendar(
  from: string,
  to: string,
): Promise<CalendarResponse> {
  return request(`/api/v1/calendar?from=${from}&to=${to}`)
}
