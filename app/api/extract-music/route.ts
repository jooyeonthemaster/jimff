import { NextRequest, NextResponse } from 'next/server';

interface YouTubeVideoData {
  title: string;
  artist: string;
  description: string;
  publishedAt: string;
}

// YouTube URL에서 비디오 ID 추출 함수
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// 제목에서 아티스트와 곡제목 분리 함수
function parseArtistAndTitle(title: string): { artist: string; title: string } {
  // 일반적인 패턴들
  const patterns = [
    /^(.+?)\s*[-–—]\s*(.+)$/, // "Artist - Song"
    /^(.+?)\s*:\s*(.+)$/, // "Artist: Song"
    /^(.+?)\s*\|\s*(.+)$/, // "Artist | Song"
    /^(.+?)\s*by\s+(.+)$/i, // "Song by Artist"
    /^(.+?)\s*\(\s*(.+?)\s*\)$/, // "Song (Artist)"
    /^(.+?)\s*\[\s*(.+?)\s*\]$/, // "Song [Artist]"
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const [, first, second] = match;
      
      // "Song by Artist" 패턴인 경우 순서를 바꿈
      if (pattern.toString().includes('by')) {
        return {
          artist: second.trim(),
          title: first.trim()
        };
      }
      
      return {
        artist: first.trim(),
        title: second.trim()
      };
    }
  }

  // 패턴이 매칭되지 않으면 전체를 곡제목으로 사용
  return {
    artist: '',
    title: title.trim()
  };
}

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json();

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL이 필요합니다.' },
        { status: 400 }
      );
    }

    // YouTube URL에서 비디오 ID 추출
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: '유효하지 않은 YouTube URL입니다.' },
        { status: 400 }
      );
    }

    // YouTube Data API 키 확인
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // YouTube Data API v3로 비디오 정보 가져오기
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData);
      return NextResponse.json(
        { error: 'YouTube API 요청에 실패했습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: '해당 비디오를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const videoInfo = data.items[0].snippet;
    const { artist, title } = parseArtistAndTitle(videoInfo.title);

    const result: YouTubeVideoData = {
      title: title || videoInfo.title,
      artist: artist || videoInfo.channelTitle,
      description: videoInfo.description || '',
      publishedAt: videoInfo.publishedAt
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Extract music error:', error);
    return NextResponse.json(
      { error: '음악 정보 추출 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 