'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SurveyLayout from '../../components/SurveyLayout'
import ProgressIndicator from '../../components/ProgressIndicator'

export default function PersonalExpressionPage() {
  const [movieMeaning, setMovieMeaning] = useState('')
  const [musicMeaning, setMusicMeaning] = useState('')
  const [personalDescription, setPersonalDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const router = useRouter()

  // localStorage에서 기존 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('surveyData')
    if (savedData) {
      const data = JSON.parse(savedData)
      setMovieMeaning(data.movieMeaning || '')
      setMusicMeaning(data.musicMeaning || '')
      setPersonalDescription(data.personalDescription || '')
    }
  }, [])

  // 데이터 저장
  const saveData = () => {
    const savedData = localStorage.getItem('surveyData')
    const existingData = savedData ? JSON.parse(savedData) : {}
    
    const updatedData = {
      ...existingData,
      movieMeaning,
      musicMeaning,
      personalDescription
    }
    
    localStorage.setItem('surveyData', JSON.stringify(updatedData))
    return updatedData
  }

  // AI 분석 호출 및 완료 처리
  const handleComplete = async () => {
    if (!movieMeaning.trim() || !musicMeaning.trim() || !personalDescription.trim()) {
      setAnalysisError('모든 질문에 답변해주세요.')
      return
    }

    setLoading(true)
    setAnalysisError(null)

    try {
      // 최종 데이터 저장
      const finalData = saveData()
      
      // API 호출
      const response = await fetch('/api/analyze-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
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

  const isValid = movieMeaning.trim() && musicMeaning.trim() && personalDescription.trim()

  if (loading) {
    return (
      <SurveyLayout>
        <div className="w-full max-w-[380px] text-center space-y-8">
          <ProgressIndicator currentStep={5} totalSteps={5} />
          
          <div className="space-y-6">
            <div 
              className="inline-block w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"
              style={{ transform: 'perspective(300px) rotateX(10deg)' }}
            />
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI 분석 진행 중
              </h2>
              <div className="space-y-2 text-white/80">
                <p className="text-sm">🧠 성격 특성 분석 중...</p>
                <p className="text-sm">🎬 영화 취향 해석 중...</p>
                <p className="text-sm">🎵 음악 취향 분석 중...</p>
                <p className="text-sm">💎 맞춤 향수 추천 중...</p>
              </div>
              <p className="text-purple-300 text-xs">잠시만 기다려주세요. 곧 결과가 나옵니다!</p>
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
          {/* 영화 의미 */}
          <div 
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4"
            style={{
              transform: 'perspective(1000px) rotateX(2deg) translateZ(10px)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(139, 92, 246, 0.1)'
            }}
          >
            <div className="space-y-2">
              <label className="block text-white font-medium text-sm">
                🎬 선택한 영화 장르가 당신에게 의미하는 것은?
              </label>
              <p className="text-white/60 text-xs">
                왜 그 장르를 좋아하는지, 그 장르에서 무엇을 느끼는지 자유롭게 써주세요
              </p>
            </div>
            <textarea
              value={movieMeaning}
              onChange={(e) => setMovieMeaning(e.target.value)}
              placeholder="예) 로맨스 영화를 보면 따뜻한 감정과 희망을 느껴요. 현실에서 경험하기 어려운 순수한 사랑을 간접적으로 체험할 수 있어서 좋아합니다..."
              className="w-full h-24 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
              style={{
                transform: 'perspective(500px) rotateX(1deg)',
              }}
            />
          </div>

          {/* 음악 의미 */}
          <div 
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4"
            style={{
              transform: 'perspective(1000px) rotateX(2deg) translateZ(10px)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(139, 92, 246, 0.1)'
            }}
          >
            <div className="space-y-2">
              <label className="block text-white font-medium text-sm">
                🎵 선택한 음악이 당신에게 의미하는 것은?
              </label>
              <p className="text-white/60 text-xs">
                그 음악을 들을 때의 감정, 특별한 기억이나 의미를 알려주세요
              </p>
            </div>
            <textarea
              value={musicMeaning}
              onChange={(e) => setMusicMeaning(e.target.value)}
              placeholder="예) 이 노래를 들으면 대학시절이 생각나요. 친구들과 함께했던 즐거운 순간들이 떠오르고, 그때의 자유롭고 순수했던 마음을 다시 느낄 수 있어서..."
              className="w-full h-24 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
              style={{
                transform: 'perspective(500px) rotateX(1deg)',
              }}
            />
          </div>

          {/* 개인 표현 */}
          <div 
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4"
            style={{
              transform: 'perspective(1000px) rotateX(2deg) translateZ(10px)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(139, 92, 246, 0.1)'
            }}
          >
            <div className="space-y-2">
              <label className="block text-white font-medium text-sm">
                💭 이런 취향을 가진 당신은 어떤 사람인가요?
              </label>
              <p className="text-white/60 text-xs">
                자신을 어떻게 표현하고 싶은지, 어떤 사람으로 보이고 싶은지 말해주세요
              </p>
            </div>
            <textarea
              value={personalDescription}
              onChange={(e) => setPersonalDescription(e.target.value)}
              placeholder="예) 저는 감성적이면서도 현실적인 사람이에요. 일상에서는 차분하지만 혼자만의 시간에는 꿈꾸는 것을 좋아해요. 사람들과 깊이 있는 대화를 나누는 것을 좋아하고..."
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