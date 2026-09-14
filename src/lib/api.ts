import type {
  AuthResponse,
  RefreshResponse,
  SearchResponse,
  SeriesDetailResponse,
  SeasonDetail,
  LibraryResponse,
  LibraryItem,
  DashboardResponse,
  HistoryResponse,
  EpisodeProgress,
  ProgressUpdateResponse,
  CalendarResponse,
} from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

let accessToken: string | null = null
let refreshToken: string | null = null

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
}

export function getAccessToken() {
  return accessToken
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const data: RefreshResponse = await res.json()
    accessToken = data.accessToken
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

export async function getSeasonDetail(
  seriesId: string,
  seasonNumber: number,
): Promise<SeasonDetail> {
  return request(`/api/v1/series/${seriesId}/seasons/${seasonNumber}`)
}

export async function getLibrary(): Promise<LibraryResponse> {
  return request("/api/v1/library")
}

export async function addToLibrary(
  seriesId: string,
): Promise<LibraryItem> {
  return request(`/api/v1/library/${seriesId}`, { method: "PUT", body: "{}" })
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
): Promise<EpisodeProgress> {
  return request(`/api/v1/episodes/${episodeId}/progress`)
}

export async function setEpisodeProgress(
  episodeId: string,
  status: "WATCHED" | "UNWATCHED",
): Promise<ProgressUpdateResponse> {
  return request(`/api/v1/episodes/${episodeId}/progress`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
}

export async function getCalendar(
  from: string,
  to: string,
): Promise<CalendarResponse> {
  return request(`/api/v1/calendar?from=${from}&to=${to}`)
}
