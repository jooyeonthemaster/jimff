'use client'

import { useState, useEffect } from 'react'
import ThreeButton from './components/ThreeButton'

interface Particle {
  id: number
  left: string
  top: string
  animationDelay: string
  animationDuration: string
}

export default function Home() {
  const [currentText, setCurrentText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [particles, setParticles] = useState<Particle[]>([])

  const texts = [
    "음악으로 정의하는 나,",
    "영화로 표현하는 감성,",
    "그리고 나를 기록하는 향수.",
    "당신만의 시그니처 향을 찾아보세요."
  ]

  // 파티클 생성 - 클라이언트에서만
  useEffect(() => {
    const generatedParticles: Particle[] = [...Array(15)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }))
    setParticles(generatedParticles)
  }, [])

  useEffect(() => {
    if (currentIndex < texts.length) {
      const targetText = texts[currentIndex]
      
      if (isTyping && currentText.length < targetText.length) {
        const timeout = setTimeout(() => {
          setCurrentText(targetText.slice(0, currentText.length + 1))
        }, 80)
        return () => clearTimeout(timeout)
      } else if (isTyping && currentText.length === targetText.length) {
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
        return () => clearTimeout(timeout)
      } else if (!isTyping) {
        const timeout = setTimeout(() => {
          if (currentIndex < texts.length - 1) {
            setCurrentText('')
            setCurrentIndex(currentIndex + 1)
            setIsTyping(true)
          }
        }, 800)
        return () => clearTimeout(timeout)
      }
    }
  }, [currentText, currentIndex, isTyping, texts])

  return (
    <div className="min-h-screen">
      {/* 포스터 섹션 - 여백 제거를 위한 설정 변경 */}
      <div 
        className="relative w-full h-[70vh] overflow-hidden"
        style={{
          backgroundImage: 'url(/main.jpg)',
          backgroundSize: 'cover', // contain → cover로 변경하여 여백 제거
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'transparent' // 배경색을 투명으로 변경
        }}
      >
        {/* 포스터 하단에 그라데이션 오버레이 추가 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-900/80 to-transparent"></div>
        
        {/* 3D 버튼을 포스터 하단에 절대 위치 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <ThreeButton 
            href="/survey/movie-genres" 
            text="Get started"
            className="transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* 하단 감성 섹션 - 3D 효과 추가 */}
      <div 
        className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-slate-900 text-white overflow-hidden"
        style={{
          transform: 'perspective(1000px) rotateX(2deg)',
          transformOrigin: 'top center'
        }}
      >
        {/* 3D 배경 레이어들 - 클라이언트에서만 렌더링 */}
        <div className="absolute inset-0 opacity-20">
          {/* 떠다니는 파티클들 */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration
              }}
            />
          ))}
        </div>

        {/* 3D 기하학적 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute top-10 left-10 w-32 h-32 border border-white/30 rounded-full"
            style={{ transform: 'rotateX(45deg) rotateY(45deg)' }}
          ></div>
          <div 
            className="absolute top-32 right-20 w-16 h-16 border border-white/30"
            style={{ transform: 'rotateX(30deg) rotateZ(45deg)' }}
          ></div>
          <div 
            className="absolute bottom-20 left-32 w-24 h-24 border border-white/30 rounded-full"
            style={{ transform: 'rotateY(60deg) rotateX(30deg)' }}
          ></div>
          <div 
            className="absolute bottom-10 right-10 w-40 h-40 border border-white/30"
            style={{ transform: 'rotateX(45deg) rotateY(45deg)' }}
          ></div>
        </div>

        <div 
          className="relative z-10 max-w-[380px] mx-auto px-8 py-16 text-center"
          style={{
            transform: 'translateZ(50px)',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
          }}
        >
          {/* 타자기 효과 텍스트 - 글로우 효과 제거 */}
          <div className="h-40 flex items-center justify-center mb-12">
            <div className="relative">
              <p className="text-xl font-light leading-relaxed tracking-wide">
                {currentText}
                <span className="animate-pulse text-purple-300">|</span>
              </p>
            </div>
          </div>

          {/* 프로세스 타임라인 - 3D 효과 추가 */}
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-purple-200 mb-8">
              AI 향수 큐레이션 프로세스
            </h3>
            
            <div className="relative">
              {/* 3D 연결선 */}
              <div 
                className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 to-blue-400"
                style={{
                  transform: 'rotateY(5deg)',
                  boxShadow: '2px 0 10px rgba(139, 92, 246, 0.3)'
                }}
              ></div>
              
              {[
                { icon: "🎬", title: "영화 장르 선택", desc: "선호 장르로 성향 분석" },
                { icon: "🎵", title: "음악 취향 분석", desc: "YouTube 링크로 음악 DNA 추출" },
                { icon: "🌸", title: "향 계열 선택", desc: "후각 선호도 매핑" },
                { icon: "🔮", title: "AI 맞춤 추천", desc: "AI 향수 큐레이션" }
              ].map((step, index) => (
                <div 
                  key={index} 
                  className="relative flex items-start space-x-4 pb-8"
                  style={{
                    transform: `translateZ(${20 - index * 5}px) rotateY(${index * 2}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <div 
                    className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                      transform: 'translateZ(10px)'
                    }}
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-white mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-300">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 브랜딩 - AI로 변경 */}
          <div 
            className="mt-16 pt-8 border-t border-white/10"
            style={{
              transform: 'translateZ(30px)',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
          >
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Powered by AI & Your Unique Taste</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              JIMFF × AI Perfume Curation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
