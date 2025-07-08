'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SurveyLayout from '../../components/SurveyLayout'
import ProgressIndicator from '../../components/ProgressIndicator'
import SurveyCard from '../../components/SurveyCard'
import NavigationButtons from '../../components/NavigationButtons'

// 음파 파티클 인터페이스
interface AudioWave {
  id: number
  x: number
  y: number
  height: number
  frequency: number
  amplitude: number
  phase: number
  color: string
}

// 음파 파티클 컴포넌트
function AudioWaveParticles() {
  const [waves, setWaves] = useState<AudioWave[]>([])
  const [time, setTime] = useState(0)

  useEffect(() => {
    // 클라이언트에서만 음파 생성
    const newWaves: AudioWave[] = []
    for (let i = 0; i < 30; i++) {
      newWaves.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        height: Math.random() * 60 + 20,
        frequency: Math.random() * 1.5 + 0.8,
        amplitude: Math.random() * 40 + 15,
        phase: Math.random() * Math.PI * 2,
        color: `hsl(${240 + Math.random() * 80}, 80%, ${50 + Math.random() * 30}%)`
      })
    }
    setWaves(newWaves)

    // 애니메이션 프레임을 사용한 부드러운 업데이트
    let animationId: number
    const updateAnimation = () => {
      setTime(prev => prev + 0.01)
      animationId = requestAnimationFrame(updateAnimation)
    }
    animationId = requestAnimationFrame(updateAnimation)

    // 파티클 위치 업데이트
    const interval = setInterval(() => {
      setWaves(prevWaves => prevWaves.map(wave => ({
        ...wave,
        x: (wave.x + Math.random() * 1.5 - 0.75 + 100) % 100,
        y: (wave.y + Math.random() * 1 - 0.5 + 100) % 100,
        height: Math.max(15, Math.min(90, wave.height + Math.random() * 15 - 7.5)),
        phase: wave.phase + 0.05
      })))
    }, 200)

    return () => {
      cancelAnimationFrame(animationId)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {waves.map((wave) => (
        <div
          key={wave.id}
          className="absolute"
          style={{
            left: `${wave.x}%`,
            top: `${wave.y}%`,
            width: '3px',
            height: `${wave.height + Math.sin(time * 2 + wave.phase) * wave.amplitude * 0.8}px`,
            background: `linear-gradient(to top, ${wave.color}, transparent)`,
            borderRadius: '2px',
            transform: `translateY(-50%) rotateZ(${Math.sin(time * 1.5 + wave.phase) * 20}deg)`,
            opacity: 0.5 + Math.sin(time * 3 + wave.phase) * 0.3,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 15px ${wave.color}`,
            transition: 'all 0.2s ease-out'
          }}
        />
      ))}
      
      {/* 하단 주파수 바 효과 */}
      {waves.slice(0, 12).map((wave, waveIndex) => (
        <div
          key={`freq-${wave.id}`}
          className="absolute"
          style={{
            left: `${5 + waveIndex * 7.5}%`,
            bottom: '10%',
            width: '5px',
            height: `${40 + Math.sin(time * 4 + waveIndex * 0.5) * 50}px`,
            background: `linear-gradient(to top, ${wave.color}aa, ${wave.color}30)`,
            borderRadius: '3px',
            transform: `scaleY(${0.6 + Math.sin(time * 2.5 + waveIndex * 0.3) * 0.6})`,
            opacity: 0.7 + Math.sin(time * 2 + waveIndex * 0.2) * 0.2,
            boxShadow: `0 0 25px ${wave.color}`,
            transition: 'transform 0.1s ease-out'
          }}
        />
      ))}

      {/* 원형 파티클 효과 */}
      {waves.slice(0, 10).map((wave) => (
        <div
          key={`circle-${wave.id}`}
          className="absolute"
          style={{
            left: `${(wave.x + 30) % 100}%`,
            top: `${(wave.y + 20) % 100}%`,
            width: `${20 + Math.sin(time * 2.5 + wave.phase) * 15}px`,
            height: `${20 + Math.sin(time * 2.5 + wave.phase) * 15}px`,
            background: `radial-gradient(circle, ${wave.color}40, transparent)`,
            borderRadius: '50%',
            opacity: 0.4 + Math.sin(time * 2 + wave.phase) * 0.3,
            transform: `scale(${0.8 + Math.sin(time * 1.8 + wave.phase) * 0.5})`,
            transition: 'all 0.15s ease-out'
          }}
        />
      ))}

      {/* 중앙에서 퍼져나가는 파동 효과 */}
      {[1, 2, 3, 4].map((ring) => (
        <div
          key={`ring-${ring}`}
          className="absolute left-1/2 top-1/2"
          style={{
            width: `${80 + ring * 40 + Math.sin(time * 1.5 + ring) * 30}px`,
            height: `${80 + ring * 40 + Math.sin(time * 1.5 + ring) * 30}px`,
            border: `2px solid hsla(${260 + ring * 15}, 70%, 60%, ${0.3 - ring * 0.06})`,
            borderRadius: '50%',
            transform: `translate(-50%, -50%) scale(${1 + Math.sin(time * 1.2 + ring) * 0.3})`,
            opacity: 0.6 - ring * 0.1 + Math.sin(time * 2 + ring) * 0.2
          }}
        />
      ))}

      {/* 좌우로 움직이는 파티클 스트림 */}
      {waves.slice(0, 6).map((wave, streamIndex) => (
        <div
          key={`stream-${wave.id}`}
          className="absolute"
          style={{
            left: `${(time * 50 + streamIndex * 15) % 100}%`,
            top: `${20 + streamIndex * 12}%`,
            width: '2px',
            height: `${25 + Math.sin(time * 3 + streamIndex) * 20}px`,
            background: `linear-gradient(45deg, ${wave.color}80, transparent)`,
            borderRadius: '1px',
            opacity: 0.5 + Math.sin(time * 2.5 + streamIndex) * 0.3,
            transform: `rotateZ(${45 + Math.sin(time * 2 + streamIndex) * 30}deg)`,
            filter: 'blur(1px)',
            boxShadow: `0 0 10px ${wave.color}`
          }}
        />
      ))}
    </div>
  )
}

export default function MusicInfoPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [musicTitle, setMusicTitle] = useState('')
  const [musicArtist, setMusicArtist] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedInfo, setExtractedInfo] = useState<{title: string, artist: string} | null>(null)
  const router = useRouter()

  // 기존 데이터 불러오기
  useEffect(() => {
    const surveyData = JSON.parse(localStorage.getItem('surveyData') || '{}')
    if (surveyData.youtubeLink) setYoutubeUrl(surveyData.youtubeLink)
    if (surveyData.musicTitle) setMusicTitle(surveyData.musicTitle)
    if (surveyData.musicArtist) setMusicArtist(surveyData.musicArtist)
  }, [])

  const extractMusicFromYoutube = async () => {
    if (!youtubeUrl) return

    setIsExtracting(true)
    try {
      const response = await fetch('/api/extract-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl })
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
    
    // 음악 정보 저장
    if (youtubeUrl || (musicTitle && musicArtist)) {
      surveyData.youtubeLink = youtubeUrl
      surveyData.musicTitle = musicTitle
      surveyData.musicArtist = musicArtist
      localStorage.setItem('surveyData', JSON.stringify(surveyData))
    }
    
    // 다음 페이지로 이동
    router.push('/survey/fragrance-preferences')
  }

  const handleJIMFFPlaylist = () => {
    window.open('https://www.youtube.com/playlist?list=PLYour_JIMFF_Playlist_ID', '_blank')
  }

  const canProceed = musicTitle.trim() !== '' || musicArtist.trim() !== ''

  return (
    <SurveyLayout>
      {/* 음파 파티클 효과 */}
      <AudioWaveParticles />
      
      <div className="w-full max-w-[380px] space-y-8 relative z-10">
        {/* 진행 표시 */}
        <ProgressIndicator currentStep={2} totalSteps={5} />

        {/* 메인 설문 카드 */}
        <SurveyCard>
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">
              좋아하는 음악은?
            </h1>
            <p className="text-white/80">
              YouTube 링크나 직접 입력해주세요
            </p>
          </div>

          {/* YouTube 링크 섹션 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-white/90">
              YouTube 링크 (선택사항)
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                style={{
                  transform: 'perspective(300px) rotateX(2deg)',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                }}
              />
              <button
                onClick={extractMusicFromYoutube}
                disabled={!youtubeUrl || isExtracting}
                className="px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl text-xs font-medium hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
                className="p-4 bg-green-500/20 border border-green-400/50 rounded-xl backdrop-blur-sm"
                style={{ transform: 'perspective(300px) rotateX(2deg)' }}
              >
                <p className="text-sm text-green-200 font-medium">
                  ✓ 추출됨: {extractedInfo.title} - {extractedInfo.artist}
                </p>
              </div>
            )}
          </div>

          {/* 구분선 */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-white/30"></div>
            <span className="px-4 text-sm text-white/60">또는 직접 입력</span>
            <div className="flex-1 border-t border-white/30"></div>
          </div>

          {/* 직접 입력 섹션 */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">
                곡제목
              </label>
              <input
                type="text"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="곡제목을 입력하세요"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                style={{
                  transform: 'perspective(300px) rotateX(2deg)',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">
                아티스트
              </label>
              <input
                type="text"
                value={musicArtist}
                onChange={(e) => setMusicArtist(e.target.value)}
                placeholder="아티스트명을 입력하세요"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                style={{
                  transform: 'perspective(300px) rotateX(2deg)',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                }}
              />
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
              <span>🎵 제천음악영화제 PICK 플레이리스트 들으러 가기</span>
              <span className="text-lg">→</span>
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
            곡제목 또는 아티스트 중 하나는 입력해주세요
          </p>
        )}
      </div>
    </SurveyLayout>
  )
} 