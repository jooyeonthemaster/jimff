/**
 * Context7을 활용한 라이브러리 및 기술 문서 수집 서비스
 * 음악/영화 분석에 도움이 될 수 있는 전문 라이브러리 정보를 수집
 */

export interface LibraryInfo {
  name: string
  description: string
  documentation: string
}

/**
 * 음악 분석 관련 라이브러리 정보 수집
 */
export async function getMusicAnalysisLibraries(): Promise<LibraryInfo[]> {
  const musicLibraries = [
    'spotify-web-api-js',
    'musictheory',
    'tone',
    'essentia.js',
    'meyda'
  ]

  const libraryInfos: LibraryInfo[] = []

  // 실제 Context7 MCP 도구가 있다면 사용, 없으면 기본 정보 제공
  for (const library of musicLibraries) {
    try {
      // Context7 호출 시뮬레이션 (실제로는 MCP 도구 호출)
      const info = await getMockLibraryInfo(library)
      if (info) {
        libraryInfos.push(info)
      }
    } catch (error) {
      console.error(`라이브러리 ${library} 정보 수집 실패:`, error)
    }
  }

  return libraryInfos
}

/**
 * 영화 분석 관련 라이브러리 정보 수집
 */
export async function getMovieAnalysisLibraries(): Promise<LibraryInfo[]> {
  const movieLibraries = [
    'movie-trailer',
    'imdb-api',
    'themoviedb',
    'cinemagoer'
  ]

  const libraryInfos: LibraryInfo[] = []

  for (const library of movieLibraries) {
    try {
      const info = await getMockLibraryInfo(library)
      if (info) {
        libraryInfos.push(info)
      }
    } catch (error) {
      console.error(`라이브러리 ${library} 정보 수집 실패:`, error)
    }
  }

  return libraryInfos
}

/**
 * 향수/화학 분석 관련 라이브러리 정보 수집
 */
export async function getFragranceAnalysisLibraries(): Promise<LibraryInfo[]> {
  const fragranceLibraries = [
    'rdkit',
    'openmolecules',
    'chemistry-js'
  ]

  const libraryInfos: LibraryInfo[] = []

  for (const library of fragranceLibraries) {
    try {
      const info = await getMockLibraryInfo(library)
      if (info) {
        libraryInfos.push(info)
      }
    } catch (error) {
      console.error(`라이브러리 ${library} 정보 수집 실패:`, error)
    }
  }

  return libraryInfos
}

/**
 * 실제 Context7 MCP 도구 대신 사용할 모의 함수
 * 실제 구현에서는 이 부분을 Context7 MCP 도구 호출로 대체
 */
async function getMockLibraryInfo(libraryName: string): Promise<LibraryInfo | null> {
  // 기본적인 라이브러리 정보 데이터베이스
  const libraryDatabase: Record<string, LibraryInfo> = {
    'spotify-web-api-js': {
      name: 'Spotify Web API JS',
      description: 'Spotify의 Web API를 JavaScript에서 쉽게 사용할 수 있게 해주는 라이브러리. 음악 메타데이터, 오디오 특성, 인기도 등을 분석할 수 있습니다.',
      documentation: 'Spotify API를 통해 트랙의 danceability, energy, valence, tempo 등의 오디오 특성을 분석할 수 있어 음악의 감정적 특성을 정량화할 수 있습니다.'
    },
    'musictheory': {
      name: 'Music Theory JS',
      description: '음악 이론을 JavaScript로 구현한 라이브러리. 화성, 스케일, 코드 진행 등을 분석할 수 있습니다.',
      documentation: '음악의 조성, 화성 진행, 멜로디 패턴을 분석하여 음악의 감정적 색깔과 구조적 특성을 파악할 수 있습니다.'
    },
    'tone': {
      name: 'Tone.js',
      description: '웹 오디오 API를 위한 프레임워크. 실시간 오디오 분석 및 시각화가 가능합니다.',
      documentation: 'FFT 분석, 스펙트럼 분석을 통해 음악의 주파수 특성과 음색을 분석할 수 있어 향수의 노트 특성과 연결할 수 있습니다.'
    },
    'essentia.js': {
      name: 'Essentia.js',
      description: '음악 정보 검색을 위한 오디오 분석 라이브러리. 고급 오디오 특성 추출이 가능합니다.',
      documentation: '음악의 BPM, 키, 모드, 스펙트럴 특성 등을 추출하여 음악의 복합적인 특성을 분석할 수 있습니다.'
    },
    'meyda': {
      name: 'Meyda',
      description: '실시간 오디오 특성 추출 라이브러리. 웹에서 동작하는 오디오 분석 도구입니다.',
      documentation: 'MFCC, 스펙트럴 특성, 리듬 특성 등을 실시간으로 추출하여 음악의 감정적 프로파일을 생성할 수 있습니다.'
    },
    'movie-trailer': {
      name: 'Movie Trailer API',
      description: '영화 예고편 정보를 가져오는 라이브러리. YouTube 예고편 링크와 메타데이터를 제공합니다.',
      documentation: '영화의 시각적 특성과 예고편의 편집 스타일을 분석하여 영화의 감정적 톤을 파악할 수 있습니다.'
    },
    'imdb-api': {
      name: 'IMDB API',
      description: 'IMDB 데이터베이스에서 영화 정보를 가져오는 라이브러리. 평점, 리뷰, 장르 등의 정보를 제공합니다.',
      documentation: '영화의 장르, 감독 스타일, 관객 반응 등을 분석하여 영화의 감정적 프로파일과 향수 추천에 활용할 수 있습니다.'
    },
    'themoviedb': {
      name: 'The Movie DB API',
      description: '종합적인 영화 데이터베이스 API. 상세한 영화 정보와 이미지를 제공합니다.',
      documentation: '영화의 테마, 분위기, 색상 팔레트 등을 분석하여 향수의 노트 조합과 연결할 수 있는 데이터를 제공합니다.'
    },
    'cinemagoer': {
      name: 'Cinemagoer',
      description: 'IMDB 데이터를 Python으로 추출하는 라이브러리. 영화의 상세 정보와 분석 데이터를 제공합니다.',
      documentation: '영화의 스토리텔링 구조, 캐릭터 분석, 영화 기법 등을 분석하여 향수 추천의 심리적 기반을 제공합니다.'
    },
    'rdkit': {
      name: 'RDKit',
      description: '화학정보학을 위한 오픈소스 라이브러리. 분자 구조와 특성을 분석할 수 있습니다.',
      documentation: '향료의 분자 구조를 분석하여 후각적 특성과 감정적 반응을 예측할 수 있어 과학적인 향수 추천에 활용됩니다.'
    },
    'openmolecules': {
      name: 'OpenMolecules',
      description: '분자 시각화 및 분석을 위한 JavaScript 라이브러리입니다.',
      documentation: '향료 분자의 3D 구조와 특성을 시각화하여 향의 특성과 조합 가능성을 분석할 수 있습니다.'
    },
    'chemistry-js': {
      name: 'Chemistry.js',
      description: '화학 계산과 분자 특성 분석을 위한 JavaScript 라이브러리입니다.',
      documentation: '향료의 화학적 특성을 계산하여 조향 시 상호작용과 지속성을 예측할 수 있습니다.'
    }
  }

  return libraryDatabase[libraryName] || null
}

/**
 * 수집된 라이브러리 정보를 AI 분석용 컨텍스트로 변환
 */
export function formatLibraryInfoForAI(
  musicLibraries: LibraryInfo[],
  movieLibraries: LibraryInfo[],
  fragranceLibraries: LibraryInfo[]
): string {
  let context = `## 전문 분석 도구 및 라이브러리 정보\n\n`

  if (musicLibraries.length > 0) {
    context += `### 🎵 음악 분석 전문 도구들\n\n`
    musicLibraries.forEach(lib => {
      context += `**${lib.name}**: ${lib.description}\n`
      context += `분석 활용: ${lib.documentation}\n\n`
    })
  }

  if (movieLibraries.length > 0) {
    context += `### 🎬 영화 분석 전문 도구들\n\n`
    movieLibraries.forEach(lib => {
      context += `**${lib.name}**: ${lib.description}\n`
      context += `분석 활용: ${lib.documentation}\n\n`
    })
  }

  if (fragranceLibraries.length > 0) {
    context += `### 🧪 향수/화학 분석 전문 도구들\n\n`
    fragranceLibraries.forEach(lib => {
      context += `**${lib.name}**: ${lib.description}\n`
      context += `분석 활용: ${lib.documentation}\n\n`
    })
  }

  context += `\n위의 전문 도구들의 분석 방법론을 참고하여 과학적이고 체계적인 분석을 진행해주세요.\n\n`

  return context
}

/**
 * 모든 관련 라이브러리 정보 수집
 */
export async function getAllRelevantLibraries(): Promise<{
  music: LibraryInfo[]
  movie: LibraryInfo[]
  fragrance: LibraryInfo[]
}> {
  try {
    const [musicLibraries, movieLibraries, fragranceLibraries] = await Promise.all([
      getMusicAnalysisLibraries(),
      getMovieAnalysisLibraries(),
      getFragranceAnalysisLibraries()
    ])

    return {
      music: musicLibraries,
      movie: movieLibraries,
      fragrance: fragranceLibraries
    }
  } catch (error) {
    console.error('라이브러리 정보 수집 중 오류:', error)
    return {
      music: [],
      movie: [],
      fragrance: []
    }
  }
}
