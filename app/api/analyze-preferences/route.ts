import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface PreferenceData {
  movieGenres: string[]
  musicTitle: string
  musicArtist: string
  youtubeLink: string
  likedFragrances: string[]
  dislikedFragrances: string[]
  musicMeaning: string
  movieMeaning: string
  personalDescription: string
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
}

interface AnalysisResult {
  personalityAnalysis: {
    corePersonality: string
    emotionalDepth: string
    socialTendency: string
    aestheticPreference: string
    lifestylePattern: string
  }
  movieAnalysis: {
    psychologicalDriver: string
    emotionalNeeds: string
    cognitiveStyle: string
    escapismPattern: string
  }
  musicAnalysis: {
    emotionalResonance: string
    memoryAssociation: string
    energyAlignment: string
    identityExpression: string
  }
  fragranceRecommendations: FragranceRecommendation[]
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

    const prompt = `
당신은 세계적인 향수 전문가이자 심리 분석가입니다. 20년 이상의 경험을 바탕으로 다음 사용자의 깊이 있는 분석을 진행해주세요.

[사용자 데이터]
선호 영화 장르: ${data.movieGenres?.join(', ') || '정보 없음'}
좋아하는 음악: ${data.musicTitle ? `${data.musicTitle} - ${data.musicArtist}` : '정보 없음'}
선호 향 계열: ${data.likedFragrances?.join(', ') || '정보 없음'}
비선호 향 계열: ${data.dislikedFragrances?.join(', ') || '정보 없음'}
음악의 개인적 의미: ${data.musicMeaning || '정보 없음'}
영화 장르의 개인적 의미: ${data.movieMeaning || '정보 없음'}
자기 표현: ${data.personalDescription || '정보 없음'}

[분석 요구사항]
다음 JSON 구조로 정확히 응답해주세요. 절대 마크다운이나 추가 텍스트 없이 순수 JSON만 반환하세요.

영화 장르 분석 시 고려사항:
- 코미디: 사회적 연결 욕구, 긍정적 에너지 추구, 스트레스 해소 패턴
- 로맨스: 감정적 깊이, 이상화 경향, 인간관계에 대한 믿음
- 공포/스릴러: 아드레날린 추구, 통제 욕구, 현실 도피 성향
- 판타지/SF: 상상력, 현실 불만족, 미래 지향적 사고
- 뮤지컬: 감성적 표현 욕구, 예술적 성향, 집단 소속감
- 느와르/갱스터: 복잡성 추구, 도덕적 모호함 수용, 권력에 대한 관심

음악 분석 시 고려사항:
- 장르별 심리적 특성 (팝, 록, 발라드, 힙합, 클래식 등)
- 가사의 감정적 메시지
- 리듬과 멜로디가 주는 에너지
- 개인적 기억과의 연관성
- 정체성 표현 방식

향수 추천 시 고려사항:
- 사용자가 싫어하는 향 계열은 절대 제외
- 심리적 성향과 향의 화학적 특성 매칭
- 실제 존재하는 유명 향수 브랜드와 제품명 사용
- 계절감과 상황적 적합성
- 개인의 라이프스타일과의 조화

{
  "personalityAnalysis": {
    "corePersonality": "핵심 성격 특성 (50자 이내)",
    "emotionalDepth": "감정적 깊이와 처리 방식 (60자 이내)", 
    "socialTendency": "사회적 성향과 관계 패턴 (60자 이내)",
    "aestheticPreference": "미적 취향과 감각적 선호 (60자 이내)",
    "lifestylePattern": "라이프스타일 패턴과 가치관 (60자 이내)"
  },
  "movieAnalysis": {
    "psychologicalDriver": "영화 선택의 심리적 동기 (80자 이내)",
    "emotionalNeeds": "영화를 통해 충족하려는 감정적 욕구 (80자 이내)",
    "cognitiveStyle": "인지 스타일과 정보 처리 방식 (80자 이내)",
    "escapismPattern": "현실 도피 패턴과 이상향 (80자 이내)"
  },
  "musicAnalysis": {
    "emotionalResonance": "음악과의 감정적 공명 양상 (80자 이내)",
    "memoryAssociation": "기억과 음악의 연관성 패턴 (80자 이내)",
    "energyAlignment": "음악 에너지와 개인 에너지의 정렬 (80자 이내)",
    "identityExpression": "음악을 통한 정체성 표현 방식 (80자 이내)"
  },
  "fragranceRecommendations": [
    {
      "name": "실제 향수명",
      "brand": "실제 브랜드명",
      "fragranceFamily": "향 계열 (플로럴, 우디, 오리엔탈 등)",
      "topNotes": ["탑노트1", "탑노트2", "탑노트3"],
      "middleNotes": ["미들노트1", "미들노트2", "미들노트3"],
      "baseNotes": ["베이스노트1", "베이스노트2", "베이스노트3"],
      "personality": "이 향수가 표현하는 성격 (40자 이내)",
      "situation": "추천 상황 (30자 이내)",
      "season": "추천 계절 (20자 이내)",
      "reasonForRecommendation": "추천 이유와 심리적 매칭 (100자 이내)",
      "psychologicalMatch": "심리적 일치도 설명 (80자 이내)"
    }
  ],
  "lifestyleAdvice": {
    "dailyRoutine": "일상 루틴에 대한 조언 (100자 이내)",
    "socialInteraction": "사회적 상호작용 방식 조언 (100자 이내)",
    "personalGrowth": "개인 성장을 위한 제안 (100자 이내)",
    "fragranceUsage": "향수 사용법과 타이밍 조언 (100자 이내)"
  }
}
`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      }
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    // JSON 파싱 시도
    let analysisResult: AnalysisResult
    try {
      // JSON 응답에서 불필요한 문자 제거
      const cleanedResponse = analysisText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()
      
      analysisResult = JSON.parse(cleanedResponse)
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
    console.error('Gemini API 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '취향 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
      },
      { status: 500 }
    )
  }
}