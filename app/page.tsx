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

          {/* 하단 브랜딩/푸터는 아래 섹션으로 이동 */}
        </div>
      </div>
      {/* 회사 정보 푸터 섹션 (메인 섹션 톤과 통일) */}
      <div className="relative bg-gradient-to-br from-purple-900/70 via-purple-800 to-slate-900 text-white overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 19px, rgba(255,255,255,0.06) 20px, rgba(255,255,255,0.06) 21px), repeating-linear-gradient(0deg, transparent 0px, transparent 23px, rgba(255,255,255,0.06) 24px, rgba(255,255,255,0.06) 25px)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <a className="text-lg md:text-xl font-bold text-white" href="https://neander.co.kr" target="_blank" rel="noopener noreferrer">(주)네안데르</a>
              <p className="mt-4 text-white/80 max-w-md font-typewriter text-xs md:text-sm">기술(Technology), 예술(Art), 그리고 향기(Fragrance)의 경계에서 새로운 감각적 경험을 구현합니다.</p>
              <div className="mt-6 text-xs md:text-sm text-white/70 font-typewriter">
                <p>대표자: 유재영, 이동주</p>
                <p>사업자등록번호: 683-86-02812</p>
              </div>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-4 text-white">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-3 text-white/60"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  <a href="mailto:ok@neadner.co.kr" className="text-purple-200 hover:text-white transition-colors font-typewriter text-xs md:text-sm">ok@neadner.co.kr</a>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-3 text-white/60"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                  <div className="text-white/80 font-typewriter text-xs md:text-sm">
                    <a href="tel:02-336-3368" className="hover:text-white transition-colors">02-336-3368</a>
                    <span className="text-white/40"> / </span>
                    <a href="tel:010-8507-5121" className="hover:text-white transition-colors">010-8507-5121</a>
                  </div>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-3 text-white/60"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  <span className="text-white/80 font-typewriter text-xs md:text-sm">서울특별시 마포구 백범로 13 308호</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-white/70">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-purple-400" />
            <span>JIMFF × AC&apos;SCENT · AI Perfume Curation</span>
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400" style={{ animationDelay: '0.4s' }} />
          </div>
          <p className="text-center text-xs text-white/50 mt-2">© {new Date().getFullYear()} NEANDER Corporation. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
