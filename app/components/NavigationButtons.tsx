import Link from 'next/link'

interface NavigationButtonsProps {
  prevLink: string
  onNext: () => void
  nextDisabled?: boolean
  nextText?: string
}

export default function NavigationButtons({ 
  prevLink, 
  onNext, 
  nextDisabled = false,
  nextText = '다음' 
}: NavigationButtonsProps) {
  return (
    <div className="flex gap-4">
      <Link href={prevLink} className="flex-1">
        <button 
          className="w-full py-4 px-6 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-medium hover:bg-white/30 transition-all duration-300 border border-white/30"
          style={{
            transform: 'perspective(500px) rotateX(5deg)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
          }}
        >
          이전
        </button>
      </Link>
      
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600"
        style={{
          transform: nextDisabled ? 'perspective(500px) rotateX(5deg)' : 'perspective(500px) rotateX(5deg) translateZ(5px)',
          boxShadow: nextDisabled 
            ? '0 8px 25px rgba(0, 0, 0, 0.2)' 
            : '0 12px 30px rgba(139, 92, 246, 0.4), 0 8px 25px rgba(0, 0, 0, 0.2)'
        }}
      >
        {nextText}
      </button>
    </div>
  )
} 