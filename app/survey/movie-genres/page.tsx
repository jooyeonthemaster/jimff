'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SurveyLayout from '../../components/SurveyLayout'
import ProgressIndicator from '../../components/ProgressIndicator'
import SurveyCard from '../../components/SurveyCard'
import NavigationButtons from '../../components/NavigationButtons'

const genres = [
  { name: '코미디', emoji: '😂', desc: '웃음과 유머' },
  { name: '로맨스', emoji: '💕', desc: '사랑과 감정' },
  { name: '공포', emoji: '😱', desc: '스릴과 공포' },
  { name: '스릴러', emoji: '🔪', desc: '긴장과 서스펜스' },
  { name: '판타지', emoji: '🧙‍♂️', desc: '마법과 모험' },
  { name: 'SF', emoji: '🚀', desc: '미래와 과학' },
  { name: '뮤지컬', emoji: '🎭', desc: '음악과 춤' },
  { name: '느와르&갱스터', emoji: '🕴️', desc: '범죄와 어둠', displayName: '느와르\n갱스터' }
]

export default function MovieGenresPage() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const router = useRouter()

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handleNext = () => {
    if (selectedGenres.length === 0) return
    
    // 로컬 스토리지에 데이터 저장
    const surveyData = JSON.parse(localStorage.getItem('surveyData') || '{}')
    surveyData.movieGenres = selectedGenres
    localStorage.setItem('surveyData', JSON.stringify(surveyData))
    
    router.push('/survey/music-info')
  }

  return (
    <SurveyLayout>
      <div className="w-full max-w-[380px] space-y-8">
        {/* 진행 표시 */}
        <ProgressIndicator currentStep={1} totalSteps={5} />

        {/* 메인 설문 카드 */}
        <SurveyCard>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">
              선호하는 영화 장르는?
            </h1>
            <p className="text-white/80">
              좋아하는 장르를 모두 선택해주세요
            </p>
          </div>

          {/* 장르 선택 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            {genres.map((genre) => (
              <button
                key={genre.name}
                onClick={() => toggleGenre(genre.name)}
                className={`px-4 py-5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedGenres.includes(genre.name)
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white scale-105'
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                }`}
                style={{
                  transform: selectedGenres.includes(genre.name) 
                    ? 'perspective(300px) rotateX(-5deg) translateZ(10px)'
                    : 'perspective(300px) rotateX(0deg)',
                  boxShadow: selectedGenres.includes(genre.name)
                    ? '0 10px 25px rgba(139, 92, 246, 0.4)'
                    : '0 5px 15px rgba(0, 0, 0, 0.2)',
                  minHeight: '110px'
                }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <span className="text-2xl">{genre.emoji}</span>
                  <div className="text-center">
                    {genre.displayName ? (
                      <div className="whitespace-pre-line leading-tight font-semibold">
                        {genre.displayName}
                      </div>
                    ) : (
                      <div className="font-semibold">{genre.name}</div>
                    )}
                  </div>
                  <p className="text-xs text-white/70 text-center leading-tight">{genre.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* 선택된 장르 개수 표시 */}
          {selectedGenres.length > 0 && (
            <div className="text-center">
              <div 
                className="inline-block px-4 py-2 bg-purple-500/30 backdrop-blur-sm border border-purple-400/50 rounded-full"
                style={{ transform: 'perspective(300px) rotateX(10deg)' }}
              >
                <p className="text-sm text-purple-200 font-medium">
                  {selectedGenres.length}개 선택됨
                </p>
              </div>
            </div>
          )}
        </SurveyCard>

        {/* 네비게이션 버튼 */}
        <NavigationButtons
          prevLink="/"
          onNext={handleNext}
          nextDisabled={selectedGenres.length === 0}
        />
        
        {selectedGenres.length === 0 && (
          <p className="text-white/60 text-sm text-center">
            최소 하나의 장르를 선택해주세요
          </p>
        )}
      </div>
    </SurveyLayout>
  )
} 