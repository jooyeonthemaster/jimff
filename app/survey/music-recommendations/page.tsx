'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SurveyLayout from '../../components/SurveyLayout'
import RadarChart from '../../components/RadarChart'

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
  customPerfumeName: string
  fragranceRecipe: {
    topNote: {
      id: string
      name: string
      ratio: number
    }
    middleNote: {
      id: string
      name: string
      ratio: number
    }
    baseNote: {
      id: string
      name: string
      ratio: number
    }
  }
  radarChart: {
    부드러움: number
    강렬함: number
    신선함: number
    따뜻함: number
    달콤함: number
    우디함: number
    플로럴함: number
    스파이시함: number
    깊이감: number
    개성감: number
  }
}

interface AnalysisResult {
  analyzedMusic: {
    title: string
    artist: string
    correctionNote?: string
    genre: string
    characteristics: string
    emotionalTone: string
    theme: string
    musicalComposition: string
    backgroundStory: string
    symbolKeywords?: string[]
  }
  analyzedMovie?: {
    title: string
    director: string
    year?: string
    genre: string[]
    description: string
  }
  movieAnalysis: {
    symbolKeywords: string[]
    genreMatching: {
      score: number
      isMatched: boolean
      explanation: string
    }
    cinematicFeatures: string
    emotionalResonance: string
    coreThemes: string
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

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  return (
    <div 
      className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-500 ${className}`}
      style={{
        transform: 'perspective(1000px) rotateX(2deg) translateZ(10px)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(139, 92, 246, 0.1)',
        animationDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

interface SectionHeaderProps {
  icon: string
  title: string
  subtitle: string
}

function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center space-y-2 mb-8">
      <div 
        className="text-4xl"
        style={{ 
          transform: 'perspective(300px) rotateY(10deg)',
          filter: 'drop-shadow(0 5px 15px rgba(139, 92, 246, 0.3))'
        }}
      >
        {icon}
      </div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-white/70 text-sm">{subtitle}</p>
    </div>
  )
}

interface FragranceCardProps {
  fragrance: FragranceRecommendation
  index: number
}

function FragranceCard({ fragrance, index }: FragranceCardProps) {
  const seasonEmoji = {
    '봄': '🌸',
    '여름': '☀️', 
    '가을': '🍂',
    '겨울': '❄️',
    '사계절': '🌿'
  }

  const familyColor = {
    '플로럴': 'from-pink-500 to-rose-500',
    '우디': 'from-amber-600 to-orange-600',
    '시트러스': 'from-yellow-400 to-orange-400',
    '오리엔탈': 'from-purple-600 to-indigo-600',
    '프레시': 'from-green-400 to-teal-400',
    '스파이시': 'from-red-500 to-orange-500',
    '머스크': 'from-gray-400 to-slate-500',
    '바닐라': 'from-amber-400 to-yellow-500',
    '아쿠아틱': 'from-blue-400 to-cyan-400',
    '파우더리': 'from-purple-300 to-pink-300'
  }

  const getSeasonEmoji = (season: string) => {
    const key = Object.keys(seasonEmoji).find(s => season.includes(s))
    return key ? seasonEmoji[key as keyof typeof seasonEmoji] : '🌿'
  }

  const getFamilyColor = (family: string) => {
    const key = Object.keys(familyColor).find(f => family.includes(f))
    return key ? familyColor[key as keyof typeof familyColor] : 'from-purple-500 to-blue-500'
  }

  return (
    <AnimatedCard delay={index * 200}>
      <div className="space-y-6">
        {/* 커스텀 향수 이름 */}
        {fragrance.customPerfumeName && (
          <div className="text-center space-y-4">
            <div 
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent"
              style={{ 
                transform: 'perspective(300px) rotateX(5deg)',
                textShadow: '0 0 30px rgba(139, 92, 246, 0.3)'
              }}
            >
              &ldquo;{fragrance.customPerfumeName}&rdquo;
            </div>
            
            {/* 조향 레시피 */}
            {fragrance.fragranceRecipe && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="text-purple-300 text-sm font-medium mb-4 text-center">조향 레시피 (총 2g)</div>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-xs text-pink-300 mb-1">TOP</div>
                    <div className="bg-pink-500/10 border border-pink-400/30 rounded-lg p-3">
                      <div className="font-bold text-white">{fragrance.fragranceRecipe.topNote?.name || '정보 없음'}</div>
                      <div className="text-xs text-pink-200 mt-1">{fragrance.fragranceRecipe.topNote?.id || ''}</div>
                      <div className="text-sm text-white font-semibold mt-2">{fragrance.fragranceRecipe.topNote?.ratio || 0}g</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-blue-300 mb-1">MIDDLE</div>
                    <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
                      <div className="font-bold text-white">{fragrance.fragranceRecipe.middleNote?.name || '정보 없음'}</div>
                      <div className="text-xs text-blue-200 mt-1">{fragrance.fragranceRecipe.middleNote?.id || ''}</div>
                      <div className="text-sm text-white font-semibold mt-2">{fragrance.fragranceRecipe.middleNote?.ratio || 0}g</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-indigo-300 mb-1">BASE</div>
                    <div className="bg-indigo-500/10 border border-indigo-400/30 rounded-lg p-3">
                      <div className="font-bold text-white">{fragrance.fragranceRecipe.baseNote?.name || '정보 없음'}</div>
                      <div className="text-xs text-indigo-200 mt-1">{fragrance.fragranceRecipe.baseNote?.id || ''}</div>
                      <div className="text-sm text-white font-semibold mt-2">{fragrance.fragranceRecipe.baseNote?.ratio || 0}g</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center space-y-2">
          <div 
            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getFamilyColor(fragrance.fragranceFamily)}`}
            style={{ transform: 'perspective(300px) rotateX(10deg)' }}
          >
            {fragrance.fragranceFamily}
          </div>
          <h4 className="text-lg font-semibold text-white">{fragrance.name}</h4>
          <p className="text-purple-300 text-sm">{fragrance.brand}</p>
        </div>

        {/* 방사형 그래프 */}
        {fragrance.radarChart && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-purple-300 font-medium mb-4 text-sm">향수 특성 분석</div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <RadarChart 
                  data={fragrance.radarChart} 
                  size={250} 
                  className="mb-2"
                />
                <p className="text-white/60 text-xs mt-2">
                  각 항목은 1-10점 척도로 측정됩니다
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 매칭 정보 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">추천 계절</span>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getSeasonEmoji(fragrance.season)}</span>
              <span className="text-white font-medium text-sm">{fragrance.season}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">추천 상황</span>
            <span className="text-white font-medium text-sm">{fragrance.situation}</span>
          </div>
        </div>

        {/* 추천 이유 */}
        <div className="space-y-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-purple-300 text-sm font-medium mb-2">추천 이유</div>
            <p className="text-white/90 text-sm leading-relaxed">{fragrance.reasonForRecommendation}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-blue-300 text-sm font-medium mb-2">심리적 매칭</div>
            <p className="text-white/90 text-sm leading-relaxed">{fragrance.psychologicalMatch}</p>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}

export default function MusicRecommendationsPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'analysis' | 'fragrance'>('analysis')
  const router = useRouter()

  useEffect(() => {
    const storedResult = localStorage.getItem('analysisResult')
    if (storedResult) {
      try {
        setAnalysisData(JSON.parse(storedResult))
      } catch {
        setError('분석 결과를 불러오는데 실패했습니다.')
      }
    } else {
      setError('분석 결과가 없습니다. 다시 설문을 진행해주세요.')
    }
    setLoading(false)
  }, [])

  const handleRestart = () => {
    localStorage.removeItem('surveyData')
    localStorage.removeItem('analysisResult')
    router.push('/')
  }

  if (loading) {
    return (
      <SurveyLayout showMusicEffect={false}>
        <div className="w-full max-w-[380px] text-center">
          <div 
            className="inline-block w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"
            style={{ transform: 'perspective(300px) rotateX(10deg)' }}
          />
          <p className="text-white mt-4">분석 결과를 불러오는 중...</p>
        </div>
      </SurveyLayout>
    )
  }

  if (error || !analysisData) {
    return (
      <SurveyLayout showMusicEffect={false}>
        <div className="w-full max-w-[380px] text-center space-y-6">
          <div className="text-6xl">😕</div>
          <h2 className="text-xl font-bold text-white">{error}</h2>
          <button
            onClick={handleRestart}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-300"
          >
            처음부터 다시 시작
          </button>
        </div>
      </SurveyLayout>
    )
  }

  return (
    <SurveyLayout showMusicEffect={false}>
      <div className="w-full max-w-[380px] space-y-8">
        {/* 완료 헤더 */}
        <div className="text-center space-y-4">
          <div 
            className="flex justify-center space-x-2"
            style={{ transform: 'perspective(300px) rotateX(10deg)' }}
          >
            {[1, 2, 3, 4, 5].map((step) => (
              <div 
                key={step}
                className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 shadow-lg animate-pulse"
                style={{
                  transform: `translateZ(10px)`,
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                  animationDelay: `${step * 100}ms`
                }}
              />
            ))}
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AI 향수 분석 완료
          </h1>
          <p className="text-white/80">당신의 시그니처 향을 찾았습니다</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-2 p-1 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'analysis'
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            style={{
              transform: activeTab === 'analysis' ? 'perspective(300px) rotateX(2deg) translateZ(5px)' : 'none',
              boxShadow: activeTab === 'analysis' ? '0 8px 25px rgba(139, 92, 246, 0.4)' : 'none'
            }}
          >
            🎬🎵 취향 분석
          </button>
          <button
            onClick={() => setActiveTab('fragrance')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'fragrance'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            style={{
              transform: activeTab === 'fragrance' ? 'perspective(300px) rotateX(2deg) translateZ(5px)' : 'none',
              boxShadow: activeTab === 'fragrance' ? '0 8px 25px rgba(236, 72, 153, 0.4)' : 'none'
            }}
          >
            💎 맞춤 향수
          </button>
        </div>

        {/* 취향 분석 탭 콘텐츠 */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            {/* 영화 분석 */}
            {analysisData.analyzedMovie && (
              <section className="space-y-6">
                <AnimatedCard delay={0}>
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <div className="text-2xl">🎬</div>
                      <h3 className="text-lg font-bold text-purple-300">분석된 영화</h3>
                    </div>
                    <div className="space-y-3 text-left">
                      <div className="flex">
                        <span className="text-purple-300 font-medium w-20">영화 제목:</span>
                        <span className="text-white font-bold flex-1">{analysisData.analyzedMovie.title}</span>
                      </div>
                      <div className="flex">
                        <span className="text-purple-300 font-medium w-20">감독:</span>
                        <span className="text-white flex-1">{analysisData.analyzedMovie.director}</span>
                      </div>
                      {analysisData.analyzedMovie.year && (
                        <div className="flex">
                          <span className="text-purple-300 font-medium w-20">출시년도:</span>
                          <span className="text-white flex-1">{analysisData.analyzedMovie.year}</span>
                        </div>
                      )}
                      <div className="flex">
                        <span className="text-purple-300 font-medium w-20">장르:</span>
                        <span className="text-white flex-1">{analysisData.analyzedMovie.genre.join(', ')}</span>
                      </div>
                      <div className="mt-4">
                        <span className="text-purple-300 font-medium block mb-2">줄거리:</span>
                        <p className="text-white/90 text-sm leading-relaxed">{analysisData.analyzedMovie.description}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
                
                {/* 영화 상징 키워드 */}
                <AnimatedCard>
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <span className="text-xl">🏷️</span>
                      <h4 className="text-lg font-bold text-purple-300">영화 상징 키워드</h4>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 p-4">
                      {analysisData.movieAnalysis.symbolKeywords?.map((keyword, index) => {
                        const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl']
                        const colors = ['text-purple-300', 'text-blue-300', 'text-green-300', 'text-yellow-300', 'text-pink-300', 'text-cyan-300']
                        const randomSize = sizes[index % sizes.length]
                        const randomColor = colors[index % colors.length]
                        return (
                          <span 
                            key={index}
                            className={`${randomSize} ${randomColor} font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-default`}
                            style={{ 
                              transform: `rotate(${(index % 3 - 1) * 5}deg)`,
                              animationDelay: `${index * 100}ms`
                            }}
                          >
                            {keyword}
                          </span>
                        )
                      }) || (
                        <p className="text-white/60 text-sm">분석 중...</p>
                      )}
                    </div>
                  </div>
                </AnimatedCard>

                {/* 장르 매칭도 */}
                <AnimatedCard delay={100}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <span className="text-xl">🎯</span>
                      <h4 className="text-lg font-bold text-blue-300">장르 매칭도</h4>
                    </div>
                    <div className="text-center space-y-3">
                      <div className="flex items-center justify-center space-x-4">
                        <div className="text-3xl font-bold text-white">
                          {analysisData.movieAnalysis.genreMatching?.score || 0}/10
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          analysisData.movieAnalysis.genreMatching?.isMatched 
                            ? 'bg-green-500/20 text-green-300 border border-green-400/50' 
                            : 'bg-red-500/20 text-red-300 border border-red-400/50'
                        }`}>
                          {analysisData.movieAnalysis.genreMatching?.isMatched ? '매칭됨' : '불일치'}
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            analysisData.movieAnalysis.genreMatching?.isMatched 
                              ? 'bg-gradient-to-r from-green-500 to-green-400' 
                              : 'bg-gradient-to-r from-red-500 to-orange-400'
                          }`}
                          style={{ width: `${(analysisData.movieAnalysis.genreMatching?.score || 0) * 10}%` }}
                        />
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed mt-3">
                        {analysisData.movieAnalysis.genreMatching?.explanation || '분석 중...'}
                      </p>
                    </div>
                  </div>
                </AnimatedCard>
              </section>
            )}

            {/* 음악 분석 */}
            {analysisData.analyzedMusic && (
              <section>
                <AnimatedCard>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <div className="text-2xl">🎵</div>
                        <h3 className="text-lg font-bold text-purple-300">전문 음악 분석</h3>
                      </div>
                    </div>

                    {/* 기본 정보 */}
                    <div className="grid grid-cols-1 gap-3 p-4 bg-purple-500/10 rounded-xl border border-purple-400/20">
                      <div className="flex items-center gap-3">
                        <span className="text-purple-300 font-medium text-sm">제목:</span>
                        <span className="text-white font-bold">{analysisData.analyzedMusic.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-purple-300 font-medium text-sm">아티스트:</span>
                        <span className="text-white font-bold">{analysisData.analyzedMusic.artist}</span>
                      </div>
                    </div>

                    {/* 음악 상징 키워드 */}
                    {analysisData.analyzedMusic.symbolKeywords && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-center space-y-4">
                          <div className="flex items-center justify-center space-x-2 mb-4">
                            <span className="text-xl">🏷️</span>
                            <h4 className="text-lg font-bold text-purple-300">음악 상징 키워드</h4>
                          </div>
                          <div className="flex flex-wrap justify-center gap-3 p-4">
                            {analysisData.analyzedMusic.symbolKeywords.map((keyword, index) => {
                              const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl']
                              const colors = ['text-purple-300', 'text-blue-300', 'text-green-300', 'text-yellow-300', 'text-pink-300', 'text-cyan-300']
                              const randomSize = sizes[index % sizes.length]
                              const randomColor = colors[index % colors.length]
                              return (
                                <span 
                                  key={index}
                                  className={`${randomSize} ${randomColor} font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-default`}
                                  style={{ 
                                    transform: `rotate(${(index % 3 - 1) * 5}deg)`,
                                    animationDelay: `${index * 100}ms`
                                  }}
                                >
                                  {keyword}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 전문 분석 섹션들 */}
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-400/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">🎼</span>
                          <h4 className="text-sm font-semibold text-indigo-300">장르 & 특성</h4>
                        </div>
                        <div className="space-y-1">
                          <p className="text-white/90 text-sm font-medium">{analysisData.analyzedMusic.genre}</p>
                          <p className="text-white/70 text-xs">{analysisData.analyzedMusic.characteristics}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-xl border border-pink-400/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">💫</span>
                          <h4 className="text-sm font-semibold text-pink-300">감정선 & 분위기</h4>
                        </div>
                        <p className="text-white/90 text-sm">{analysisData.analyzedMusic.emotionalTone}</p>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-400/20">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">💭</span>
                          <h4 className="text-sm font-semibold text-emerald-300">핵심 주제</h4>
                        </div>
                        <p className="text-white/90 text-sm">{analysisData.analyzedMusic.theme}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </section>
            )}

            {/* 비슷한 영화 추천 */}
            <section>
              <SectionHeader 
                icon="🎬" 
                title="비슷한 영화 추천" 
                subtitle="당신의 취향과 비슷한 다른 영화들"
              />
              <div className="grid grid-cols-1 gap-4">
                {analysisData.movieRecommendations?.map((movie, index) => (
                  <AnimatedCard key={index} delay={index * 100}>
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl flex-shrink-0">{movie.poster}</div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-white font-bold text-lg">{movie.title}</h4>
                          <p className="text-purple-300 text-sm">{movie.director} • {movie.year}</p>
                          <p className="text-blue-300 text-xs">{movie.genre}</p>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">{movie.reason}</p>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </section>

            {/* 비슷한 음악 추천 */}
            <section>
              <SectionHeader 
                icon="🎵" 
                title="비슷한 음악 추천" 
                subtitle="당신의 음악 취향과 어울리는 곡들"
              />
              <div className="grid grid-cols-1 gap-4">
                {analysisData.musicRecommendations?.map((music, index) => (
                  <AnimatedCard key={index} delay={index * 100}>
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl flex-shrink-0">{music.emoji}</div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-white font-bold text-lg">{music.title}</h4>
                          <p className="text-purple-300 text-sm">{music.artist}</p>
                          <p className="text-blue-300 text-xs">{music.album}</p>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">{music.reason}</p>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </section>

            {/* 컴팩트한 라이프스타일 조언 */}
            <section>
              <SectionHeader 
                icon="✨" 
                title="라이프스타일 조언" 
                subtitle="간단하고 실용적인 팁"
              />
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(analysisData.lifestyleAdvice).map(([key, value], index) => {
                  const titles = {
                    dailyRoutine: '일상 루틴',
                    socialInteraction: '사회적 관계',
                    personalGrowth: '개인 성장',
                    fragranceUsage: '향수 사용법'
                  }
                  const icons = {
                    dailyRoutine: '⏰',
                    socialInteraction: '👥',
                    personalGrowth: '🌱',
                    fragranceUsage: '🌟'
                  }
                  return (
                    <AnimatedCard key={key} delay={index * 50}>
                      <div className="text-center space-y-2">
                        <span className="text-xl">{icons[key as keyof typeof icons]}</span>
                        <div className="text-yellow-300 font-medium text-sm">
                          {titles[key as keyof typeof titles]}
                        </div>
                        <p className="text-white/80 text-xs leading-relaxed">{value}</p>
                      </div>
                    </AnimatedCard>
                  )
                })}
              </div>
            </section>
          </div>
        )}

        {/* 향수 추천 탭 콘텐츠 */}
        {activeTab === 'fragrance' && (
          <div className="space-y-8">
            <section>
              <SectionHeader 
                icon="💎" 
                title="맞춤 향수 추천" 
                subtitle="당신의 심리와 완벽하게 매칭된 향수들"
              />
              <div className="space-y-8">
                {analysisData.fragranceRecommendations?.map((fragrance, index) => (
                  <FragranceCard key={index} fragrance={fragrance} index={index} />
                )) || (
                  <div className="text-center text-white/60">
                    향수 추천 데이터를 불러오는 중...
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="space-y-4 pb-8">
          <button
            onClick={handleRestart}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-300"
            style={{
              transform: 'perspective(500px) rotateX(5deg) translateZ(5px)',
              boxShadow: '0 12px 30px rgba(139, 92, 246, 0.4), 0 8px 25px rgba(0, 0, 0, 0.2)'
            }}
          >
            🔄 새로운 분석 시작
          </button>
          
          <Link href="/">
            <button 
              className="w-full py-4 px-6 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-medium hover:bg-white/30 transition-all duration-300 border border-white/30"
              style={{
                transform: 'perspective(500px) rotateX(5deg)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
              }}
            >
              🏠 홈으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    </SurveyLayout>
  )
}