'use client'

import { useState, useEffect, ReactNode, useRef } from 'react'

interface SurveyLayoutProps {
  children: ReactNode
  showMusicEffect?: boolean
}

export default function SurveyLayout({ children, showMusicEffect = false }: SurveyLayoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !showMusicEffect) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let time = 0;
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 주파수 대역 설정
    const frequencyBands = 64; // 이퀄라이저 바 개수
    const bassRange = 8; // 저음 대역
    const midRange = 24; // 중음 대역
    
         const drawFrequencyVisualizer = () => {
       // 완전한 검은색 배경
       ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerY = canvas.height / 2;
      const barWidth = canvas.width / frequencyBands;
      
             // 주파수 스펙트럼 시뮬레이션
       for (let i = 0; i < frequencyBands; i++) {
         const x = i * barWidth;
         
         // 주파수별 높이 계산 (베이스는 더 큰 진폭, 트레블은 더 빠른 변화)
         let amplitude;
         
         if (i < bassRange) {
           // 저음 대역
           amplitude = Math.sin(time * 0.1 + i * 0.2) * 0.6 + 
                      Math.sin(time * 0.05 + i * 0.1) * 0.4;
         } else if (i < bassRange + midRange) {
           // 중음 대역  
           amplitude = Math.sin(time * 0.15 + i * 0.3) * 0.5 + 
                      Math.sin(time * 0.08 + i * 0.15) * 0.3;
         } else {
           // 고음 대역
           amplitude = Math.sin(time * 0.25 + i * 0.5) * 0.4 + 
                      Math.sin(time * 0.12 + i * 0.25) * 0.2;
         }
         
         // 진폭을 0-1 범위로 정규화
         amplitude = Math.abs(amplitude);
         const barHeight = amplitude * (canvas.height * 0.3);
         
         // 이퀄라이저 바 그리기 (위아래 대칭) - 흰색으로
         ctx.shadowBlur = 20;
         ctx.shadowColor = '#ffffff';
         
         // 메인 바
         ctx.fillStyle = '#ffffff';
         ctx.fillRect(x + 1, centerY - barHeight/2, barWidth - 2, barHeight);
         
         // 강한 발광 효과를 위한 추가 레이어
         ctx.shadowBlur = 40;
         ctx.globalAlpha = 0.6;
         ctx.fillRect(x + 1, centerY - barHeight/2, barWidth - 2, barHeight);
         
         ctx.globalAlpha = 1;
         ctx.shadowBlur = 0;
         
         // 반사 효과 (하단) - 흰색 그라데이션
         const reflectionGradient = ctx.createLinearGradient(x, centerY + barHeight/2, x, centerY + barHeight);
         reflectionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
         reflectionGradient.addColorStop(1, 'rgba(0,0,0,0)');
         
         ctx.fillStyle = reflectionGradient;
         ctx.globalAlpha = 0.3;
         ctx.fillRect(x + 1, centerY + barHeight/2, barWidth - 2, barHeight/2);
         ctx.globalAlpha = 1;
       }
      
      // 중앙 메인 웨이브 (복합 주파수)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      
      for (let x = 0; x < canvas.width; x += 1) {
        // 복합 웨이브 (여러 주파수 합성)
        const progress = x / canvas.width;
        const wave1 = Math.sin(time * 0.1 + progress * Math.PI * 4) * 20;
        const wave2 = Math.sin(time * 0.15 + progress * Math.PI * 8) * 10;
        const wave3 = Math.sin(time * 0.08 + progress * Math.PI * 2) * 15;
        
        const y = centerY + wave1 + wave2 + wave3;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // 추가 하모닉 웨이브들
      for (let harmonic = 1; harmonic <= 3; harmonic++) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 / harmonic})`;
        ctx.lineWidth = 2 / harmonic;
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x += 2) {
          const progress = x / canvas.width;
          const wave = Math.sin(time * (0.1 * harmonic) + progress * Math.PI * (2 * harmonic)) * (30 / harmonic);
          const y = centerY + wave;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
             // 주파수 분석 라인들 (상하단) - 흰색으로
       const analysisLines = 16;
       for (let i = 0; i < analysisLines; i++) {
         const y = (canvas.height / analysisLines) * i;
         const intensity = Math.sin(time * 0.2 + i * 0.5) * 0.5 + 0.5;
         
         ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
         ctx.lineWidth = 1;
         ctx.setLineDash([5, 10]);
         ctx.beginPath();
         ctx.moveTo(0, y);
         ctx.lineTo(canvas.width, y);
         ctx.stroke();
         ctx.setLineDash([]);
       }
      
             // 펄스 효과 (중앙에서 퍼져나가는) - 흰색으로
       const pulseRadius = (Math.sin(time * 0.1) * 0.5 + 0.5) * 100 + 50;
       const pulseGradient = ctx.createRadialGradient(
         canvas.width / 2, centerY, 0,
         canvas.width / 2, centerY, pulseRadius
       );
       pulseGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
       pulseGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
       pulseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
       
       ctx.fillStyle = pulseGradient;
       ctx.globalAlpha = 0.8;
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       ctx.globalAlpha = 1;
      
      time += 1;
      animationRef.current = requestAnimationFrame(drawFrequencyVisualizer);
    };
    
    drawFrequencyVisualizer();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted, showMusicEffect]);

  return (
    <div className="min-h-screen bg-black relative">
      {/* 주파수 시각화 캔버스 - showMusicEffect가 true일 때만 */}
      {mounted && showMusicEffect && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'screen' }}
        />
      )}
      
      {/* 기본 배경 (음악 효과가 없을 때) */}
      {!showMusicEffect && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      )}

      {/* 중앙 콘텐츠 */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
} 