'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'

interface FormData {
  movieGenres: string[]
  musicTitle: string
  musicArtist: string
  youtubeLink: string
  musicRecommendations: string
  fragrancePreferences: string[]
  personalDescription: string
}

const movieGenreOptions = [
  '액션', '로맨스', '코미디', '드라마', '스릴러', 
  '공포', '판타지', 'SF', '애니메이션', '다큐멘터리'
]

const fragranceOptions = [
  '플로럴', '우디', '시트러스', '머스크', '바닐라', 
  '스파이시', '프루티', '그린', '오리엔탈', '마린'
]

export default function PreferenceForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<string | null>(null)
  const [extractedMusicInfo, setExtractedMusicInfo] = useState<{title: string, artist: string} | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      movieGenres: [],
      musicTitle: '',
      musicArtist: '',
      youtubeLink: '',
      musicRecommendations: '',
      fragrancePreferences: [],
      personalDescription: ''
    }
  })

  const watchedGenres = watch('movieGenres')
  const watchedFragrances = watch('fragrancePreferences')
  const watchedYoutubeLink = watch('youtubeLink')

  // YouTube 링크에서 음악 정보 추출
  const extractMusicFromYoutube = async () => {
    if (!watchedYoutubeLink) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/extract-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: watchedYoutubeLink })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setExtractedMusicInfo(result.data)
          setValue('musicTitle', result.data.title)
          setValue('musicArtist', result.data.artist)
        }
      }
    } catch (error) {
      console.error('음악 정보 추출 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/analyze-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        setResults(result.recommendation)
      } else {
        throw new Error('분석 요청 실패')
      }
    } catch (error) {
      console.error('취향 분석 실패:', error)
      setResults('죄송합니다. 분석 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelection = (value: string, currentArray: string[], fieldName: keyof FormData) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    setValue(fieldName, newArray)
  }

  return (
    <div className="glass-effect rounded-2xl p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold gradient-text mb-2">취향 분석</h2>
        <p className="text-sm text-gray-600">
          당신의 취향을 입력하여 맞춤 향을 추천받으세요
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 영화 장르 선택 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            선호하는 영화 장르 <span className="text-blue-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {movieGenreOptions.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleSelection(genre, watchedGenres, 'movieGenres')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  watchedGenres.includes(genre)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          {errors.movieGenres && (
            <p className="text-red-500 text-xs mt-1">최소 하나의 장르를 선택해주세요</p>
          )}
        </div>

        {/* 음악 정보 입력 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">
            좋아하는 음악 정보
          </h3>
          
          {/* YouTube 링크 */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              YouTube 링크 (선택사항)
            </label>
            <div className="flex gap-2">
              <input
                {...register('youtubeLink')}
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={extractMusicFromYoutube}
                disabled={!watchedYoutubeLink || isLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                추출
              </button>
            </div>
            {extractedMusicInfo && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700">
                  추출됨: {extractedMusicInfo.title} - {extractedMusicInfo.artist}
                </p>
              </div>
            )}
          </div>

          {/* 곡제목 */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              곡제목
            </label>
            <input
              {...register('musicTitle')}
              type="text"
              placeholder="곡제목을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 아티스트 */}
          <div>
            <label className="block text-xs text-gray-600 mb-2">
              아티스트
            </label>
            <input
              {...register('musicArtist')}
              type="text"
              placeholder="아티스트명을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>        {/* 추천곡 입력 */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">
            다른 추천하고 싶은 곡들
          </label>
          <textarea
            {...register('musicRecommendations')}
            placeholder="추천하고 싶은 다른 곡들을 입력해주세요..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 향 계열 선호도 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            선호하는 향 계열 <span className="text-blue-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {fragranceOptions.map((fragrance) => (
              <button
                key={fragrance}
                type="button"
                onClick={() => toggleSelection(fragrance, watchedFragrances, 'fragrancePreferences')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  watchedFragrances.includes(fragrance)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {fragrance}
              </button>
            ))}
          </div>
          {errors.fragrancePreferences && (
            <p className="text-red-500 text-xs mt-1">최소 하나의 향 계열을 선택해주세요</p>
          )}
        </div>

        {/* 주관식 응답 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            자신을 표현하는 한 문장 <span className="text-blue-600">*</span>
          </label>
          <textarea
            {...register('personalDescription', { 
              required: '자신을 표현하는 문장을 입력해주세요',
              minLength: { value: 10, message: '최소 10자 이상 입력해주세요' }
            })}
            placeholder="예: 조용한 카페에서 책을 읽으며 차분한 음악을 듣는 걸 좋아해요..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          {errors.personalDescription && (
            <p className="text-red-500 text-xs mt-1">{errors.personalDescription.message}</p>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              AI 분석 중...
            </>
          ) : (
            'AI 취향 분석 시작'
          )}
        </button>
      </form>

      {/* 결과 표시 */}
      {results && (
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <h3 className="text-lg font-bold gradient-text mb-3">
            🌸 맞춤 향 추천
          </h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {results}
          </div>
        </div>
      )}
    </div>
  )
}