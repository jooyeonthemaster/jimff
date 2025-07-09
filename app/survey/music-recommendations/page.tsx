'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SurveyLayout from '../../components/SurveyLayout'

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
        {/* 헤더 */}
        <div className="text-center space-y-3">
          <div 
            className={`inline-flex px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getFamilyColor(fragrance.fragranceFamily)}`}
            style={{ transform: 'perspective(300px) rotateX(10deg)' }}
          >
            {fragrance.fragranceFamily}
          </div>
          <h3 className="text-xl font-bold text-white">{fragrance.name}</h3>
          <p className="text-purple-300 font-medium">{fragrance.brand}</p>
        </div>

        {/* 노트 구성 */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <div className="text-purple-300 font-medium mb-2">TOP</div>
              <div className="space-y-1">
                {fragrance.topNotes.map((note, i) => (
                  <div key={i} className="bg-purple-500/20 rounded-lg py-1 px-2 text-white/80">
                    {note}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-blue-300 font-medium mb-2">MIDDLE</div>
              <div className="space-y-1">
                {fragrance.middleNotes.map((note, i) => (
                  <div key={i} className="bg-blue-500/20 rounded-lg py-1 px-2 text-white/80">
                    {note}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-indigo-300 font-medium mb-2">BASE</div>
              <div className="space-y-1">
                {fragrance.baseNotes.map((note, i) => (
                  <div key={i} className="bg-indigo-500/20 rounded-lg py-1 px-2 text-white/80">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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

        {/* 성격 매칭 */}
        <div 
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-4 border border-purple-400/30"
          style={{ transform: 'perspective(300px) rotateX(-1deg)' }}
        >
          <div className="text-center space-y-2">
            <div className="text-purple-300 text-sm font-medium">당신의 성격</div>
            <div className="text-white font-bold">{fragrance.personality}</div>
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
  const router = useRouter()

  useEffect(() => {
    // localStorage에서 결과 데이터 가져오기
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
      <SurveyLayout showMusicEffect={true}>
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
      <SurveyLayout showMusicEffect={true}>
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
    <SurveyLayout showMusicEffect={true}>
      <div className="w-full max-w-[380px] space-y-12">
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

        {/* 성격 분석 섹션 */}
        <section>
          <SectionHeader 
            icon="🧠" 
            title="성격 분석" 
            subtitle="당신의 내면을 깊이 있게 분석했습니다"
          />
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(analysisData.personalityAnalysis).map(([key, value], index) => {
              const titles = {
                corePersonality: '핵심 성격',
                emotionalDepth: '감정 처리',
                socialTendency: '사회적 성향',
                aestheticPreference: '미적 취향',
                lifestylePattern: '라이프스타일'
              }
              return (
                <AnimatedCard key={key} delay={index * 100}>
                  <div className="text-center space-y-2">
                    <div className="text-purple-300 text-sm font-medium">
                      {titles[key as keyof typeof titles]}
                    </div>
                    <p className="text-white font-medium text-sm leading-relaxed">{value}</p>
                  </div>
                </AnimatedCard>
              )
            })}
          </div>
        </section>

        {/* 영화 취향 분석 */}
        <section>
          <SectionHeader 
            icon="🎬" 
            title="영화 취향 분석" 
            subtitle="선택한 장르가 드러내는 심리적 특성"
          />
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(analysisData.movieAnalysis).map(([key, value], index) => {
              const titles = {
                psychologicalDriver: '심리적 동기',
                emotionalNeeds: '감정적 욕구',
                cognitiveStyle: '인지 스타일',
                escapismPattern: '이상향'
              }
              return (
                <AnimatedCard key={key} delay={index * 100}>
                  <div className="text-center space-y-2">
                    <div className="text-blue-300 text-sm font-medium">
                      {titles[key as keyof typeof titles]}
                    </div>
                    <p className="text-white font-medium text-sm leading-relaxed">{value}</p>
                  </div>
                </AnimatedCard>
              )
            })}
          </div>
        </section>

        {/* 음악 취향 분석 */}
        <section>
          <SectionHeader 
            icon="🎵" 
            title="음악 취향 분석" 
            subtitle="음악을 통해 드러나는 당신의 본질"
          />
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(analysisData.musicAnalysis).map(([key, value], index) => {
              const titles = {
                emotionalResonance: '감정적 공명',
                memoryAssociation: '기억 연관성',
                energyAlignment: '에너지 정렬',
                identityExpression: '정체성 표현'
              }
              return (
                <AnimatedCard key={key} delay={index * 100}>
                  <div className="text-center space-y-2">
                    <div className="text-green-300 text-sm font-medium">
                      {titles[key as keyof typeof titles]}
                    </div>
                    <p className="text-white font-medium text-sm leading-relaxed">{value}</p>
                  </div>
                </AnimatedCard>
              )
            })}
          </div>
        </section>

        {/* 향수 추천 */}
        <section>
          <SectionHeader 
            icon="💎" 
            title="맞춤 향수 추천" 
            subtitle="당신의 심리와 완벽하게 매칭된 향수들"
          />
          <div className="space-y-8">
            {analysisData.fragranceRecommendations.map((fragrance, index) => (
              <FragranceCard key={index} fragrance={fragrance} index={index} />
            ))}
          </div>
        </section>

        {/* 라이프스타일 조언 */}
        <section>
          <SectionHeader 
            icon="✨" 
            title="라이프스타일 조언" 
            subtitle="향수와 함께하는 더 나은 일상"
          />
          <div className="grid grid-cols-1 gap-4">
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
                <AnimatedCard key={key} delay={index * 100}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{icons[key as keyof typeof icons]}</span>
                      <div className="text-yellow-300 font-medium">
                        {titles[key as keyof typeof titles]}
                      </div>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">{value}</p>
                  </div>
                </AnimatedCard>
              )
            })}
          </div>
        </section>

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