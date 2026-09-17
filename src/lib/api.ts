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
  ReleasesResponse,
} from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

const ACCESS_KEY = "episodic_access_token"
const REFRESH_KEY = "episodic_refresh_token"
export const USER_KEY = "episodic_user"

/**
 * Session middleware (transparent to callers):
 *
 * - Every `request()` goes through here. On 401 the access token is
 *   refreshed and the original call retried once.
 * - Concurrent 401s share a single in-flight refresh (single-flight), so a
 *   page firing N parallel calls costs exactly one `POST /auth/refresh`
 *   instead of N — friendlier to the API Gateway throttle.
 * - A proactive timer renews the access token ~5min before it expires, so
 *   returning users usually never hit the 401 path at all.
 * - When renewal is impossible (no/expired refresh token), the session is
 *   torn down and the registered `onSessionExpired` handler fires once
 *   (the auth provider uses it to redirect to `/login?expired=1`).
 */
type SessionExpiredHandler = () => void
let sessionExpiredHandler: SessionExpiredHandler | null = null
let sessionExpiredNotified = false
let inflightRefresh: Promise<string | null> | null = null
let proactiveTimer: ReturnType<typeof setTimeout> | null = null

/** Proactive renewal margin before the access token `exp`. */
const PROACTIVE_REFRESH_MARGIN_MS = 5 * 60 * 1000

export function setSessionExpiredHandler(fn: SessionExpiredHandler | null) {
  sessionExpiredHandler = fn
  if (fn === null) sessionExpiredNotified = false
}

function notifySessionExpired() {
  if (sessionExpiredNotified) return
  sessionExpiredNotified = true
  // Only redirect when there was a session to lose. A visitor that was
  // never logged in has no refresh token and no stored user — the
  // ProtectedLayout already sends them to /login without the flag.
  const hadSession =
    typeof window !== "undefined" &&
    (localStorage.getItem(REFRESH_KEY) !== null ||
      localStorage.getItem(USER_KEY) !== null)
  clearTokens()
  if (hadSession) sessionExpiredHandler?.()
}

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
  sessionExpiredNotified = false
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  }
  scheduleProactiveRefresh()
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  cancelProactiveRefresh()
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }
}

export function getAccessToken() {
  return accessToken || getStoredAccess()
}

async function refreshAccessToken(): Promise<string | null> {
  // Single-flight: concurrent callers share the same renewal.
  if (inflightRefresh) return inflightRefresh
  inflightRefresh = doRefresh()
  try {
    return await inflightRefresh
  } finally {
    inflightRefresh = null
  }
}

async function doRefresh(): Promise<string | null> {
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
    scheduleProactiveRefresh()
    return data.accessToken
  } catch {
    return null
  }
}

/** Read the `exp` claim of a JWT without verifying it (timing only). */
function parseJwtExpMs(token: string): number | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: unknown }
    return typeof json.exp === "number" ? json.exp * 1000 : null
  } catch {
    return null
  }
}

function cancelProactiveRefresh() {
  if (proactiveTimer !== null) {
    clearTimeout(proactiveTimer)
    proactiveTimer = null
  }
}

/**
 * Renew the access token shortly before it expires. If it is already
 * expired (e.g. the tab was idle for hours), renew immediately so the next
 * user action finds a valid session. Failures surface through the same
 * expired-session path as a failed 401 retry.
 */
function scheduleProactiveRefresh() {
  cancelProactiveRefresh()
  if (typeof window === "undefined") return
  const token = accessToken || getStoredAccess()
  if (!token) return
  const expMs = parseJwtExpMs(token)
  if (expMs === null) return
  const delay = expMs - Date.now() - PROACTIVE_REFRESH_MARGIN_MS
  if (delay <= 0) {
    void refreshAccessToken().then((t) => {
      if (!t) notifySessionExpired()
    })
    return
  }
  proactiveTimer = setTimeout(() => {
    proactiveTimer = null
    void refreshAccessToken().then((t) => {
      if (!t) notifySessionExpired()
    })
  }, delay)
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

  // Auth endpoints manage their own failures; never loop them into the
  // expired-session flow (the refresh call itself uses raw fetch anyway).
  if (res.status === 401 && !path.startsWith("/api/v1/auth")) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`)
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
    } else {
      notifySessionExpired()
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
  /** Episode numbers actually (un)marked (aired only) — flip exactly these. */
  updatedEpisodeNumbers: number[]
  progress: {
    watchedEpisodes: number
    totalEpisodes: number
    percentage: number
  }
  season: {
    seasonNumber: number
    watchedEpisodes: number
    episodeCount: number
  }
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

/**
 * Release calendar: every episode from the user's library series airing in
 * `[from, to)`. Powers the Upcoming view modes (week / month / 3 months /
 * specific month). Each item carries the English weekday of its air date.
 */
export async function getReleases(
  from: string,
  to: string,
): Promise<ReleasesResponse> {
  return request(`/api/v1/releases?from=${from}&to=${to}`)
}

export async function getReleasesByMonth(
  month: string,
): Promise<ReleasesResponse> {
  return request(`/api/v1/releases?month=${month}`)
}
