'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SurveyLayout from '../../components/SurveyLayout'
import ProgressIndicator from '../../components/ProgressIndicator'
import SurveyCard from '../../components/SurveyCard'
import NavigationButtons from '../../components/NavigationButtons'

const fragranceOptions = [
  { name: '플로럴', emoji: '🌸', desc: '꽃향기' },
  { name: '우디', emoji: '🌲', desc: '나무향' },
  { name: '시트러스', emoji: '🍊', desc: '감귤향' },
  { name: '오리엔탈', emoji: '🌙', desc: '이국적' },
  { name: '프레시', emoji: '🌿', desc: '상쾌함' },
  { name: '스파이시', emoji: '🌶️', desc: '향신료' },
  { name: '머스크', emoji: '🤍', desc: '은은함' },
  { name: '바닐라', emoji: '🍦', desc: '달콤함' },
  { name: '아쿠아틱', emoji: '🌊', desc: '바다향' },
  { name: '파우더리', emoji: '☁️', desc: '포근함' }
]

export default function FragrancePreferencesPage() {
  const [likedFragrances, setLikedFragrances] = useState<string[]>([])
  const [dislikedFragrances, setDislikedFragrances] = useState<string[]>([])
  const router = useRouter()

  // 기존 데이터 불러오기
  useEffect(() => {
    const surveyData = JSON.parse(localStorage.getItem('surveyData') || '{}')
    if (surveyData.likedFragrances) {
      setLikedFragrances(surveyData.likedFragrances)
    }
    if (surveyData.dislikedFragrances) {
      setDislikedFragrances(surveyData.dislikedFragrances)
    }
  }, [])

  const toggleLikedFragrance = (fragrance: string) => {
    setLikedFragrances(prev => {
      const newLiked = prev.includes(fragrance)
        ? prev.filter(f => f !== fragrance)
        : [...prev, fragrance]
      
      // 좋아하는 것으로 선택하면 싫어하는 것에서 제거
      if (!prev.includes(fragrance)) {
        setDislikedFragrances(prevDisliked => prevDisliked.filter(f => f !== fragrance))
      }
      
      return newLiked
    })
  }

  const toggleDislikedFragrance = (fragrance: string) => {
    setDislikedFragrances(prev => {
      const newDisliked = prev.includes(fragrance)
        ? prev.filter(f => f !== fragrance)
        : [...prev, fragrance]
      
      // 싫어하는 것으로 선택하면 좋아하는 것에서 제거
      if (!prev.includes(fragrance)) {
        setLikedFragrances(prevLiked => prevLiked.filter(f => f !== fragrance))
      }
      
      return newDisliked
    })
  }

  const handleNext = () => {
    // 데이터 저장
    const surveyData = JSON.parse(localStorage.getItem('surveyData') || '{}')
    surveyData.likedFragrances = likedFragrances
    surveyData.dislikedFragrances = dislikedFragrances
    localStorage.setItem('surveyData', JSON.stringify(surveyData))
    
    // 다음 페이지로 이동  
    router.push('/survey/personal-expression')
  }

  const getFragranceButtonStyle = (fragrance: string) => {
    const isLiked = likedFragrances.includes(fragrance)
    const isDisliked = dislikedFragrances.includes(fragrance)
    
    if (isLiked) {
      return {
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-105',
        transform: 'perspective(300px) rotateX(-5deg) translateZ(10px)',
        boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)'
      }
    } else if (isDisliked) {
      return {
        className: 'bg-gradient-to-r from-red-500 to-rose-600 text-white scale-105',
        transform: 'perspective(300px) rotateX(-5deg) translateZ(10px)',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)'
      }
    } else {
      return {
        className: 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30',
        transform: 'perspective(300px) rotateX(0deg)',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
      }
    }
  }

  return (
    <SurveyLayout>
      <div className="w-full max-w-[380px] space-y-8">
        {/* 진행 표시 */}
        <ProgressIndicator currentStep={4} totalSteps={5} />

        {/* 메인 설문 카드 */}
        <SurveyCard>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">
              향 선호도를 알려주세요
            </h1>
            <p className="text-white/80">
              선호하는 향과 싫어하는 향을 선택해주세요
            </p>
          </div>

          {/* 조작 방법 안내 */}
          <div 
            className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 backdrop-blur-sm"
            style={{ transform: 'perspective(300px) rotateX(2deg)' }}
          >
            <div className="flex items-start gap-3">
              <div className="text-blue-300 text-lg">ℹ️</div>
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-2">조작 방법</p>
                <div className="space-y-1">
                  <p><span className="text-green-300">한 번 터치</span> = 좋아하는 향</p>
                  <p><span className="text-red-300">두 번 터치</span> = 싫어하는 향</p>
                  <p><span className="text-white/70">세 번 터치</span> = 선택 해제</p>
                </div>
              </div>
            </div>
          </div>

          {/* 향 계열 선택 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            {fragranceOptions.map((fragrance) => {
              const style = getFragranceButtonStyle(fragrance.name)
              return (
                <button
                  key={fragrance.name}
                  onClick={() => {
                    const isLiked = likedFragrances.includes(fragrance.name)
                    const isDisliked = dislikedFragrances.includes(fragrance.name)
                    
                    if (!isLiked && !isDisliked) {
                      // 선택되지 않은 상태 → 좋아함
                      toggleLikedFragrance(fragrance.name)
                    } else if (isLiked) {
                      // 좋아함 → 싫어함
                      toggleLikedFragrance(fragrance.name)
                      toggleDislikedFragrance(fragrance.name)
                    } else if (isDisliked) {
                      // 싫어함 → 선택 해제
                      toggleDislikedFragrance(fragrance.name)
                    }
                  }}
                  className={`p-5 rounded-xl font-medium transition-all duration-300 ${style.className}`}
                  style={{
                    transform: style.transform,
                    boxShadow: style.boxShadow
                  }}
                >
                  <div className="text-2xl mb-2">{fragrance.emoji}</div>
                  <div className="font-semibold text-sm">{fragrance.name}</div>
                  <div className="text-xs opacity-80 mt-1">{fragrance.desc}</div>
                  {/* 상태 표시 */}
                  {likedFragrances.includes(fragrance.name) && (
                    <div className="text-xs mt-2 text-green-100 font-bold">👍 선호</div>
                  )}
                  {dislikedFragrances.includes(fragrance.name) && (
                    <div className="text-xs mt-2 text-red-100 font-bold">👎 비선호</div>
                  )}
                </button>
              )
            })}
          </div>

          {/* 선택된 향 개수 표시 */}
          {(likedFragrances.length > 0 || dislikedFragrances.length > 0) && (
            <div className="text-center space-y-2">
              {likedFragrances.length > 0 && (
                <div 
                  className="inline-block px-4 py-2 bg-green-500/30 backdrop-blur-sm border border-green-400/50 rounded-full mr-2"
                  style={{ transform: 'perspective(300px) rotateX(10deg)' }}
                >
                  <p className="text-sm text-green-200 font-medium">
                    👍 {likedFragrances.length}개 선호
                  </p>
                </div>
              )}
              {dislikedFragrances.length > 0 && (
                <div 
                  className="inline-block px-4 py-2 bg-red-500/30 backdrop-blur-sm border border-red-400/50 rounded-full"
                  style={{ transform: 'perspective(300px) rotateX(10deg)' }}
                >
                  <p className="text-sm text-red-200 font-medium">
                    👎 {dislikedFragrances.length}개 비선호
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 팁 */}
          <div 
            className="bg-amber-500/20 border border-amber-400/50 rounded-xl p-4 backdrop-blur-sm"
            style={{ transform: 'perspective(300px) rotateX(2deg)' }}
          >
            <div className="flex items-start gap-3">
              <div className="text-amber-300 text-lg">🌟</div>
              <div className="text-sm text-amber-200">
                <p className="font-medium mb-2">팁</p>
                <p>평소 좋아하는/싫어하는 향수나 캔들, 섬유유연제 향을 생각해보세요!</p>
              </div>
            </div>
          </div>
        </SurveyCard>

        {/* 네비게이션 버튼 */}
        <NavigationButtons
          prevLink="/survey/music-info"
          onNext={handleNext}
          nextDisabled={likedFragrances.length === 0 && dislikedFragrances.length === 0}
          nextText="다음 단계"
        />
        
        {(likedFragrances.length === 0 && dislikedFragrances.length === 0) && (
          <p className="text-white/60 text-sm text-center">
            최소 하나의 향 선호도를 선택해주세요
          </p>
        )}
      </div>
    </SurveyLayout>
  )
} 