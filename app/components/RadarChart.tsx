'use client'

interface RadarChartData {
  부드러움: number      // Softness
  강렬함: number        // Intensity  
  신선함: number        // Freshness
  따뜻함: number        // Warmth
  달콤함: number        // Sweetness
  우디함: number        // Woodiness
  플로럴함: number      // Florality
  스파이시함: number    // Spiciness
  깊이감: number        // Depth
  개성감: number        // Uniqueness
}

interface RadarChartProps {
  data: RadarChartData
  size?: number
  className?: string
}

export default function RadarChart({ data, size = 290, className = '' }: RadarChartProps) {
  const center = size / 2
  const maxRadius = size * 0.33 // 최대 반지름
  
  // 10개 축의 각도 계산 (12시 방향부터 시작)
  const angles = Array.from({ length: 10 }, (_, i) => (i * 36 - 90) * (Math.PI / 180))
  
  // 축 레이블 (순서대로) - 향수 전문 척도
  const labels = ['부드러움', '강렬함', '신선함', '따뜻함', '달콤함', '우디함', '플로럴함', '스파이시함', '깊이감', '개성감']
  
  // 데이터 포인트 계산
  const dataPoints = labels.map((label, index) => {
    const value = data[label as keyof RadarChartData] || 0
    const radius = (value / 10) * maxRadius
    const angle = angles[index]
    
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      value,
      label,
      angle
    }
  })
  
  // 축 라인 끝점 계산
  const axisPoints = angles.map(angle => ({
    x: center + Math.cos(angle) * maxRadius,
    y: center + Math.sin(angle) * maxRadius,
    angle
  }))
  
  // 라벨 위치 계산 (축 끝에서 조금 더 바깥쪽)
  const labelPoints = labels.map((label, index) => {
    const angle = angles[index]
    const labelRadius = maxRadius + 25
    return {
      x: center + Math.cos(angle) * labelRadius,
      y: center + Math.sin(angle) * labelRadius,
      label
    }
  })
  
  // 데이터 영역 패스 생성
  const pathData = dataPoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`
  ).join(' ') + ' Z'
  
  return (
    <div className={`flex justify-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mb-1">
        {/* 동심원 그리드 (5개 원) */}
        {[1, 2, 3, 4, 5].map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level * maxRadius) / 5}
            fill="none"
            stroke="#ddd"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="1"
          />
        ))}
        
        {/* 축 라인들 */}
        {axisPoints.map((point, index) => (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="#ddd"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="1"
          />
        ))}
        
        {/* 데이터 영역 */}
        <path
          d={pathData}
          fill="rgba(255, 182, 193, 0.5)"
          stroke="#ff9eb5"
          strokeWidth="2"
          opacity="1"
        />
        
        {/* 축 라벨 */}
        {labelPoints.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={point.y}
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="#ffffff"
          >
            {point.label}
          </text>
        ))}
        
        {/* 데이터 포인트 */}
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#ff9eb5"
            opacity="1"
          />
        ))}
      </svg>
    </div>
  )
}
