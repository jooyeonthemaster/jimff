import Exa from 'exa-js'

// Exa 클라이언트 초기화
const exa = new Exa(process.env.EXA_API_KEY!)

interface SearchResult {
  title: string
  url: string
  text: string
  publishedDate?: string
}

interface MovieSearchData {
  basicInfo: SearchResult[]
  reviews: SearchResult[]
  analysis: SearchResult[]
}

interface MusicSearchData {
  basicInfo: SearchResult[]
  lyrics: SearchResult[]
  analysis: SearchResult[]
  artistInfo: SearchResult[]
}

/**
 * 영화 관련 웹 데이터 검색
 */
export async function searchMovieData(movieTitle: string): Promise<MovieSearchData> {
  console.log(`🎬 영화 검색 시작: ${movieTitle}`)
  
  try {
    // 1. 영화 기본 정보 검색
    const basicInfoQuery = `${movieTitle} 영화 정보 감독 출연진 줄거리`
    const basicInfo = await exa.searchAndContents(basicInfoQuery, {
      type: 'auto',
      numResults: 3,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 2000
    })

    // 2. 영화 리뷰 검색
    const reviewsQuery = `${movieTitle} 영화 리뷰 평점 관람객 반응`
    const reviews = await exa.searchAndContents(reviewsQuery, {
      type: 'auto',
      numResults: 3,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 1500
    })

    // 3. 영화 분석 및 해석 검색
    const analysisQuery = `${movieTitle} 영화 분석 의미 상징 테마 해석`
    const analysis = await exa.searchAndContents(analysisQuery, {
      type: 'auto',
      numResults: 2,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 2000
    })

    return {
      basicInfo: formatSearchResults(basicInfo.results),
      reviews: formatSearchResults(reviews.results),
      analysis: formatSearchResults(analysis.results)
    }
  } catch (error) {
    console.error('영화 검색 중 오류:', error)
    return {
      basicInfo: [],
      reviews: [],
      analysis: []
    }
  }
}

/**
 * 음악 관련 웹 데이터 검색
 */
export async function searchMusicData(musicTitle: string, artist?: string): Promise<MusicSearchData> {
  const searchTerm = artist ? `${artist} ${musicTitle}` : musicTitle
  console.log(`🎵 음악 검색 시작: ${searchTerm}`)
  
  try {
    // 1. 음악 기본 정보 검색
    const basicInfoQuery = `${searchTerm} 곡 정보 앨범 발매일 장르`
    const basicInfo = await exa.searchAndContents(basicInfoQuery, {
      type: 'auto',
      numResults: 3,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 1500
    })

    // 2. 가사 검색
    const lyricsQuery = `${searchTerm} 가사 lyrics`
    const lyrics = await exa.searchAndContents(lyricsQuery, {
      type: 'auto',
      numResults: 2,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 3000
    })

    // 3. 음악 분석 검색
    const analysisQuery = `${searchTerm} 음악 분석 의미 해석 리뷰`
    const analysis = await exa.searchAndContents(analysisQuery, {
      type: 'auto',
      numResults: 2,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 2000
    })

    // 4. 아티스트 정보 검색 (아티스트가 있는 경우)
    let artistInfo: SearchResult[] = []
    if (artist) {
      const artistQuery = `${artist} 아티스트 프로필 음악 스타일 디스코그래피`
      const artistResults = await exa.searchAndContents(artistQuery, {
        type: 'auto',
        numResults: 2,
        text: true,
        livecrawl: 'fallback',
        timeout: 5000,
        textLength: 1500
      })
      artistInfo = formatSearchResults(artistResults.results)
    }

    return {
      basicInfo: formatSearchResults(basicInfo.results),
      lyrics: formatSearchResults(lyrics.results),
      analysis: formatSearchResults(analysis.results),
      artistInfo
    }
  } catch (error) {
    console.error('음악 검색 중 오류:', error)
    return {
      basicInfo: [],
      lyrics: [],
      analysis: [],
      artistInfo: []
    }
  }
}

/**
 * YouTube URL에서 음악 정보 추출 후 검색
 */
export async function searchMusicFromYouTube(youtubeUrl: string): Promise<MusicSearchData> {
  console.log(`🎥 YouTube 음악 검색: ${youtubeUrl}`)
  
  try {
    // YouTube URL에서 제목 추출을 위한 기본 검색
    const youtubeQuery = `site:youtube.com ${youtubeUrl}`
    const youtubeResult = await exa.searchAndContents(youtubeQuery, {
      type: 'auto',
      numResults: 1,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 500
    })

    if (youtubeResult.results.length > 0) {
      const title = youtubeResult.results[0].title || ''
      // 제목에서 아티스트와 곡명 파싱 시도
      const parsedTitle = parseArtistAndTitle(title)
      return await searchMusicData(parsedTitle.title, parsedTitle.artist || undefined)
    }

    return {
      basicInfo: [],
      lyrics: [],
      analysis: [],
      artistInfo: []
    }
  } catch (error) {
    console.error('YouTube 음악 검색 중 오류:', error)
    return {
      basicInfo: [],
      lyrics: [],
      analysis: [],
      artistInfo: []
    }
  }
}

/**
 * 향수/향료 관련 전문 지식 검색
 */
export async function searchFragranceKnowledge(): Promise<SearchResult[]> {
  console.log(`🌸 향수 전문 지식 검색`)
  
  try {
    const fragranceQuery = `향수 조향 기법 노트 조합 향료 특성 전문 지식`
    const results = await exa.searchAndContents(fragranceQuery, {
      type: 'auto',
      numResults: 3,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 2000
    })

    return formatSearchResults(results.results)
  } catch (error) {
    console.error('향수 지식 검색 중 오류:', error)
    return []
  }
}

/**
 * 검색 결과 포맷팅
 */
function formatSearchResults(results: unknown[]): SearchResult[] {
  return results.map((result: any) => ({
    title: result.title || '',
    url: result.url || '',
    text: result.text || '',
    publishedDate: result.publishedDate
  })).filter(result => result.text.length > 100) // 너무 짧은 결과 필터링
}

/**
 * 제목에서 아티스트와 곡명 분리
 */
function parseArtistAndTitle(title: string): { artist: string; title: string } {
  const patterns = [
    /^(.+?)\s*[-–—]\s*(.+)$/, // "Artist - Song"
    /^(.+?)\s*:\s*(.+)$/, // "Artist: Song"
    /^(.+?)\s*\|\s*(.+)$/, // "Artist | Song"
    /^(.+?)\s*by\s+(.+)$/i, // "Song by Artist"
  ]

  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      const [, first, second] = match
      
      if (pattern.toString().includes('by')) {
        return {
          artist: second.trim(),
          title: first.trim()
        }
      }
      
      return {
        artist: first.trim(),
        title: second.trim()
      }
    }
  }

  return {
    artist: '',
    title: title.trim()
  }
}

/**
 * 비슷한 영화 추천을 위한 웹 검색
 */
export async function searchSimilarMovies(movieTitle: string, genres: string[]): Promise<SearchResult[]> {
  console.log(`🎬 비슷한 영화 검색: ${movieTitle}, 장르: ${genres.join(', ')}`)
  
  try {
    const genreQuery = genres.join(' ')
    const similarMoviesQuery = `${movieTitle} 비슷한 영화 추천 ${genreQuery} 장르`
    
    const results = await exa.searchAndContents(similarMoviesQuery, {
      type: 'auto',
      numResults: 5,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 1500
    })

    return formatSearchResults(results.results)
  } catch (error) {
    console.error('비슷한 영화 검색 중 오류:', error)
    return []
  }
}

/**
 * 비슷한 음악 추천을 위한 웹 검색
 */
export async function searchSimilarMusic(musicTitle: string, artist: string, genre?: string): Promise<SearchResult[]> {
  console.log(`🎵 비슷한 음악 검색: ${musicTitle} - ${artist}`)
  
  try {
    const genreInfo = genre ? ` ${genre}` : ''
    const similarMusicQuery = `${musicTitle} ${artist} 비슷한 음악 추천${genreInfo} 장르`
    
    const results = await exa.searchAndContents(similarMusicQuery, {
      type: 'auto',
      numResults: 5,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 1500
    })

    return formatSearchResults(results.results)
  } catch (error) {
    console.error('비슷한 음악 검색 중 오류:', error)
    return []
  }
}

/**
 * 검색된 데이터를 AI 분석용 컨텍스트로 변환
 */
export function formatSearchDataForAI(movieData?: MovieSearchData, musicData?: MusicSearchData, fragranceKnowledge?: SearchResult[]): string {
  let context = `## 웹 검색을 통해 수집된 실제 데이터\n\n`

  if (movieData) {
    context += `### 🎬 영화 관련 정보\n\n`
    
    if (movieData.basicInfo.length > 0) {
      context += `#### 기본 정보:\n`
      movieData.basicInfo.forEach((info, idx) => {
        context += `**자료 ${idx + 1}**: ${info.title}\n${info.text.slice(0, 800)}...\n\n`
      })
    }

    if (movieData.reviews.length > 0) {
      context += `#### 리뷰 및 평가:\n`
      movieData.reviews.forEach((review, idx) => {
        context += `**리뷰 ${idx + 1}**: ${review.title}\n${review.text.slice(0, 600)}...\n\n`
      })
    }

    if (movieData.analysis.length > 0) {
      context += `#### 전문 분석:\n`
      movieData.analysis.forEach((analysis, idx) => {
        context += `**분석 ${idx + 1}**: ${analysis.title}\n${analysis.text.slice(0, 800)}...\n\n`
      })
    }
  }

  if (musicData) {
    context += `### 🎵 음악 관련 정보\n\n`
    
    if (musicData.basicInfo.length > 0) {
      context += `#### 기본 정보:\n`
      musicData.basicInfo.forEach((info, idx) => {
        context += `**자료 ${idx + 1}**: ${info.title}\n${info.text.slice(0, 800)}...\n\n`
      })
    }

    if (musicData.lyrics.length > 0) {
      context += `#### 가사 정보:\n`
      musicData.lyrics.forEach((lyric, idx) => {
        context += `**가사 ${idx + 1}**: ${lyric.title}\n${lyric.text.slice(0, 1000)}...\n\n`
      })
    }

    if (musicData.analysis.length > 0) {
      context += `#### 음악 분석:\n`
      musicData.analysis.forEach((analysis, idx) => {
        context += `**분석 ${idx + 1}**: ${analysis.title}\n${analysis.text.slice(0, 800)}...\n\n`
      })
    }

    if (musicData.artistInfo.length > 0) {
      context += `#### 아티스트 정보:\n`
      musicData.artistInfo.forEach((artist, idx) => {
        context += `**아티스트 ${idx + 1}**: ${artist.title}\n${artist.text.slice(0, 600)}...\n\n`
      })
    }
  }

  if (fragranceKnowledge && fragranceKnowledge.length > 0) {
    context += `### 🌸 향수 전문 지식\n\n`
    fragranceKnowledge.forEach((knowledge, idx) => {
      context += `**전문지식 ${idx + 1}**: ${knowledge.title}\n${knowledge.text.slice(0, 800)}...\n\n`
    })
  }

  context += `\n---\n위의 실제 웹 데이터를 참고하여 더욱 정확하고 전문적인 분석을 진행해주세요.\n\n`

  return context
}
