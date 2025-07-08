import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'JIMFF - AI 취향 분석 & 향 추천',
  description: 'AI가 분석하는 당신의 취향, 완벽한 향을 찾아드립니다',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen">
        <div className="relative min-h-screen">
          {/* Background gradient overlay */}
          <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-gray-50/30 to-slate-100/50 pointer-events-none" />
          
          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
