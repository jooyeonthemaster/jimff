import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { 
  searchMovieData, 
  searchMusicData, 
  searchMusicFromYouTube, 
  searchFragranceKnowledge,
  // searchSimilarMovies,
  // searchSimilarMusic,
  formatSearchDataForAI,
  extractMovieFacts
} from '../../services/searchService'
import type { MovieSearchData } from '../../services/searchService'
import type { RecoMovieItem, RecoMusicItem } from '../../data/reco.types'
import recoMovies from '../../data/reco.movies.json'
import recoMusic from '../../data/reco.music.json'
import { 
  pickSimilarMoviesFromPool,
  pickSimilarMusicFromPool,
  mapMovieItemToResponse,
  mapMusicItemToResponse
} from '../../services/recoService'
import { 
  getAllRelevantLibraries,
  formatLibraryInfoForAI 
} from '../../services/contextService'
import type { LibraryInfo } from '../../services/contextService'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface PreferenceData {
  movieGenres: string[]
  movieTitle?: string
  movieDirector?: string
  movieTrailerUrl?: string
  musicTitle: string
  musicArtist?: string
  musicYoutubeUrl?: string
  youtubeLink?: string // 하위 호환성을 위해 유지
  extractedMusicTitle?: string
  extractedMusicArtist?: string
  likedFragrances: string[]
  dislikedFragrances: string[]
  emotionalResponse: string
}

interface FragranceRecommendation {
  name: string
  brand: string
  fragranceFamily: string
  topNotes: string[]
  middleNotes: string[]
  baseNotes: string[]
  personality: string
  situation: string
  season: string
  reasonForRecommendation: string
  psychologicalMatch: string
  // 새로운 필드 추가
  customPerfumeName: string // 영화 감성에 맞는 향수 이름
  fragranceRecipe: {
    topNote: {
      id: string
      name: string
      ratio: number // g 단위
    }
    middleNote: {
      id: string
      name: string
      ratio: number // g 단위
    }
    baseNote: {
      id: string
      name: string
      ratio: number // g 단위
    }
  }
  // 방사형 그래프용 향수 전문 척도값 추가
  radarChart: {
    부드러움: number      // 1-10 척도 (Softness)
    강렬함: number        // 1-10 척도 (Intensity)
    신선함: number        // 1-10 척도 (Freshness)
    따뜻함: number        // 1-10 척도 (Warmth)
    달콤함: number        // 1-10 척도 (Sweetness)
    우디함: number        // 1-10 척도 (Woodiness)
    플로럴함: number      // 1-10 척도 (Florality)
    스파이시함: number    // 1-10 척도 (Spiciness)
    깊이감: number        // 1-10 척도 (Depth)
    개성감: number        // 1-10 척도 (Uniqueness)
  }
}

interface AnalysisResult {
  analyzedMusic: {
    title: string
    artist: string
    correctionNote?: string
    // 전문 음악 분석 추가
    genre: string
    characteristics: string
    emotionalTone: string
    theme: string
    musicalComposition: string
    backgroundStory: string
    symbolKeywords?: string[] // 음악을 상징하는 키워드들
  }
  analyzedMovie?: { // Added
    title: string
    director: string
    year?: string
    genre: string[]
    description: string
  }
  movieAnalysis: {
    symbolKeywords: string[] // 영화를 상징하는 키워드들
    genreMatching: {
      score: number // 1-10점 매칭 점수
      isMatched: boolean // 매칭 여부
      explanation: string // 매칭/불일치 설명
    }
    cinematicFeatures: string // 영화적 특성 (시각적, 연출적)
    emotionalResonance: string // 감정적 공명도
    coreThemes: string // 핵심 테마와 메시지
  }

  fragranceRecommendations: FragranceRecommendation[]
  movieRecommendations: {
    title: string
    director: string
    year: string
    genre: string
    reason: string
    poster: string
  }[]
  musicRecommendations: {
    title: string
    artist: string
    album: string
    reason: string
    emoji: string
  }[]
  lifestyleAdvice: {
    dailyRoutine: string
    socialInteraction: string
    personalGrowth: string
    fragranceUsage: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: PreferenceData = await request.json()

    // 디버깅을 위한 로깅
    console.log('=== 음악 정보 디버깅 ===')
    console.log('사용자 입력:', {
      title: data.musicTitle,
      artist: data.musicArtist
    })
    console.log('유튜브 추출:', {
      title: data.extractedMusicTitle,
      artist: data.extractedMusicArtist
    })
    console.log('========================')

    // 🔍 웹 검색을 통한 실제 데이터 수집
    console.log('🌐 웹 검색 데이터 수집 시작...')
    
    let movieSearchData: MovieSearchData | null = null
    let musicSearchData: unknown = null
    let fragranceKnowledge: unknown = null
    // 웹 추천 검색 제거: 하드코딩 추천 풀 사용
    let libraryInfo: { music: LibraryInfo[]; movie: LibraryInfo[]; fragrance: LibraryInfo[] } | null = null

    // 병렬로 모든 검색 수행
    const searchPromises = []

    // 1. 영화 데이터 검색
    if (data.movieTitle) {
      searchPromises.push(
        searchMovieData(data.movieTitle, data.movieDirector || undefined).then(result => {
          movieSearchData = result
          try {
            const facts = extractMovieFacts(result, data.movieDirector || undefined)
            console.log('🧾 추출된 영화 메타데이터:', facts)
          } catch (e) {
            console.warn('영화 메타데이터 추출 실패:', e)
          }
          console.log('✅ 영화 검색 완료:', data.movieTitle)
        }).catch(error => {
          console.error('❌ 영화 검색 실패:', error)
        })
      )
    }

    // 2. 음악 데이터 검색
    if (data.musicYoutubeUrl) {
      // YouTube URL이 있는 경우
      searchPromises.push(
        searchMusicFromYouTube(data.musicYoutubeUrl).then(result => {
          musicSearchData = result
          console.log('✅ YouTube 음악 검색 완료:', data.musicYoutubeUrl)
        }).catch(error => {
          console.error('❌ YouTube 음악 검색 실패:', error)
        })
      )
    } else if (data.musicTitle) {
      // 직접 입력된 음악 정보
      const artist = data.extractedMusicArtist || data.musicArtist || ''
      searchPromises.push(
        searchMusicData(data.musicTitle, artist).then(result => {
          musicSearchData = result
          console.log('✅ 음악 검색 완료:', data.musicTitle)
        }).catch(error => {
          console.error('❌ 음악 검색 실패:', error)
        })
      )
    }

    // 3. 향수 전문 지식 검색
    searchPromises.push(
      searchFragranceKnowledge().then(result => {
        fragranceKnowledge = result
        console.log('✅ 향수 지식 검색 완료')
      }).catch(error => {
        console.error('❌ 향수 지식 검색 실패:', error)
      })
    )

    // 비슷한 영화/음악: 웹 검색 비활성화 (하드코딩 풀 사용)

    // 6. 관련 라이브러리 정보 수집
    searchPromises.push(
      getAllRelevantLibraries().then(result => {
        libraryInfo = result
        console.log('✅ 라이브러리 정보 수집 완료')
      }).catch(error => {
        console.error('❌ 라이브러리 정보 수집 실패:', error)
      })
    )

    // 모든 검색 완료 대기 (최대 15초)
    await Promise.allSettled(searchPromises)
    console.log('🎯 모든 웹 검색 완료!')

    // 향료 데이터 로드
    const fragranceData = {
      top: [
        { id: "AC'SCENT 01", name: "블랙베리" },
        { id: "AC'SCENT 02", name: "만다린 오렌지" },
        { id: "AC'SCENT 03", name: "스트로베리" },
        { id: "AC'SCENT 04", name: "베르가못" },
        { id: "AC'SCENT 05", name: "비터 오렌지" },
        { id: "AC'SCENT 06", name: "캐럿" },
        { id: "AC'SCENT 07", name: "로즈" },
        { id: "AC'SCENT 08", name: "튜베로즈" },
        { id: "AC'SCENT 09", name: "오렌지 블라썸" },
        { id: "AC'SCENT 10", name: "튤립" }
      ],
      middle: [
        { id: "AC'SCENT 11", name: "라임" },
        { id: "AC'SCENT 12", name: "은방울꽃" },
        { id: "AC'SCENT 13", name: "유자" },
        { id: "AC'SCENT 14", name: "민트" },
        { id: "AC'SCENT 15", name: "페티그레인" },
        { id: "AC'SCENT 16", name: "샌달우드" },
        { id: "AC'SCENT 17", name: "레몬페퍼" },
        { id: "AC'SCENT 18", name: "핑크페퍼" },
        { id: "AC'SCENT 19", name: "바다소금" },
        { id: "AC'SCENT 20", name: "타임" }
      ],
      base: [
        { id: "AC'SCENT 21", name: "머스크" },
        { id: "AC'SCENT 22", name: "화이트로즈" },
        { id: "AC'SCENT 23", name: "스웨이드" },
        { id: "AC'SCENT 24", name: "이탈리안만다린" },
        { id: "AC'SCENT 25", name: "라벤더" },
        { id: "AC'SCENT 26", name: "이탈리안사이프러스" },
        { id: "AC'SCENT 27", name: "스모키 블렌드 우드" },
        { id: "AC'SCENT 28", name: "레더" },
        { id: "AC'SCENT 29", name: "바이올렛" },
        { id: "AC'SCENT 30", name: "무화과" }
      ]
    }

    // 🧠 수집된 데이터를 AI 분석용 컨텍스트로 변환
    let searchContext = ''
    let libraryContext = ''

    if (movieSearchData || musicSearchData || fragranceKnowledge) {
      searchContext = formatSearchDataForAI(
        movieSearchData || undefined,
        (musicSearchData as any) || undefined, 
        (fragranceKnowledge as any) || undefined
      )
      console.log('📝 검색 컨텍스트 생성 완료 (', searchContext.length, '자)')
    }

    // 추천 풀은 프롬프트에 주입하지 않음 (대용량). 서버에서 풀 기반으로 선별하여 응답에 반영.

    if (libraryInfo) {
      const li = libraryInfo as { music: LibraryInfo[]; movie: LibraryInfo[]; fragrance: LibraryInfo[] }
      libraryContext = formatLibraryInfoForAI(li.music, li.movie, li.fragrance)
      console.log('📚 라이브러리 컨텍스트 생성 완료 (', libraryContext.length, '자)')
    }

    // 검색 데이터에서 확정 메타데이터 선반영
    let forcedMovieYear: string | undefined
    let forcedMovieGenres: string[] | undefined
    let forcedMovieDescription: string | undefined
    try {
      if (movieSearchData) {
        const facts = extractMovieFacts(movieSearchData, data.movieDirector || undefined)
        forcedMovieYear = facts.year
        forcedMovieGenres = facts.genres
        forcedMovieDescription = facts.description
      }
    } catch {}

    const prompt = `
당신은 세계적인 향수 전문가입니다. 20년 이상의 경험을 바탕으로 다음 사용자의 영화/음악 취향을 분석하여 맞춤 향수를 추천해주세요.

**🇰🇷 CRITICAL: 모든 응답은 반드시 한국어로 작성하세요. 절대 영어나 다른 언어를 사용하지 마세요.**

${searchContext ? `${searchContext}\n` : ''}

${libraryContext ? `${libraryContext}\n` : ''}

[사용자 데이터]
선호 영화 장르: ${data.movieGenres?.join(', ') || '정보 없음'}
언급한 영화 제목: ${data.movieTitle || '정보 없음'}
언급한 영화 감독: ${data.movieDirector || '정보 없음'}
영화 예고편 YouTube 링크: ${data.movieTrailerUrl || '정보 없음'}

[음악 정보 분석]
사용자 입력 음악 제목: ${data.musicTitle || '정보 없음'}
사용자 입력 음악 아티스트: ${data.musicArtist || data.extractedMusicArtist || '정보 없음'}
음악 YouTube 링크: ${data.musicYoutubeUrl || '정보 없음'}

선호 향 계열: ${data.likedFragrances?.join(', ') || '정보 없음'}
비선호 향 계열: ${data.dislikedFragrances?.join(', ') || '정보 없음'}
감정적 반응: ${data.emotionalResponse || '정보 없음'}

[영화 정보 분석 규칙]
🚨 **CRITICAL: 분석된 영화 섹션에서는 사용자 입력 정보를 최우선으로 하세요!**

1. **🚨 사용자 입력 정보 절대 우선 원칙**:
   - **영화 제목**: 위의 [사용자 데이터]에서 "언급한 영화 제목"을 100% 그대로 사용. 절대 변경하지 마세요!
   - **감독**: 위의 [사용자 데이터]에서 "언급한 영화 감독"을 100% 그대로 사용. "정보 없음"이 아닌 이상 절대 "미상"으로 바꾸지 마세요!
   - **기본 정보**: 사용자가 제공한 모든 정보를 절대적으로 우선하여 반영

2. **검색 데이터는 보완 목적으로만 사용**:
   - 사용자가 입력하지 않은 정보(출시년도, 장르 등)만 검색 데이터로 보완
   - 사용자 입력과 검색 결과가 다를 경우 **무조건 사용자 입력을 우선**
   - 검색 결과는 줄거리나 분석 내용에만 참고용으로 활용

3. 🎬 **영화 예고편 YouTube 링크 활용**:
   - YouTube 링크가 제공된 경우, 예고편을 통해 파악할 수 있는 다음 정보들을 적극 활용하여 분석의 깊이를 높이세요:
   - **시각적 특성**: 색감, 촬영 기법, 미장센, 장면 구성의 특징
   - **분위기**: 예고편에서 느껴지는 전반적인 톤 & 매너 (어둠, 밝음, 긴장감, 로맨틱 등)
   - **장르적 특성**: 예고편에서 드러나는 장르적 클리셰와 특징들
   - **감정적 어필**: 예고편이 관객에게 유발하려는 감정과 반응
   - **음악적 요소**: 예고편 배경음악이나 사운드 디자인의 특성
   - 이러한 예고편 분석을 바탕으로 향수 추천에 더욱 구체적이고 정확한 감성 매칭을 진행하세요

4. 영화 제목이 제공되지 않은 경우:
   - analyzedMovie는 null로 설정

[음악 정보 분석 규칙]
🚨 **CRITICAL: 분석된 음악 섹션에서는 사용자 입력 정보를 최우선으로 하세요!**

1. **🚨 사용자 입력 정보 절대 우선 원칙**:
   - **음악 제목**: 위의 [음악 정보 분석]에서 "사용자 입력 음악 제목"을 100% 그대로 사용. 절대 변경하지 마세요!
   - **아티스트**: 위의 [음악 정보 분석]에서 "사용자 입력 음악 아티스트"를 100% 그대로 사용. "정보 없음"이 아닌 이상 절대 "미상"으로 바꾸지 마세요!
   - **기본 정보**: 사용자가 제공한 모든 정보를 절대적으로 우선하여 반영

2. **검색 데이터는 보완 목적으로만 사용**:
   - 사용자가 입력하지 않은 정보(앨범명, 발매년도 등)만 검색 데이터로 보완
   - 사용자 입력과 검색 결과가 다를 경우 **무조건 사용자 입력을 우선**
   - 검색 결과는 음악적 분석이나 배경 정보에만 참고용으로 활용

3. 🎵 **음악 YouTube 링크 활용**:
   - YouTube 링크가 제공된 경우, 해당 음악의 다음 특성들을 자세히 분석하세요:
   - **음향적 특성**: 악기 구성, 음색, 음압, 주파수 특성
   - **프로덕션 기법**: 믹싱, 마스터링, 음향 효과 사용
   - **보컬 스타일**: 창법, 감정 표현, 성량과 톤의 특징
   - **리듬 패턴**: BPM, 그루브, 박자감의 특성
   - **하모니 구조**: 코드 진행, 멜로디 라인, 음악적 긴장과 해결
   - **장르적 정체성**: 세부 장르 분류와 음악적 뿌리
   - 이러한 음악적 분석을 바탕으로 향수의 후각적 경험과 연결하여 더욱 정확한 매칭을 진행하세요

4. 사용자 직접 입력 음악 제목만 있는 경우:
   - 해당 곡에 대한 음악적 지식을 바탕으로 분석
   - 모르는 곡인 경우 솔직하게 일반적인 분석 진행

[음악 분석 주의사항]
- 분석된 음악 섹션: 사용자가 입력한 정확한 곡명과 아티스트명 사용
- 영화 감독명이나 "영화 사운드트랙" 같은 잘못된 정보 사용 금지
- OST나 사운드트랙인 경우에도 사용자가 입력한 정보를 우선하되, 실제 가수명 보완 가능

[전문 음악 분석 가이드라인]
당신은 이제 세계적인 음악 비평가이기도 합니다. 다음 항목들을 전문가 수준으로 깊이 있게 분석하세요:

1. 상징 키워드: 해당 음악을 대표하는 5-8개의 핵심 키워드 추출 (장르, 분위기, 감정, 특징적 요소 등)
2. 장르와 특성: 단순한 장르 분류가 아닌, 세부 서브장르, 음악적 뿌리, 독특한 특징
3. 감정선과 분위기: 곡 전체의 감정적 아크, 분위기 변화, 리스너에게 주는 심리적 영향
4. 노래의 주제: 가사와 멜로디가 전달하는 핵심 메시지, 숨겨진 의미, 사회적/개인적 함의
5. 음악적 구성: 편곡, 악기 구성, 리듬 패턴, 하모니 구조, 프로덕션 기법
6. 배경 스토리: 곡의 탄생 배경, 아티스트의 의도, 문화적/역사적 맥락

※ 절대 일반론적이거나 뻔한 분석 금지. 각 곡의 고유한 특성을 파고들어 분석할 것.

[분석 요구사항]
다음 JSON 구조로 정확히 응답해주세요. 절대 마크다운이나 추가 텍스트 없이 순수 JSON만 반환하세요.

**🚨 MANDATORY: 모든 JSON 필드 값은 반드시 한국어로 작성하세요. 영어 응답 절대 금지!**

[영화 분석 가이드라인]
당신은 이제 전문 영화 비평가이기도 합니다. 다음 항목들을 분석하세요:

🎬 **IMPORTANT: 유명한 영화들(Django, Titanic, Avengers, Matrix, 기생충 등)에 대해서는 반드시 정확한 정보를 제공하세요!**
- 감독명, 출시년도, 줄거리는 알고 있는 경우 절대 '미상'으로 표기하지 마세요
- 확실하지 않은 극히 마이너한 영화만 '미상' 처리하세요

1. 상징 키워드: 해당 영화를 대표하는 5-8개의 핵심 키워드 추출
2. 장르 매칭도: 사용자 선호 장르와 선택한 영화의 일치도를 1-10점으로 평가
   - 7점 이상: 매칭됨 (isMatched: true)
   - 6점 이하: 매칭 안됨 (isMatched: false)
   - 구체적인 매칭/불일치 이유 설명
3. 영화적 특성: 시각적 스타일, 연출 기법, 촬영 기법 등 영화만의 특징
4. 감정적 공명도: 이 영화가 관객에게 주는 감정적 임팩트와 여운
5. 핵심 테마: 영화의 주요 메시지, 상징, 철학적 의미

※ 선택한 영화와 선호 장르가 다를 수 있음을 인정하고 솔직하게 분석할 것

[비슷한 영화 추천 규칙 - 고정 풀 전용]
**🚨 검색 금지. 오직 위의 "영화 풀" 항목 중에서만 2편을 선택하세요.**
**⚠️ 제목/감독/연도/장르 값은 풀에 적힌 값을 그대로 사용하세요. 임의 수정 금지.**

선택 기준:
1. 사용자 선호 장르/분석된 영화의 키워드와 풀의 키워드/장르 유사도
2. 감정적 톤/테마 유사성
3. 너무 중복되지 않도록 서로 다른 스펙트럼에서 2편 선택

[비슷한 음악 추천 규칙 - 고정 풀 전용]
**🚨 검색 금지. 오직 위의 "음악 풀" 항목 중에서만 2곡을 선택하세요.**
**⚠️ 제목/아티스트/앨범/연도/장르 값은 풀에 적힌 값을 그대로 사용하세요. 임의 수정 금지.**

선택 기준:
1. 분석된 음악의 키워드/장르/무드와 풀의 키워드/장르 유사도
2. 에너지/감정 톤의 근접성
3. 중복 최소화: 서로 다른 스펙트럼에서 2곡 선택

[향료 데이터베이스]
탑노트 (1-10번): ${JSON.stringify(fragranceData.top)}
미들노트 (11-20번): ${JSON.stringify(fragranceData.middle)}
베이스노트 (21-30번): ${JSON.stringify(fragranceData.base)}

[향수 추천 규칙]
1. 위 향료 데이터베이스에서만 선택하여 3개 조합 생성
   - 탑노트에서 1개
   - 미들노트에서 1개  
   - 베이스노트에서 1개
2. 사용자가 싫어하는 향 계열은 절대 제외
3. 🎬🎵 **YouTube 링크 기반 감성 매칭 강화**:
   - 영화 예고편 YouTube 링크가 있는 경우: 예고편의 시각적 톤, 색감, 분위기를 향료 선택에 반영
   - 음악 YouTube 링크가 있는 경우: 음악의 음향적 특성, 리듬감, 감정적 에너지를 향료 조합에 연결
   - 두 링크 모두 있는 경우: 영화-음악의 시너지를 고려한 더욱 정교한 향수 컨셉 설계
4. 총 2g 기준으로 조향 비율 계산 (예: 0.6g : 0.8g : 0.6g)
5. 영화/음악의 감성에 맞는 매우 감성적이고 시적인 향수 이름 생성

향수 이름 예시:
- "겨울왕국의 빙하 속 꽃" (겨울왕국 영화)
- "어둠 속 붉은 장미의 속삭임" (뱀파이어 영화)
- "태양이 춤추는 지중해의 아침" (맘마미아 영화)
- "달빛에 젖은 비밀의 정원" (미드나잇 인 파리)

[방사형 그래프 척도 계산 규칙 - 향수학 기반 전문 분석]
선택한 3가지 향료(TOP, MIDDLE, BASE)의 향수학적 특성을 종합 분석하여 다음 10가지 전문 척도를 1-10 점수로 계산:

**🌸 향수 구조 분석 척도 (Fragrance Structure Analysis)**

1. **부드러움 (Softness)**: 전체적으로 부드럽고 포근한 정도
   - 높음: 머스크, 바닐라, 파우더리노트, 화이트플로럴 계열
   - 낮음: 스파이시, 레더, 매탈릭 계열

2. **강렬함 (Intensity)**: 향의 강도와 지속력, 실라지 정도  
   - 높음: 인센스, 과이악우드, 레더, 오리스, 동물성 머스크
   - 낮음: 시트러스, 라이트 플로럴, 아쿠아틱 계열

3. **신선함 (Freshness)**: 상쾌하고 깨끗한 워터리/그린 특성
   - 높음: 시트러스, 민트, 바다소금, 오이, 그린리프 계열  
   - 낮음: 헤비우디, 오리엔탈, 고농도 플로럴 계열

4. **따뜻함 (Warmth)**: 포근하고 따스한 오리엔탈 특성
   - 높음: 앰버, 바닐라, 벤조인, 계피, 통카빈 계열
   - 낮음: 멘톨, 아이시노트, 쿨 시트러스 계열

5. **달콤함 (Sweetness)**: 설탕, 꿀, 과일의 달달한 정도
   - 높음: 바닐라, 캐러멜, 프루티, 고우르망 계열
   - 낮음: 드라이우디, 그린, 미네랄 계열

**🌿 향료 계열 분석 척도 (Fragrance Family Analysis)**

6. **우디함 (Woodiness)**: 나무 향의 깊이와 복합성
   - 높음: 샌달우드, 시더우드, 베티버, 패츨리 계열
   - 낮음: 시트러스, 아쿠아틱, 라이트 플로럴 계열

7. **플로럴함 (Florality)**: 꽃향의 풍부함과 여성성
   - 높음: 로즈, 자스민, 튜베로즈, 피오니 계열
   - 낮음: 우디, 스파이시, 미네랄 계열

8. **스파이시함 (Spiciness)**: 향신료의 매콤하고 자극적인 정도
   - 높음: 핑크페퍼, 계피, 정향, 카다멈, 넛맥 계열
   - 낮음: 스위트, 파우더리, 소프트 플로럴 계열

**🎨 조향 예술성 분석 척도 (Perfumery Artistry Analysis)**

9. **깊이감 (Depth)**: 향의 층위와 복합성, 진화 과정
   - 높음: 다층 구조, 시간에 따른 변화, 복합 조향
   - 낮음: 단일 노트, 리니어한 전개

10. **개성감 (Uniqueness)**: 독창성과 기억에 남는 특별함
    - 높음: 희귀 향료, 혁신적 조합, 아방가르드 구성
    - 낮음: 클래식 구성, 대중적 조합

**계산 방법론:**
- 각 향료의 개별 특성 점수 계산 (1-10)
- TOP/MIDDLE/BASE 비율 가중치 적용 (0.3/0.4/0.3)
- 향료 간 시너지 효과 보정 (±1점)
- 최종 점수는 정수로 출력 (1-10)

{
  "analyzedMusic": {
    "title": "🚨 사용자가 입력한 곡명을 그대로 사용 (사용자 입력 우선!) - 한국어로 작성",
    "artist": "🚨 사용자가 입력한 아티스트명을 그대로 사용 (사용자 입력 우선!) - 한국어로 작성",
    "correctionNote": "교정이 있었다면 한국어로 설명, 없으면 null",
    "symbolKeywords": ["음악을 상징하는 핵심 키워드들 5-8개 (한국어로 작성: 장르, 분위기, 감정, 특징 등)"],
    "genre": "세부 장르 분류와 음악적 뿌리를 한국어로 설명 (예: '재즈 퓨전 요소가 가미된 네오소울 힙합')",
    "characteristics": "곡의 독특한 특징과 사운드 정체성을 한국어로 설명 (80자 이내)",
    "emotionalTone": "감정적 아크와 분위기 변화의 전문적 분석을 한국어로 작성 (100자 이내)",
    "theme": "가사와 멜로디의 핵심 메시지, 숨겨진 의미를 한국어로 설명 (100자 이내)",
    "musicalComposition": "편곡, 악기 구성, 리듬 패턴 등 음악적 구성 요소를 한국어로 설명 (120자 이내)",
    "backgroundStory": "곡의 탄생 배경과 문화적 맥락을 한국어로 설명 (100자 이내)"
  },
  "analyzedMovie": {
    "title": "🚨 사용자가 입력한 영화 제목을 그대로 사용 (사용자 입력 우선!) - 한국어로 작성",
    "director": "🚨 사용자가 입력한 감독명을 그대로 사용 (입력 안했으면 '미상') - 한국어로 작성",
    "year": "${forcedMovieYear || '미상'}",
    "genre": ${JSON.stringify(forcedMovieGenres || [])},
    "description": "${(forcedMovieDescription || '미상').replace(/"/g, '\\"')}"
  },
  "movieAnalysis": {
    "symbolKeywords": ["영화를 상징하는 핵심 키워드들 5-8개 (반드시 한국어로 작성)"],
    "genreMatching": {
      "score": "1-10점 매칭 점수",
      "isMatched": "7점 이상이면 true, 6점 이하면 false",
      "explanation": "매칭/불일치 이유를 한국어로 구체적 설명 (100자 이내)"
    },
    "cinematicFeatures": "영화의 시각적/연출적 특징을 한국어로 분석 (120자 이내)",
    "emotionalResonance": "관객에게 주는 감정적 임팩트와 여운을 한국어로 설명 (100자 이내)",
    "coreThemes": "영화의 핵심 메시지와 상징적 의미를 한국어로 설명 (100자 이내)"
  },
  "fragranceRecommendations": [
    {
      "name": "실제 향수명 (한국어로 작성)",
      "brand": "실제 브랜드명 (한국어로 작성)",
      "fragranceFamily": "향 계열을 한국어로 작성 (플로럴, 우디, 오리엔탈 등)",
      "topNotes": ["탑노트1을 한국어로", "탑노트2를 한국어로", "탑노트3을 한국어로"],
      "middleNotes": ["미들노트1을 한국어로", "미들노트2를 한국어로", "미들노트3을 한국어로"],
      "baseNotes": ["베이스노트1을 한국어로", "베이스노트2를 한국어로", "베이스노트3을 한국어로"],
      "personality": "이 향수가 표현하는 느낌을 한국어로 설명 (40자 이내)",
      "situation": "추천 상황을 한국어로 설명 (30자 이내)",
      "season": "추천 계절을 한국어로 설명 (20자 이내)",
      "reasonForRecommendation": "추천 이유와 취향 매칭을 한국어로 설명 (100자 이내)",
      "psychologicalMatch": "취향 일치도를 한국어로 설명 (80자 이내)",
      "customPerfumeName": "영화/음악 감성에 맞는 매우 시적이고 감성적인 한국어 향수 이름",
      "fragranceRecipe": {
        "topNote": {
          "id": "AC'SCENT XX 형식의 ID",
          "name": "향료 이름",
          "ratio": "g 단위 숫자 (소수점 1자리)"
        },
        "middleNote": {
          "id": "AC'SCENT XX 형식의 ID",
          "name": "향료 이름", 
          "ratio": "g 단위 숫자 (소수점 1자리)"
        },
        "baseNote": {
          "id": "AC'SCENT XX 형식의 ID",
          "name": "향료 이름",
          "ratio": "g 단위 숫자 (소수점 1자리)"
        }
      },
      "radarChart": {
        "부드러움": "1-10 점수 (정수) - 부드럽고 포근한 정도",
        "강렬함": "1-10 점수 (정수) - 향의 강도와 지속력",
        "신선함": "1-10 점수 (정수) - 상쾌하고 깨끗한 정도",
        "따뜻함": "1-10 점수 (정수) - 포근하고 따스한 정도",
        "달콤함": "1-10 점수 (정수) - 달달한 스위트 정도",
        "우디함": "1-10 점수 (정수) - 나무 향의 깊이",
        "플로럴함": "1-10 점수 (정수) - 꽃향의 풍부함",
        "스파이시함": "1-10 점수 (정수) - 향신료의 매콤함",
        "깊이감": "1-10 점수 (정수) - 향의 층위와 복합성",
        "개성감": "1-10 점수 (정수) - 독창성과 특별함"
      }
    }
  ],
  "movieRecommendations": [
    {
      "title": "실존하는 추천 영화 제목 1 (한국어로 작성)",
      "director": "정확한 감독명 (한국어로 작성)",
      "year": "정확한 출시년도",
      "genre": "장르 (한국어로 작성)",
      "reason": "추천 이유를 한국어로 설명 (80자 이내)",
      "poster": "영화를 상징하는 이모지 1개"
    },
    {
      "title": "실존하는 추천 영화 제목 2 (한국어로 작성)",
      "director": "정확한 감독명 (한국어로 작성)",
      "year": "정확한 출시년도",
      "genre": "장르 (한국어로 작성)",
      "reason": "추천 이유를 한국어로 설명 (80자 이내)",
      "poster": "영화를 상징하는 이모지 1개"
    }
  ],
  "musicRecommendations": [
    {
      "title": "🚨 사용자 입력 곡(${data.musicTitle})과 완전히 다른 실존하는 추천 곡 제목 1 (한국어로 작성)",
      "artist": "🚨 사용자 입력 아티스트(${data.musicArtist || data.extractedMusicArtist})와 완전히 다른 정확한 아티스트명 (한국어로 작성)",
      "album": "정확한 앨범명 (한국어로 작성)",
      "reason": "추천 이유를 한국어로 설명 (80자 이내)",
      "emoji": "음악을 상징하는 이모지 1개"
    },
    {
      "title": "🚨 사용자 입력 곡(${data.musicTitle})과 완전히 다른 실존하는 추천 곡 제목 2 (한국어로 작성)",
      "artist": "🚨 사용자 입력 아티스트(${data.musicArtist || data.extractedMusicArtist})와 완전히 다른 정확한 아티스트명 (한국어로 작성)",
      "album": "정확한 앨범명 (한국어로 작성)",
      "reason": "추천 이유를 한국어로 설명 (80자 이내)",
      "emoji": "음악을 상징하는 이모지 1개"
    }
  ],
  "lifestyleAdvice": {
    "dailyRoutine": "일상 루틴 조언 (50자 이내)",
    "socialInteraction": "사회적 관계 조언 (50자 이내)",
    "personalGrowth": "개인 성장 조언 (50자 이내)",
    "fragranceUsage": "향수 사용법 조언 (50자 이내)"
  }
}
`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 6000, // 추가 컨텍스트로 인해 토큰 수 증가
      }
    })

    console.log('🤖 Gemini AI 분석 시작... (프롬프트 길이:', prompt.length, '자)')

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    // 제미나이 응답 디버깅
    console.log('=== 제미나이 응답 디버깅 ===')
    console.log('Raw response:', analysisText.substring(0, 500) + '...')
    console.log('Response length:', analysisText.length)
    console.log('Search data used:', {
      movieData: !!movieSearchData,
      musicData: !!musicSearchData,
      fragranceKnowledge: !!fragranceKnowledge,
      libraryInfo: !!libraryInfo
    })
    console.log('==========================')

    // JSON 파싱 시도
    let analysisResult: AnalysisResult
    try {
      // JSON 응답에서 불필요한 문자 제거
      const cleanedResponse = analysisText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
      
      analysisResult = JSON.parse(cleanedResponse)
      
      // 분석 결과의 음악 정보 디버깅
      console.log('=== 분석된 음악 정보 ===')
      console.log('제미나이 분석 결과:', analysisResult.analyzedMusic)
      console.log('========================')
      
      // 분석 결과의 영화 정보 디버깅
      if (analysisResult.analyzedMovie) {
        console.log('=== 분석된 영화 정보 ===')
        console.log('제미나이 분석 결과:', analysisResult.analyzedMovie)
        console.log('========================')
      }
      // 미상 보정: 검색에서 확보한 메타데이터로 보강
      if (analysisResult.analyzedMovie) {
        try {
          const facts = movieSearchData ? extractMovieFacts(movieSearchData, data.movieDirector || undefined) : undefined
          if (facts) {
            if ((!analysisResult.analyzedMovie.year || analysisResult.analyzedMovie.year === '미상') && facts.year) {
              analysisResult.analyzedMovie.year = facts.year
            }
            if ((analysisResult.analyzedMovie.genre?.length ?? 0) === 0 && facts.genres?.length) {
              analysisResult.analyzedMovie.genre = facts.genres
            }
            if ((!analysisResult.analyzedMovie.description || analysisResult.analyzedMovie.description === '미상') && facts.description) {
              analysisResult.analyzedMovie.description = facts.description
            }
          }
        } catch (e) {
          console.warn('미상 보정 중 오류', e)
        }
      }
      
      // 🎵 웹 기반 재검색 제거 (고정 풀만 사용)

      // 하드코딩 풀 기반 서버 측 유사 추천 산출 (2개씩)
      try {
        const moviePicks = pickSimilarMoviesFromPool(
          recoMovies as RecoMovieItem[],
          {
            preferredGenres: data.movieGenres,
            analyzedMovieGenres: analysisResult.analyzedMovie?.genre,
            analyzedMovieKeywords: analysisResult.movieAnalysis?.symbolKeywords,
            excludeTitle: analysisResult.analyzedMovie?.title
          }
        )
        analysisResult.movieRecommendations = moviePicks.map(mapMovieItemToResponse)
        // 각 항목별 추천 사유 생성 (JSON {"reason":"..."})
        const reasonModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { temperature: 0.5, maxOutputTokens: 120 } })
        const sanitize = (s: string) => s.replace(/```json|```/g, '').trim()
        const parseReason = (text: string): string | null => {
          try { const obj = JSON.parse(sanitize(text)); const r = typeof obj?.reason === 'string' ? obj.reason.trim() : ''; return r || null } catch { return null }
        }
        for (let i = 0; i < analysisResult.movieRecommendations.length; i++) {
          const rec = analysisResult.movieRecommendations[i]
          const rp = `다음 정보를 참고하여 이 영화를 추천한 간결한 이유 1~2문장을 생성하세요. 반드시 한국어 JSON 한 줄: {"reason":"..."}.

[분석된 영화]
제목: ${analysisResult.analyzedMovie?.title || '없음'}
감독: ${analysisResult.analyzedMovie?.director || '없음'}
장르: ${(analysisResult.analyzedMovie?.genre || []).join(', ')}
키워드: ${(analysisResult.movieAnalysis?.symbolKeywords || []).join(', ')}

[추천 영화]
제목: ${rec.title}
감독: ${rec.director}
장르: ${rec.genre}
규칙: 사실만, 과장 금지, 1~2문장, 마침표 포함.`
          try {
            const rr = await reasonModel.generateContent(rp)
            const reason = parseReason(rr.response.text())
            if (reason) rec.reason = reason
          } catch {}
        }
      } catch (e) {
        console.warn('영화 유사 추천 산출 실패:', e)
      }

      try {
        const musicPicks = pickSimilarMusicFromPool(
          recoMusic as RecoMusicItem[],
          {
            analyzedMusicGenre: analysisResult.analyzedMusic?.genre,
            analyzedMusicKeywords: analysisResult.analyzedMusic?.symbolKeywords,
            excludeTitle: analysisResult.analyzedMusic?.title,
            excludeArtist: analysisResult.analyzedMusic?.artist
          }
        )
        analysisResult.musicRecommendations = musicPicks.map(mapMusicItemToResponse)
        const reasonModel2 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { temperature: 0.5, maxOutputTokens: 120 } })
        const sanitize2 = (s: string) => s.replace(/```json|```/g, '').trim()
        const parseReason2 = (text: string): string | null => { try { const obj = JSON.parse(sanitize2(text)); const r = typeof obj?.reason === 'string' ? obj.reason.trim() : ''; return r || null } catch { return null } }
        for (let i = 0; i < analysisResult.musicRecommendations.length; i++) {
          const rec = analysisResult.musicRecommendations[i]
          const rp = `다음 정보를 참고하여 이 곡을 추천한 간결한 이유 1~2문장을 생성하세요. 반드시 한국어 JSON 한 줄: {"reason":"..."}.

[분석된 음악]
제목: ${analysisResult.analyzedMusic?.title}
아티스트: ${analysisResult.analyzedMusic?.artist}
장르: ${analysisResult.analyzedMusic?.genre}
키워드: ${(analysisResult.analyzedMusic?.symbolKeywords || []).join(', ')}

[추천 음악]
제목: ${rec.title}
아티스트: ${rec.artist}
앨범: ${rec.album}
규칙: 사실만, 과장 금지, 1~2문장, 마침표 포함.`
          try {
            const rr = await reasonModel2.generateContent(rp)
            const reason = parseReason2(rr.response.text())
            if (reason) rec.reason = reason
          } catch {}
        }
      } catch (e) {
        console.warn('음악 유사 추천 산출 실패:', e)
      }
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError)
      console.error('응답 텍스트:', analysisText)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI 응답 형식 오류가 발생했습니다. 다시 시도해주세요.',
          debug: analysisText.substring(0, 500)
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      analysis: analysisResult
    })

  } catch (error) {
    console.error('=== Gemini API 상세 오류 ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Full error object:', error)
    console.error('API Key exists:', !!process.env.GEMINI_API_KEY)
    console.error('API Key length:', process.env.GEMINI_API_KEY?.length || 0)
    console.error('========================')
    
    return NextResponse.json(
      { 
        success: false, 
        error: '취향 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        debug: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : String(error),
          hasApiKey: !!process.env.GEMINI_API_KEY
        } : undefined
      },
      { status: 500 }
    )
  }
}