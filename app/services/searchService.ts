import Exa from 'exa-js'

// Exa 클라이언트 초기화
const exa = new Exa(process.env.EXA_API_KEY!)

export interface SearchResult {
  title: string
  url: string
  text: string
  publishedDate?: string
}

export interface MovieSearchData {
  basicInfo: SearchResult[]
  reviews: SearchResult[]
  analysis: SearchResult[]
}

export interface MusicSearchData {
  basicInfo: SearchResult[]
  lyrics: SearchResult[]
  analysis: SearchResult[]
  artistInfo: SearchResult[]
}

/**
 * 영화 관련 웹 데이터 검색
 */
export async function searchMovieData(movieTitle: string, directorHint?: string): Promise<MovieSearchData> {
  console.log(`🎬 영화 검색 시작: ${movieTitle}`)
  
  try {
    // 1. 영화 기본 정보 검색
    const basicInfoQuery = directorHint
      ? `${movieTitle} ${directorHint} 감독 영화 정보 줄거리 개봉연도`
      : `${movieTitle} 영화 정보 감독 출연진 줄거리`
    const basicInfo = await exa.searchAndContents(basicInfoQuery, {
      type: 'auto',
      numResults: 3,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 2000
    })

    // 2. 영화 리뷰 검색
    const reviewsQuery = directorHint
      ? `${movieTitle} ${directorHint} 영화 리뷰 평점 관람객 반응`
      : `${movieTitle} 영화 리뷰 평점 관람객 반응`
    const reviews = await exa.searchAndContents(reviewsQuery, {
      type: 'auto',
      numResults: 3,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 1500
    })

    // 3. 영화 분석 및 해석 검색
    const analysisQuery = directorHint
      ? `${movieTitle} ${directorHint} 영화 분석 의미 상징 테마 해석`
      : `${movieTitle} 영화 분석 의미 상징 테마 해석`
    const analysis = await exa.searchAndContents(analysisQuery, {
      type: 'auto',
      numResults: 2,
      text: true,
      livecrawl: 'fallback',
      timeout: 5000,
      textLength: 2000
    })

    let basic = formatSearchResults(basicInfo.results)
    let rev = formatSearchResults(reviews.results)
    let ana = formatSearchResults(analysis.results)

    if (directorHint) {
      const filterByDirector = (arr: SearchResult[]) => {
        const f = arr.filter(r => (r.title + ' ' + r.text).toLowerCase().includes(directorHint.toLowerCase()))
        return f.length > 0 ? f : arr
      }
      basic = filterByDirector(basic)
      rev = filterByDirector(rev)
      ana = filterByDirector(ana)
    }

    console.log(`🎬 영화 검색 완료: ${basic.length + rev.length + ana.length}개 결과`)

    return {
      basicInfo: basic,
      reviews: rev,
      analysis: ana
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
    // 1. 음악 기본 정보 검색 - 더 정확한 매칭을 위한 쿼리 개선
    const basicInfoQueries = [
      `"${artist}" "${musicTitle}" 곡 정보 앨범 발매일`,
      `${searchTerm} song information album release`,
      `${searchTerm} 음악 정보 장르`
    ]
    
    const basicInfoResults: Array<{ title?: string | null; url?: string | null; text?: string | null; publishedDate?: string | null }> = []
    for (const query of basicInfoQueries) {
      try {
        const result = await exa.searchAndContents(query, {
          type: 'auto',
          numResults: 2,
          text: true,
          livecrawl: 'fallback',
          timeout: 4000,
          textLength: 1500
        })
        basicInfoResults.push(...result.results)
      } catch (queryError) {
        console.error(`기본 정보 검색 실패: ${query}`, queryError)
      }
    }
    
    const basicInfo = { results: basicInfoResults.slice(0, 4) }

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
  return (results as Array<{ title?: string | null; url?: string | null; text?: string | null; publishedDate?: string | null }>).map((result) => ({
    title: result.title || '',
    url: result.url || '',
    text: result.text || '',
    publishedDate: result.publishedDate || undefined
  }))
  .filter(result => result.text.length > 100) // 너무 짧은 결과 필터링
  .filter(result => {
    // 기본적인 품질 필터링 (너무 엄격하지 않게)
    const text = result.text.toLowerCase()
    const title = result.title.toLowerCase()
    
    // 관련성 있는 콘텐츠 식별
    const hasRelevantInfo = text.includes('곡') || text.includes('음악') || text.includes('노래') || 
                           text.includes('영화') || text.includes('추천') || text.includes('리스트') ||
                           text.includes('song') || text.includes('track') || text.includes('artist') ||
                           text.includes('movie') || text.includes('film') || text.includes('recommendation') ||
                           text.includes('감독') || text.includes('연도') || text.includes('개봉') ||
                           text.includes('줄거리') || text.includes('synopsis') || text.includes('plot') ||
                           title.includes('곡') || title.includes('음악') || title.includes('노래') ||
                           title.includes('영화') || title.includes('추천') || title.includes('리스트') ||
                           title.includes('song') || title.includes('track') || title.includes('artist') ||
                           title.includes('movie') || title.includes('film') || title.includes('recommendation') ||
                           title.includes('synopsis') || title.includes('plot')
    
    // 관련 정보가 있거나 충분히 긴 텍스트는 포함 (기준 완화)
    return hasRelevantInfo || result.text.length > 300
  })
}

/**
 * 영화 검색 데이터에서 연도/장르/줄거리 등 핵심 메타데이터를 추출
 */
export function extractMovieFacts(movieData: MovieSearchData, directorHint?: string): {
  year?: string
  genres?: string[]
  description?: string
} {
  try {
    const blobs = [
      ...(movieData.basicInfo || []),
      ...(movieData.analysis || []),
      ...(movieData.reviews || [])
    ]
      .map(r => `${r.title}\n${r.text}`)
      .join('\n\n')
      .replace(/\s+/g, ' ')

    const facts: { year?: string; genres?: string[]; description?: string } = {}

    // 연도 산출: 각 문서 조각별로 후보 연도와 컨텍스트 가중치를 합산하여 최고 점수 선정
    type YearScore = { score: number }
    const yearScores: Record<string, YearScore> = {}
    const strongKeywords = ['개봉','공개','개봉일','출시','release','released','premiere','theatrical']
    const jpStrong = ['公開','上映','初公開']
    const weakKeywords = ['영화제','festival','시사회','프리미어']

    const addScore = (year: string, inc: number) => {
      if (!year) return
      if (!yearScores[year]) yearScores[year] = { score: 0 }
      yearScores[year].score += inc
    }

    const docs = [
      ...(movieData.basicInfo || []),
      ...(movieData.analysis || []),
      ...(movieData.reviews || [])
    ]

    for (const doc of docs) {
      const content = `${doc.title || ''} ${doc.text || ''}`
      const publishedYear = doc.publishedDate ? String(new Date(doc.publishedDate).getFullYear()) : ''
      if (publishedYear && /^(19|20)\d{2}$/.test(publishedYear)) addScore(publishedYear, 1) // 약한 신호

      const re = /(19\d{2}|20\d{2})/g
      let m: RegExpExecArray | null
      while ((m = re.exec(content)) !== null) {
        const year = m[1]
        const start = Math.max(0, m.index - 40)
        const end = Math.min(content.length, m.index + 40)
        const window = content.slice(start, end).toLowerCase()
        let score = 1
        if (strongKeywords.some(k => window.includes(k))) score += 3
        if (jpStrong.some(k => window.includes(k))) score += 3
        if (weakKeywords.some(k => window.includes(k))) score += 1
        if (directorHint && window.includes(directorHint.toLowerCase())) score += 1
        addScore(year, score)
      }
    }

    const bestYear = Object.entries(yearScores)
      .filter(([y]) => Number(y) >= 1900 && Number(y) <= 2099)
      .sort((a,b) => b[1].score - a[1].score)[0]?.[0]
    if (bestYear) facts.year = bestYear

    // 장르: 한글/영문 키워드 매핑
    const genreDict: Record<string, string> = {
      '스릴러': '스릴러', 'thriller': '스릴러',
      '드라마': '드라마', 'drama': '드라마',
      '로맨스': '로맨스', 'romance': '로맨스',
      '코미디': '코미디', 'comedy': '코미디',
      '범죄': '범죄', 'crime': '범죄',
      '액션': '액션', 'action': '액션',
      '공포': '공포', 'horror': '공포',
      'SF': 'SF', 'sci-fi': 'SF', 'science fiction': 'SF',
      '판타지': '판타지', 'fantasy': '판타지',
      '느와르': '느와르', 'noir': '느와르',
      '뮤지컬': '뮤지컬', 'musical': '뮤지컬'
    }
    const found = new Set<string>()
    for (const [k, v] of Object.entries(genreDict)) {
      const re = new RegExp(`(?:^|[^가-힣A-Za-z])${k}(?:$|[^가-힣A-Za-z])`, 'i')
      if (re.test(blobs)) found.add(v)
    }
    if (found.size > 0) facts.genres = Array.from(found)

    // 줄거리: '줄거리', '시놉시스', 'synopsis', 'plot' 이후 2-4문장 추출
    const descAnchors = [
      /줄거리\s*[:：]?\s*([^\n]{80,600})/i,
      /시놉시스\s*[:：]?\s*([^\n]{80,600})/i,
      /synopsis\s*[:：]?\s*([^\n]{80,600})/i,
      /plot\s*[:：]?\s*([^\n]{80,600})/i,
      /あらすじ\s*[:：]?\s*([^\n]{80,600})/i
    ]
    for (const re of descAnchors) {
      const m = blobs.match(re)
      if (m && m[1]) {
        facts.description = truncateForSynopsis(cleanSynopsis(m[1]))
        break
      }
    }
    if (!facts.description) {
      // 분석 섹션 텍스트에서 문장 몇 개 발췌
      const firstAnalysis = (movieData.analysis?.[0]?.text || movieData.basicInfo?.[0]?.text || '')
      if (firstAnalysis) facts.description = truncateForSynopsis(cleanSynopsis(firstAnalysis))
    }

    return facts
  } catch (e) {
    console.error('extractMovieFacts error:', e)
    return {}
  }
}

function cleanSynopsis(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/続きを読む|더 보기|더보기|접기|\.{3,}$/g, '')
    .trim()
}

function truncateForSynopsis(text: string, maxLen = 280): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 1).trim() + '…'
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
 * 비슷한 영화 추천을 위한 웹 검색 - 다단계 검색 전략
 */
export async function searchSimilarMovies(movieTitle: string, genres: string[], directorHint?: string): Promise<SearchResult[]> {
  console.log(`🎬 비슷한 영화 검색: ${movieTitle}, 장르: ${genres.join(', ')}`)
  
  try {
    const genreQuery = genres.join(' ')
    const allResults: SearchResult[] = []
    
    // 1단계: 구체적인 영화 기반 검색
    const specificQueries = [
      `${movieTitle} ${directorHint ? directorHint + ' ' : ''}비슷한 영화 추천 ${genreQuery}`,
      `${movieTitle} ${directorHint ? directorHint + ' ' : ''}같은 장르 영화 추천`,
      `"${movieTitle}" ${directorHint ? directorHint + ' ' : ''}similar movies recommendations`
    ]
    
    for (const query of specificQueries) {
      try {
        const results = await exa.searchAndContents(query, {
          type: 'auto',
          numResults: 3,
          text: true,
          livecrawl: 'fallback',
          timeout: 5000,
          textLength: 1800
        })
        allResults.push(...formatSearchResults(results.results))
      } catch (queryError) {
        console.error(`구체적 영화 검색 실패: ${query}`, queryError)
      }
    }
    
    // 2단계: 장르 기반 검색 (1단계 결과가 부족한 경우)
    if (allResults.length < 4 && genres.length > 0) {
      console.log('🎬 장르 기반 대안 검색 시작...')
      const genreQueries = [
        `${genreQuery} 영화 추천 명작 베스트`,
        `${genreQuery} 장르 영화 리스트 추천`,
        `best ${genreQuery} movies recommendations`
      ]
      
      for (const query of genreQueries) {
        try {
          const results = await exa.searchAndContents(query, {
            type: 'auto',
            numResults: 4,
            text: true,
            livecrawl: 'fallback',
            timeout: 5000,
            textLength: 2000
          })
          allResults.push(...formatSearchResults(results.results))
        } catch (queryError) {
          console.error(`장르 기반 검색 실패: ${query}`, queryError)
        }
      }
    }
    
    // 3단계: 일반적인 영화 추천 검색 (여전히 부족한 경우)
    if (allResults.length < 3) {
      console.log('🎬 일반적인 영화 추천 검색 시작...')
      const generalQueries = [
        `영화 추천 명작 베스트 리스트`,
        `좋은 영화 추천 평점 높은`,
        `movie recommendations best films`
      ]
      
      for (const query of generalQueries) {
        try {
          const results = await exa.searchAndContents(query, {
            type: 'auto',
            numResults: 3,
            text: true,
            livecrawl: 'fallback',
            timeout: 5000,
            textLength: 1500
          })
          allResults.push(...formatSearchResults(results.results))
        } catch (queryError) {
          console.error(`일반 영화 검색 실패: ${query}`, queryError)
        }
      }
    }
    
    // 감독 힌트가 있으면 포함하는 결과를 우선 정렬
    const prioritized = directorHint
      ? allResults.sort((a, b) => {
          const ai = ((a.title + ' ' + a.text).toLowerCase().includes(directorHint.toLowerCase())) ? 1 : 0
          const bi = ((b.title + ' ' + b.text).toLowerCase().includes(directorHint.toLowerCase())) ? 1 : 0
          return bi - ai
        })
      : allResults

    // 중복 제거 및 최대 개수 제한
    const uniqueResults = Array.from(
      new Map(prioritized.map(result => [result.url, result])).values()
    ).slice(0, 12)
    
    console.log(`🎬 영화 검색 완료: ${uniqueResults.length}개 결과`)
    return uniqueResults
    
  } catch (error) {
    console.error('비슷한 영화 검색 중 오류:', error)
    return []
  }
}

/**
 * 비슷한 음악 추천을 위한 웹 검색 - 키워드 기반 검색 전략
 */
export async function searchSimilarMusic(musicTitle: string, artist: string, genre?: string, keywords?: string[]): Promise<SearchResult[]> {
  console.log(`🎵 비슷한 음악 검색: ${musicTitle} - ${artist}`)
  if (keywords && keywords.length > 0) {
    console.log(`🏷️ 키워드 기반 검색: ${keywords.join(', ')}`)
  }
  
  try {
    const genreInfo = genre ? ` ${genre}` : ''
    const allResults: SearchResult[] = []
    
    // 1단계: 키워드 기반 검색 (키워드가 있는 경우)
    if (keywords && keywords.length > 0) {
      const keywordQuery = keywords.join(' ')
      const keywordQueries = [
        `${keywordQuery} 음악 추천 비슷한 곡`,
        `${keywordQuery} 장르 노래 추천`,
        `${keywordQuery} music recommendations similar songs`,
        `${keywordQuery} 스타일 음악 리스트`
      ]
      
      for (const query of keywordQueries) {
        try {
          const results = await exa.searchAndContents(query, {
            type: 'auto',
            numResults: 4,
            text: true,
            livecrawl: 'fallback',
            timeout: 5000,
            textLength: 1800
          })
          allResults.push(...formatSearchResults(results.results))
        } catch (queryError) {
          console.error(`키워드 기반 검색 실패: ${query}`, queryError)
        }
      }
    }
    
    // 2단계: 장르 기반 검색 (키워드 검색 결과가 부족한 경우)
    if (allResults.length < 4 && genreInfo) {
      console.log('🎵 장르 기반 검색 시작...')
      const genreQueries = [
        `${genreInfo.trim()} 음악 추천 베스트`,
        `${genreInfo.trim()} 장르 노래 추천 리스트`,
        `best ${genreInfo.trim()} songs recommendations`
      ]
      
      for (const query of genreQueries) {
        try {
          const results = await exa.searchAndContents(query, {
            type: 'auto',
            numResults: 4,
            text: true,
            livecrawl: 'fallback',
            timeout: 5000,
            textLength: 1800
          })
          allResults.push(...formatSearchResults(results.results))
        } catch (queryError) {
          console.error(`장르 기반 검색 실패: ${query}`, queryError)
        }
      }
    }
    
    // 3단계: 구체적인 곡/아티스트 기반 검색 (여전히 부족한 경우에만)
    if (allResults.length < 3) {
      console.log('🎵 구체적 곡 기반 검색 시작...')
      const specificQueries = [
        `"${musicTitle}" 비슷한 음악 추천${genreInfo}`,
        `${musicTitle} 같은 스타일 음악 추천`,
        `similar songs to ${musicTitle} recommendations`
      ]
      
      for (const query of specificQueries) {
        try {
          const results = await exa.searchAndContents(query, {
            type: 'auto',
            numResults: 3,
            text: true,
            livecrawl: 'fallback',
            timeout: 5000,
            textLength: 1800
          })
          allResults.push(...formatSearchResults(results.results))
        } catch (queryError) {
          console.error(`구체적 음악 검색 실패: ${query}`, queryError)
        }
      }
    }
    
    // 4단계: 일반적인 음악 추천 검색 (여전히 부족한 경우)
    if (allResults.length < 3) {
      console.log('🎵 일반적인 음악 추천 검색 시작...')
      const generalQueries = [
        `음악 추천 베스트 명곡 리스트`,
        `좋은 노래 추천 인기 음악`,
        `popular music recommendations best songs`
      ]
      
      for (const query of generalQueries) {
        try {
          const results = await exa.searchAndContents(query, {
            type: 'auto',
            numResults: 3,
            text: true,
            livecrawl: 'fallback',
            timeout: 5000,
            textLength: 1500
          })
          allResults.push(...formatSearchResults(results.results))
        } catch (queryError) {
          console.error(`일반 음악 검색 실패: ${query}`, queryError)
        }
      }
    }
    
    // 중복 제거 및 최대 개수 제한
    const uniqueResults = Array.from(
      new Map(allResults.map(result => [result.url, result])).values()
    ).slice(0, 12)

    console.log(`🎵 음악 검색 완료: ${uniqueResults.length}개 결과`)
    return uniqueResults
    
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
