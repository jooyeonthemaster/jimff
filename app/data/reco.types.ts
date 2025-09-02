// Minimal, UI-driven schema for hardcoded recommendation pools.
// Keep it compact: only what UI renders + keywords for matching.

export interface RecoMovieItem {
  id: string;           // kebab-case unique id
  title: string;        // localized title for UI
  director: string;     // single name string
  year: number;         // theatrical release year
  genres: string[];     // 1-3 items, e.g. ['Drama','Sci-fi']
  keywords: string[];   // 5-10 tokens for similarity (themes, mood, topics)
  emoji?: string;       // optional emoji for UI
}

export interface RecoMusicItem {
  id: string;           // kebab-case unique id
  title: string;        // track title
  artist: string;       // main artist
  album?: string;       // optional album for UI
  year: number;         // first official release year
  genres: string[];     // 1-3 items
  keywords: string[];   // 5-10 tokens for similarity (mood, instrumentation, topics)
  emoji?: string;       // optional emoji for UI
}


