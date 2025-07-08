import { ReactNode } from 'react'

interface SurveyCardProps {
  children: ReactNode
  className?: string
}

export default function SurveyCard({ children, className = '' }: SurveyCardProps) {
  return (
    <div 
      className={`backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 space-y-6 shadow-2xl ${className}`}
      style={{
        transform: 'perspective(1000px) rotateX(2deg)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 10px 25px rgba(139, 92, 246, 0.1)',
        backdropFilter: 'blur(20px)'
      }}
    >
      {children}
    </div>
  )
} 