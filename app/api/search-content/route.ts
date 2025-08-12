import { NextRequest, NextResponse } from 'next/server'
import { 
  searchMovieData, 
  searchMusicData, 
  searchMusicFromYouTube, 
  searchFragranceKnowledge 
} from '../../services/searchService'
import { getAllRelevantLibraries } from '../../services/contextService'

interface SearchRequest {
  type: 'movie' | 'music' | 'youtube' | 'fragrance' | 'all'
  query?: string
  youtubeUrl?: string
  artist?: string
}

export async function POST(request: NextRequest) {
  try {
    const { type, query, youtubeUrl, artist }: SearchRequest = await request.json()

    console.log(`🔍 검색 요청: ${type}`, { query, youtubeUrl, artist })

    const results: any = {}

    switch (type) {
      case 'movie':
        if (!query) {
          return NextResponse.json(
            { success: false, error: '영화 제목이 필요합니다.' },
            { status: 400 }
          )
        }
        results.movieData = await searchMovieData(query)
        break

      case 'music':
        if (!query) {
          return NextResponse.json(
            { success: false, error: '음악 제목이 필요합니다.' },
            { status: 400 }
          )
        }
        results.musicData = await searchMusicData(query, artist)
        break

      case 'youtube':
        if (!youtubeUrl) {
          return NextResponse.json(
            { success: false, error: 'YouTube URL이 필요합니다.' },
            { status: 400 }
          )
        }
        results.musicData = await searchMusicFromYouTube(youtubeUrl)
        break

      case 'fragrance':
        results.fragranceKnowledge = await searchFragranceKnowledge()
        break

      case 'all':
        const searchPromises = []
        
        if (query) {
          searchPromises.push(
            searchMovieData(query).then(data => { results.movieData = data })
          )
          searchPromises.push(
            searchMusicData(query, artist).then(data => { results.musicData = data })
          )
        }

        if (youtubeUrl) {
          searchPromises.push(
            searchMusicFromYouTube(youtubeUrl).then(data => { results.musicData = data })
          )
        }

        searchPromises.push(
          searchFragranceKnowledge().then(data => { results.fragranceKnowledge = data })
        )

        searchPromises.push(
          getAllRelevantLibraries().then(data => { results.libraryInfo = data })
        )

        await Promise.allSettled(searchPromises)
        break

      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 검색 타입입니다.' },
          { status: 400 }
        )
    }

    console.log(`✅ 검색 완료: ${type}`)

    return NextResponse.json({
      success: true,
      data: results,
      searchType: type,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('검색 API 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '검색 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const query = searchParams.get('query')
  const youtubeUrl = searchParams.get('youtubeUrl')
  const artist = searchParams.get('artist')

  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, query, youtubeUrl, artist })
  }))
}
