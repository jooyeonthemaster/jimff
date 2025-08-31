'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SurveyLayout from '../../components/SurveyLayout'
import ProgressIndicator from '../../components/ProgressIndicator'
import SurveyCard from '../../components/SurveyCard'
import NavigationButtons from '../../components/NavigationButtons'

// 네트워크 노드 인터페이스
interface NetworkNode {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  opacity: number
}

// 연결선 인터페이스
interface Connection {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  opacity: number
}

// 기하학적 네트워크 애니메이션 컴포넌트
function GeometricNetworkAnimation() {
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // 노드 생성 (더 많은 노드)
    const newNodes: NetworkNode[] = []
    for (let i = 0; i < 28; i++) {
      newNodes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        opacity: 0.3 + Math.random() * 0.5
      })
    }
    setNodes(newNodes)

    // 노드 움직임 애니메이션 (더 부드러운 움직임)
    const animationInterval = setInterval(() => {
      setNodes(prevNodes => prevNodes.map(node => {
        // 속도 변화를 더 부드럽게
        let newVx = node.vx + (Math.random() - 0.5) * 0.008
        let newVy = node.vy + (Math.random() - 0.5) * 0.008
        
        // 속도 제한 (더 자연스러운 움직임)
        const maxSpeed = 0.15
        newVx = Math.max(-maxSpeed, Math.min(maxSpeed, newVx))
        newVy = Math.max(-maxSpeed, Math.min(maxSpeed, newVy))
        
        // 마찰력 적용 (더 자연스러운 감속)
        newVx *= 0.995
        newVy *= 0.995
        
        return {
          ...node,
          x: (node.x + newVx + 100) % 100,
          y: (node.y + newVy + 100) % 100,
          vx: newVx,
          vy: newVy,
          opacity: Math.max(0.2, Math.min(0.7, node.opacity + (Math.random() - 0.5) * 0.05))
        }
      }))
    }, 60) // 더 부드러운 프레임레이트

    return () => {
      clearInterval(animationInterval)
    }
  }, [])

  // 두 노드 간 거리 계산
  const getDistance = (node1: NetworkNode, node2: NetworkNode) => {
    const dx = node1.x - node2.x
    const dy = node1.y - node2.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  // 연결선 생성
  const connections: Connection[] = mounted ? nodes.flatMap((node, i) => 
    nodes.slice(i + 1).map((otherNode) => {
      const distance = getDistance(node, otherNode)
      const maxDistance = 25 // 연결 최대 거리
      
      if (distance < maxDistance) {
        const opacity = Math.max(0.1, (1 - distance / maxDistance) * 0.4)
        return {
          id: `${node.id}-${otherNode.id}`,
          x1: node.x,
          y1: node.y,
          x2: otherNode.x,
          y2: otherNode.y,
          opacity
        }
      }
      return null
    }).filter((connection): connection is Connection => connection !== null)
  ).flat() : []

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* SVG for lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.8)" />
            <stop offset="100%" stopColor="rgba(192, 132, 252, 0.6)" />
          </linearGradient>
        </defs>
        
        {connections.map((connection) => (
          <line
            key={connection.id}
            x1={`${connection.x1}%`}
            y1={`${connection.y1}%`}
            x2={`${connection.x2}%`}
            y2={`${connection.y2}%`}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            opacity={connection.opacity}
            className="transition-opacity duration-300"
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute w-2 h-2 rounded-full transition-all duration-300"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(192, 132, 252, 0.9), rgba(139, 92, 246, 0.6))',
            boxShadow: '0 0 8px rgba(168, 85, 247, 0.4)',
            opacity: node.opacity
          }}
        />
      ))}

      {/* Subtle floating particles */}
      {nodes.slice(0, 15).map((node, i) => (
        <div
          key={`particle-${node.id}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${(node.x + i * 8) % 100}%`,
            top: `${(node.y + i * 6) % 100}%`,
            transform: 'translate(-50%, -50%)',
            background: 'rgba(168, 85, 247, 0.25)',
            opacity: node.opacity * 0.5,
            transition: 'all 0.4s ease-out'
          }}
        />
      ))}
      
      {/* Additional micro particles */}
      {nodes.slice(15, 25).map((node, i) => (
        <div
          key={`micro-${node.id}`}
          className="absolute w-0.5 h-0.5 rounded-full"
          style={{
            left: `${(node.x + i * 4) % 100}%`,
            top: `${(node.y + i * 10) % 100}%`,
            transform: 'translate(-50%, -50%)',
            background: 'rgba(192, 132, 252, 0.4)',
            opacity: node.opacity * 0.3,
            transition: 'all 0.6s ease-out'
          }}
        />
      ))}
    </div>
  )
}

export default function MusicInfoPage() {
  const [movieTitle, setMovieTitle] = useState('')
  const [movieDirector, setMovieDirector] = useState('')
  const [musicTitle, setMusicTitle] = useState('')
  const [musicArtist, setMusicArtist] = useState('')
  const [musicYoutubeUrl, setMusicYoutubeUrl] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedInfo, setExtractedInfo] = useState<{title: string, artist: string} | null>(null)
  const router = useRouter()

  // 기존 데이터 불러오기
  useEffect(() => {
    const surveyData = JSON.parse(localStorage.getItem('surveyData') || '{}')
    if (surveyData.movieTitle) setMovieTitle(surveyData.movieTitle)
    if (surveyData.movieDirector) setMovieDirector(surveyData.movieDirector)
    if (surveyData.musicTitle) setMusicTitle(surveyData.musicTitle)
    if (surveyData.musicArtist) setMusicArtist(surveyData.musicArtist)
    if (surveyData.musicYoutubeUrl) setMusicYoutubeUrl(surveyData.musicYoutubeUrl)
  }, [])

  const extractMusicFromYoutube = async () => {
    if (!musicYoutubeUrl) return

    setIsExtracting(true)
    try {
      const response = await fetch('/api/extract-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: musicYoutubeUrl, type: 'music' })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setExtractedInfo(result.data)
          setMusicTitle(result.data.title)
          setMusicArtist(result.data.artist)
        }
      }
    } catch (error) {
      console.error('음악 정보 추출 실패:', error)
    } finally {
      setIsExtracting(false)
    }
  }



  const handleNext = () => {
    // 데이터 저장
    const surveyData = JSON.parse(localStorage.getItem('surveyData') || '{}')
    
    // 영화 및 음악 정보 저장
    surveyData.movieTitle = movieTitle
    surveyData.movieDirector = movieDirector
    surveyData.musicTitle = musicTitle
    surveyData.musicArtist = musicArtist
    surveyData.musicYoutubeUrl = musicYoutubeUrl
    localStorage.setItem('surveyData', JSON.stringify(surveyData))
    
    // 다음 페이지로 이동
    router.push('/survey/fragrance-preferences')
  }

  const handleJIMFFPlaylist = () => {
    window.open('https://linktr.ee/jimffculture', '_blank')
  }

  const canProceed = movieTitle.trim() !== '' && movieDirector.trim() !== '' && musicTitle.trim() !== '' && musicArtist.trim() !== '' && musicYoutubeUrl.trim() !== ''

  return (
    <SurveyLayout showMusicEffect={false}>
      {/* 기하학적 네트워크 애니메이션 */}
      <GeometricNetworkAnimation />
      
      <div className="w-full max-w-[380px] space-y-8 relative z-10">
        {/* 진행 표시 */}
        <ProgressIndicator currentStep={2} totalSteps={5} />

        {/* 메인 설문 카드 */}
        <SurveyCard>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">
              영화와 OST 정보를 입력하세요
            </h1>
            <p className="text-white/80">
              모든 항목을 입력해주세요
            </p>
          </div>

          {/* 영화 제목 입력 섹션 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white/90">
              영화 제목 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={movieTitle}
              onChange={(e) => setMovieTitle(e.target.value)}
              placeholder="영화 제목을 입력하세요"
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
              style={{
                transform: 'perspective(300px) rotateX(2deg)',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
              }}
              required
            />
          </div>

          {/* 감독 입력 섹션 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white/90">
              감독 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={movieDirector}
              onChange={(e) => setMovieDirector(e.target.value)}
              placeholder="감독명을 입력하세요"
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
              style={{
                transform: 'perspective(300px) rotateX(2deg)',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
              }}
              required
            />
          </div>

          {/* OST 정보 입력 섹션 */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">
                OST 제목 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="OST 제목을 입력하세요"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                style={{
                  transform: 'perspective(300px) rotateX(2deg)',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">
                아티스트/가수 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={musicArtist}
                onChange={(e) => setMusicArtist(e.target.value)}
                placeholder="아티스트/가수명을 입력하세요"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                style={{
                  transform: 'perspective(300px) rotateX(2deg)',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">
                OST YouTube 링크 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={musicYoutubeUrl}
                  onChange={(e) => setMusicYoutubeUrl(e.target.value)}
                  placeholder="OST YouTube 링크를 입력하세요..."
                  className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                  style={{
                    transform: 'perspective(300px) rotateX(2deg)',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                  }}
                  required
                />
                <button
                  onClick={extractMusicFromYoutube}
                  disabled={!musicYoutubeUrl || isExtracting}
                  className="hidden px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl text-xs font-medium hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  style={{
                    transform: 'perspective(300px) rotateX(2deg)',
                    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  {isExtracting ? '추출중...' : '추출'}
                </button>
              </div>
              
              {extractedInfo && (
                <div 
                  className="mt-3 p-4 bg-green-500/20 border border-green-400/50 rounded-xl backdrop-blur-sm"
                  style={{ transform: 'perspective(300px) rotateX(2deg)' }}
                >
                  <p className="text-sm text-green-200 font-medium">
                    ✓ 추출됨: {extractedInfo.title}
                  </p>
                </div>
              )}
            </div>
          </div>



          {/* 제천음악영화제 플레이리스트 버튼 */}
          <button
            onClick={handleJIMFFPlaylist}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
            style={{
              transform: 'perspective(300px) rotateX(-2deg) translateZ(5px)',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
            }}
          >
            <div className="flex items-center justify-center gap-2">
                              <span>제천국제음악영화제 PICK<br/>플레이리스트 들으러 가기</span>
            </div>
          </button> 
        </SurveyCard>

        {/* 네비게이션 버튼 */}
        <NavigationButtons
          prevLink="/survey/movie-genres"
          onNext={handleNext}
          nextDisabled={!canProceed}
        />
        
        {!canProceed && (
          <p className="text-white/60 text-sm text-center">
            모든 항목을 입력해주세요 (영화제목, 감독, OST제목, 아티스트, YouTube링크)
          </p>
        )}
      </div>
    </SurveyLayout>
  )
} 