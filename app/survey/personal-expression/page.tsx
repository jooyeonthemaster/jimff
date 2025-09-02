'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SurveyLayout from '../../components/SurveyLayout'
import ProgressIndicator from '../../components/ProgressIndicator'

export default function PersonalExpressionPage() {
  const [favoriteScene, setFavoriteScene] = useState('')
  const [musicColor, setMusicColor] = useState('')
  const [movieMeaning, setMovieMeaning] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const router = useRouter()

  // localStorage에서 기존 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('surveyData')
    if (savedData) {
      const data = JSON.parse(savedData)
      setFavoriteScene(data.favoriteScene || '')
      setMusicColor(data.musicColor || '')
      setMovieMeaning(data.movieMeaning || '')
    }
  }, [])

  // 데이터 저장
  const saveData = () => {
    const savedData = localStorage.getItem('surveyData')
    const existingData = savedData ? JSON.parse(savedData) : {}
    
    const updatedData = {
      ...existingData,
      favoriteScene,
      musicColor,
      movieMeaning
    }
    
    localStorage.setItem('surveyData', JSON.stringify(updatedData))
    return updatedData
  }

  // AI 분석 호출 및 완료 처리
  const handleComplete = async () => {
    // 입력 검증 제거 - 선택사항으로 변경

    setLoading(true)
    setAnalysisError(null)

    try {
      // 최종 데이터 저장
      const finalData = saveData()
      
      // 감정 응답 합성 및 누락 방지 필드 구성
      const emotionalResponseParts: string[] = []
      if (finalData.favoriteScene) emotionalResponseParts.push(`가장 좋아한 장면: ${finalData.favoriteScene}`)
      if (finalData.musicColor) emotionalResponseParts.push(`음악의 색감: ${finalData.musicColor}`)
      if (finalData.movieMeaning) emotionalResponseParts.push(`영화의 의미: ${finalData.movieMeaning}`)
      const emotionalResponse = emotionalResponseParts.join(' | ')

      // 유튜브 추출 정보가 있다면 함께 전달
      const dataWithExtracted = {
        ...finalData,
        extractedMusicTitle: finalData.extractedMusicTitle || null,
        extractedMusicArtist: finalData.extractedMusicArtist || null,
        movieTitle: finalData.movieTitle || null,
        movieDirector: finalData.movieDirector || null,
        emotionalResponse: emotionalResponse || finalData.emotionalResponse || null
      }
      
      // API 호출
      const response = await fetch('/api/analyze-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithExtracted),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'AI 분석 중 오류가 발생했습니다.')
      }

      // 결과를 localStorage에 저장
      localStorage.setItem('analysisResult', JSON.stringify(result.analysis))

      // 결과 페이지로 이동
      router.push('/survey/music-recommendations')

    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisError(error instanceof Error ? error.message : 'AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    saveData()
    router.push('/survey/fragrance-preferences')
  }

  const isValid = true // 항상 활성화

  if (loading) {
    return (
      <SurveyLayout>
        <div className="w-full max-w-[380px] text-center space-y-8">
          <ProgressIndicator currentStep={5} totalSteps={5} />
          
          <div className="space-y-6">
            <div 
              className="inline-block"
              style={{ transform: 'perspective(300px) rotateX(10deg)' }}
            >
              <div 
                className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI 분석 진행 중
              </h2>
              <p className="text-purple-300 text-xs">잠시만 기다려주세요.</p>
            </div>
          </div>
        </div>
      </SurveyLayout>
    )
  }

  return (
    <SurveyLayout>
      <div className="w-full max-w-[380px] space-y-8">
        <ProgressIndicator currentStep={5} totalSteps={5} />
        
        <div className="text-center space-y-3">
          <div 
            className="text-4xl"
            style={{ 
              transform: 'perspective(300px) rotateY(10deg)',
              filter: 'drop-shadow(0 5px 15px rgba(139, 92, 246, 0.3))'
            }}
          >
            ✨
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            마지막 단계입니다
          </h1>
          <p className="text-white/80 text-sm">
            당신의 취향이 말하는 진짜 의미를 알려주세요
          </p>
        </div>

        <div className="space-y-6">
          {/* 질문 1: 가장 좋아하는 장면 */}
          <div 
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4"
            style={{
              transform: 'perspective(1000px) rotateX(2deg) translateZ(10px)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(139, 92, 246, 0.1)'
            }}
          >
            <div className="space-y-2">
              <label className="block text-white font-medium text-sm">
                이 영화에서 가장 좋아하는 장면은 무엇인가요?
              </label>
              <p className="text-white/60 text-xs">
                마음이 뭉클했던 장면, 계속 기억에 남는 장면 등 (선택사항)
              </p>
            </div>
            <textarea
              value={favoriteScene}
              onChange={(e) => setFavoriteScene(e.target.value)}
              placeholder="예) 주인공이 마지막에 진심을 고백하는 장면이 가장 인상적이었어요. 그 순간의 감정이 너무 진실되게 느껴져서 저도 모르게 눈물이 났습니다..."
              className="w-full h-32 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
              style={{
                transform: 'perspective(500px) rotateX(1deg)',
              }}
            />
          </div>

          {/* 질문 2: 음악과 비슷한 색깔 */}
          <div 
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4"
            style={{
              transform: 'perspective(1000px) rotateX(2deg) translateZ(10px)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(139, 92, 246, 0.1)'
            }}
          >
            <div className="space-y-2">
              <label className="block text-white font-medium text-sm">
                이 음악과 비슷한 색깔은 무엇인가요?
              </label>
              <p className="text-white/60 text-xs">
                민트색, 노란색 등 (선택사항)
              </p>
            </div>
            <input
              type="text"
              value={musicColor}
              onChange={(e) => setMusicColor(e.target.value)}
              placeholder="예) 따뜻한 주황색, 차분한 파란색, 로맨틱한 분홍색..."
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              style={{
                transform: 'perspective(500px) rotateX(1deg)',
              }}
            />
          </div>

          {/* 질문 3: 영화의 의미 */}
          <div 
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4"
            style={{
              transform: 'perspective(1000px) rotateX(2deg) translateZ(10px)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(139, 92, 246, 0.1)'
            }}
          >
            <div className="space-y-2">
              <label className="block text-white font-medium text-sm">
                당신에게 이 영화는 어떤 의미를 가지고 있나요?
              </label>
              <p className="text-white/60 text-xs">
                위로가 되는 영화, 새로운 시선을 열어준 영화 등 (선택사항)
              </p>
            </div>
            <textarea
              value={movieMeaning}
              onChange={(e) => setMovieMeaning(e.target.value)}
              placeholder="예) 이 영화는 제게 위로가 되는 작품이에요. 힘들 때마다 보면서 용기를 얻고, 삶을 다른 관점에서 바라볼 수 있게 해주는 특별한 의미가 있습니다..."
              className="w-full h-32 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
              style={{
                transform: 'perspective(500px) rotateX(1deg)',
              }}
            />
          </div>
        </div>

        {/* 에러 메시지 */}
        {analysisError && (
          <div 
            className="bg-red-500/20 border border-red-400/50 rounded-xl p-4"
            style={{ transform: 'perspective(300px) rotateX(2deg)' }}
          >
            <p className="text-red-300 text-sm text-center">{analysisError}</p>
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            className="flex-1 py-4 px-6 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-medium hover:bg-white/30 transition-all duration-300 border border-white/30"
            style={{
              transform: 'perspective(500px) rotateX(5deg)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
            }}
          >
            이전
          </button>
          
          <button
            onClick={handleComplete}
            disabled={!isValid}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600"
            style={{
              background: isValid 
                ? 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)' 
                : 'rgba(255, 255, 255, 0.1)',
              transform: isValid 
                ? 'perspective(500px) rotateX(5deg) translateZ(5px)' 
                : 'perspective(500px) rotateX(5deg)',
              boxShadow: isValid 
                ? '0 12px 30px rgba(139, 92, 246, 0.4), 0 8px 25px rgba(0, 0, 0, 0.2)' 
                : '0 4px 15px rgba(0, 0, 0, 0.2)',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            ✨ AI 분석 시작
          </button>
        </div>

        <div className="text-center">
          <p className="text-white/50 text-xs">
            💡 솔직하고 자세하게 적어주실수록 더 정확한 추천을 받을 수 있어요
          </p>
        </div>
      </div>
    </SurveyLayout>
  )
} 