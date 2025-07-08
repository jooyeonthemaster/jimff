interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="text-center space-y-3">
      <div 
        className="flex justify-center space-x-2"
        style={{ transform: 'perspective(300px) rotateX(10deg)' }}
      >
        {[...Array(totalSteps)].map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              index < currentStep
                ? 'bg-gradient-to-r from-purple-400 to-blue-500 shadow-lg scale-110'
                : index === currentStep - 1
                ? 'bg-gradient-to-r from-purple-400 to-blue-500 shadow-lg scale-125 animate-pulse'
                : 'bg-white/30 backdrop-blur-sm'
            }`}
            style={{
              transform: `translateZ(${index < currentStep ? '10px' : '0px'})`,
              boxShadow: index < currentStep 
                ? '0 4px 15px rgba(139, 92, 246, 0.4)'
                : '0 2px 5px rgba(255, 255, 255, 0.1)'
            }}
          />
        ))}
      </div>
      <p className="text-sm text-white/80 font-medium">
        {currentStep}/{totalSteps} 단계
      </p>
    </div>
  )
} 