'use client'

import { useState, useEffect, ReactNode } from 'react'

interface Particle {
  id: number
  left: string
  top: string
  animationDelay: string
  animationDuration: string
}

interface SurveyLayoutProps {
  children: ReactNode
}

export default function SurveyLayout({ children }: SurveyLayoutProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  // 파티클 생성 - 클라이언트에서만
  useEffect(() => {
    const generatedParticles: Particle[] = [...Array(12)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }))
    setParticles(generatedParticles)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-slate-900">
      {/* 3D 배경 효과 */}
      <div 
        className="relative min-h-screen overflow-hidden"
        style={{
          transform: 'perspective(1000px)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* 떠다니는 파티클들 - 클라이언트에서만 렌더링 */}
        <div className="absolute inset-0 opacity-20">
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
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute top-20 left-10 w-24 h-24 border border-white/30 rounded-full"
            style={{ transform: 'rotateX(45deg) rotateY(45deg)' }}
          ></div>
          <div 
            className="absolute top-40 right-16 w-12 h-12 border border-white/30"
            style={{ transform: 'rotateX(30deg) rotateZ(45deg)' }}
          ></div>
          <div 
            className="absolute bottom-32 left-20 w-16 h-16 border border-white/30 rounded-full"
            style={{ transform: 'rotateY(60deg) rotateX(30deg)' }}
          ></div>
          <div 
            className="absolute bottom-20 right-8 w-32 h-32 border border-white/30"
            style={{ transform: 'rotateX(45deg) rotateY(45deg)' }}
          ></div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div 
          className="relative z-10 flex items-center justify-center min-h-screen p-4"
          style={{
            transform: 'translateZ(50px)',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
} 