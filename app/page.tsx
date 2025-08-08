'use client'

import { useState, useEffect, useRef } from 'react'
import ThreeButton from './components/ThreeButton'

interface Particle {
  id: number
  left: string
  top: string
  animationDelay: string
  animationDuration: string
}

export default function Home() {
  const [particles, setParticles] = useState<Particle[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isForward, setIsForward] = useState(true)

  // 비디오 재생-역재생 로직
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let reverseAnimationId: number | null = null

    const reversePlay = () => {
      if (video.currentTime <= 0) {
        // 역재생 완료 → 정방향 재생 시작
        setIsForward(true)
        video.currentTime = 0
        video.play()
        return
      }
      
      // currentTime을 점진적으로 감소 (역재생 효과)
      video.currentTime = Math.max(0, video.currentTime - 0.033) // ~30fps
      reverseAnimationId = requestAnimationFrame(reversePlay)
    }

    const handleVideoEnd = () => {
      if (isForward) {
        // 정방향 끝 → 역방향 시작
        video.pause()
        setIsForward(false)
        reversePlay()
      }
    }

    const handlePlay = () => {
      // 정방향 재생 시작 시 역재생 애니메이션 정리
      if (reverseAnimationId) {
        cancelAnimationFrame(reverseAnimationId)
        reverseAnimationId = null
      }
    }

    video.addEventListener('ended', handleVideoEnd)
    video.addEventListener('play', handlePlay)

    return () => {
      video.removeEventListener('ended', handleVideoEnd)
      video.removeEventListener('play', handlePlay)
      if (reverseAnimationId) {
        cancelAnimationFrame(reverseAnimationId)
      }
    }
  }, [isForward])

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



  return (
    <div className="min-h-screen">
      {/* 포스터 섹션 - 비디오 배경 */}
      <div className="relative w-full h-[70vh] overflow-hidden">
        {/* 배경 비디오 */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        >
          <source src="/main.mp4" type="video/mp4" />
          {/* 비디오 로드 실패 시 대체 이미지 */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: 'url(/main.JPG)',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </video>
        
        {/* 포스터 하단에 그라데이션 오버레이 추가 */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-indigo-900/90 to-transparent"></div>
      </div>

      {/* 3D 버튼 섹션 */}
      <div className="py-16 bg-gradient-to-b from-indigo-900/90 via-purple-900/50 to-purple-900/70">
        <div className="flex justify-center">
          <ThreeButton 
            href="/survey/movie-genres" 
            text="Get started"
            className="transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* 하단 감성 섹션 - 3D 효과 추가 */}
      <div 
        className="relative bg-gradient-to-br from-purple-900/70 via-purple-800 to-slate-900 text-white overflow-hidden"
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


          {/* 프로세스 타임라인 - 3D 효과 추가 */}
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-purple-200 mb-8">
              JIMFF X AC&apos;SCENT AI 조향사
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
              <span>Powered by NEANDER Corporation</span>
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
