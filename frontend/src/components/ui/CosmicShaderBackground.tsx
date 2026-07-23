import { useEffect, useRef } from 'react'

export function CosmicShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const render = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      // Base ambient dark gradient
      const isDark = document.documentElement.classList.contains('dark')
      const baseGrad = ctx.createLinearGradient(0, 0, width, height)
      if (isDark) {
        baseGrad.addColorStop(0, '#090b10')
        baseGrad.addColorStop(1, '#050608')
      } else {
        baseGrad.addColorStop(0, '#fafafa')
        baseGrad.addColorStop(1, '#f3f4f6')
      }
      ctx.fillStyle = baseGrad
      ctx.fillRect(0, 0, width, height)

      // Glowing Shader Orbs calculation
      time += 0.008

      // Orb 1: Emerald Positive Wave
      const x1 = width * 0.3 + Math.sin(time * 0.8) * 120
      const y1 = height * 0.3 + Math.cos(time * 0.6) * 100
      const rad1 = Math.min(width, height) * 0.45
      const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, rad1)
      grad1.addColorStop(0, isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.08)')
      grad1.addColorStop(0.6, isDark ? 'rgba(16, 185, 129, 0.03)' : 'rgba(16, 185, 129, 0.02)')
      grad1.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = grad1
      ctx.beginPath()
      ctx.arc(x1, y1, rad1, 0, Math.PI * 2)
      ctx.fill()

      // Orb 2: Deep Indigo Wave
      const x2 = width * 0.7 + Math.cos(time * 0.7) * 150
      const y2 = height * 0.6 + Math.sin(time * 0.9) * 120
      const rad2 = Math.min(width, height) * 0.5
      const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, rad2)
      grad2.addColorStop(0, isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.06)')
      grad2.addColorStop(0.6, isDark ? 'rgba(99, 102, 241, 0.02)' : 'rgba(99, 102, 241, 0.01)')
      grad2.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = grad2
      ctx.beginPath()
      ctx.arc(x2, y2, rad2, 0, Math.PI * 2)
      ctx.fill()

      // Orb 3: Soft Cyan Cosmic Pulse
      const x3 = width * 0.5 + Math.sin(time * 0.5) * 100
      const y3 = height * 0.8 + Math.cos(time * 0.8) * 90
      const rad3 = Math.min(width, height) * 0.4
      const grad3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, rad3)
      grad3.addColorStop(0, isDark ? 'rgba(6, 182, 212, 0.10)' : 'rgba(6, 182, 212, 0.05)')
      grad3.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = grad3
      ctx.beginPath()
      ctx.arc(x3, y3, rad3, 0, Math.PI * 2)
      ctx.fill()

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
    />
  )
}
