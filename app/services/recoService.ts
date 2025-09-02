import type { RecoMovieItem, RecoMusicItem } from '../data/reco.types'

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, ' ') // keep letters/numbers, collapse others
    .trim()
}

function tokenize(list: string[] | undefined): Set<string> {
  const set = new Set<string>()
  if (!list) return set
  for (const t of list) {
    const norm = normalizeToken(t)
    if (norm) set.add(norm)
  }
  return set
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0
  let score = 0
  for (const x of a) {
    if (b.has(x)) score += 1
  }
  return score
}

export function pickSimilarMoviesFromPool(
  pool: RecoMovieItem[],
  opts: {
    preferredGenres?: string[]
    analyzedMovieGenres?: string[]
    analyzedMovieKeywords?: string[]
    excludeTitle?: string
  }
): RecoMovieItem[] {
  const excludeTitleNorm = opts.excludeTitle ? normalizeToken(opts.excludeTitle) : ''
  const prefGenres = tokenize(opts.preferredGenres)
  const movieGenres = tokenize(opts.analyzedMovieGenres)
  const movieKeywords = tokenize(opts.analyzedMovieKeywords)

  const filtered = pool.filter((m) => {
    if (!excludeTitleNorm) return true
    return normalizeToken(m.title) !== excludeTitleNorm
  })

  const scored = filtered.map((m) => {
    const g = tokenize(m.genres)
    const k = tokenize(m.keywords)
    const genreOverlap = overlapScore(g, prefGenres) + overlapScore(g, movieGenres)
    const keywordOverlap = overlapScore(k, movieKeywords)
    const score = genreOverlap * 2 + keywordOverlap * 3 // 키워드 가중치를 조금 더 높임
    return { item: m, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 2).map(s => s.item)
}

export function pickSimilarMusicFromPool(
  pool: RecoMusicItem[],
  opts: {
    analyzedMusicGenre?: string
    analyzedMusicKeywords?: string[]
    excludeTitle?: string
    excludeArtist?: string
  }
): RecoMusicItem[] {
  const genreSet = tokenize(opts.analyzedMusicGenre ? [opts.analyzedMusicGenre] : [])
  const kwSet = tokenize(opts.analyzedMusicKeywords)
  const excludeTitleNorm = opts.excludeTitle ? normalizeToken(opts.excludeTitle) : ''
  const excludeArtistNorm = opts.excludeArtist ? normalizeToken(opts.excludeArtist) : ''

  const filtered = pool.filter((t) => {
    if (!excludeTitleNorm && !excludeArtistNorm) return true
    const titleEq = normalizeToken(t.title) === excludeTitleNorm
    const artistEq = excludeArtistNorm ? normalizeToken(t.artist) === excludeArtistNorm : false
    // 아티스트가 주어지면 (제목 && 아티스트) 동일 시 제외, 없으면 제목 동일만 제외
    return excludeArtistNorm ? !(titleEq && artistEq) : !titleEq
  })

  const scored = filtered.map((t) => {
    const g = tokenize(t.genres)
    const k = tokenize(t.keywords)
    const genreOverlap = overlapScore(g, genreSet)
    const keywordOverlap = overlapScore(k, kwSet)
    const score = genreOverlap * 2 + keywordOverlap * 3
    return { item: t, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 2).map(s => s.item)
}

export function mapMovieItemToResponse(m: RecoMovieItem) {
  return {
    title: m.title,
    director: m.director,
    year: String(m.year),
    genre: m.genres.join(', '),
    reason: '취향 키워드/장르 유사도 기반 추천',
    poster: m.emoji || '🎬'
  }
}

export function mapMusicItemToResponse(t: RecoMusicItem) {
  return {
    title: t.title,
    artist: t.artist,
    album: t.album || '',
    reason: '무드/키워드/장르 유사도 기반 추천',
    emoji: t.emoji || '🎵'
  }
}


