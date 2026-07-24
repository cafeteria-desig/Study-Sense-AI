import { useEffect, useRef, type ReactNode } from 'react'

interface NodePoint {
  x0: number
  y0: number
  x: number
  y: number
  vx: number
  vy: number
}

interface KineticGridProps {
  children?: ReactNode
  className?: string
  globalColor?: 'default' | 'monochrome'
}

export function KineticGrid({
  children,
  className = '',
  globalColor = 'monochrome',
}: KineticGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let dpr = 1

    const STEP = 50
    const INFLUENCE_RADIUS = 220
    const PUSH_FORCE = 0.45
    const SPRING_STIFFNESS = 0.04
    const DAMPING = 0.84

    let nodes: NodePoint[][] = []
    let cols = 0
    let rows = 0

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = -9999
      let clientY = -9999
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX
        clientY = (e as MouseEvent).clientY
      }
      mouse.targetX = clientX
      mouse.targetY = clientY
      mouse.active = true
    }

    const onPointerLeave = () => {
      mouse.targetX = -9999
      mouse.targetY = -9999
      mouse.active = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('mouseleave', onPointerLeave)

    const initGrid = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      cols = Math.ceil(width / STEP) + 1
      rows = Math.ceil(height / STEP) + 1

      nodes = []
      for (let r = 0; r <= rows; r++) {
        const rowNodes: NodePoint[] = []
        for (let c = 0; c <= cols; c++) {
          const x0 = c * STEP
          const y0 = r * STEP
          rowNodes.push({
            x0,
            y0,
            x: x0,
            y: y0,
            vx: 0,
            vy: 0,
          })
        }
        nodes.push(rowNodes)
      }
    }

    initGrid()

    let handleResizeTimer: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(handleResizeTimer)
      handleResizeTimer = setTimeout(initGrid, 100)
    }
    window.addEventListener('resize', handleResize)

    let time = 0

    const render = () => {
      time += 0.02

      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15
        mouse.y += (mouse.targetY - mouse.y) * 0.15
      } else {
        mouse.x = -9999
        mouse.y = -9999
      }

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, height)

      const isDark = document.documentElement.classList.contains('dark') || true
      ctx.fillStyle = isDark ? '#08080a' : '#f8fafc'
      ctx.fillRect(0, 0, width, height)

      if (mouse.x > 0 && mouse.y > 0) {
        const spotlight = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          INFLUENCE_RADIUS * 1.4
        )
        spotlight.addColorStop(
          0,
          globalColor === 'monochrome'
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(16, 185, 129, 0.08)'
        )
        spotlight.addColorStop(
          0.5,
          globalColor === 'monochrome'
            ? 'rgba(255, 255, 255, 0.02)'
            : 'rgba(99, 102, 241, 0.04)'
        )
        spotlight.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = spotlight
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, INFLUENCE_RADIUS * 1.4, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const n = nodes[r]?.[c]
          if (!n) continue

          const waveX = Math.sin(time * 0.8 + n.y0 * 0.01) * 3
          const waveY = Math.cos(time * 0.7 + n.x0 * 0.01) * 3
          const targetX = n.x0 + waveX
          const targetY = n.y0 + waveY

          const dx = n.x - mouse.x
          const dy = n.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < INFLUENCE_RADIUS && dist > 0) {
            const force = (1 - dist / INFLUENCE_RADIUS) * PUSH_FORCE
            const angle = Math.atan2(dy, dx)
            n.vx += Math.cos(angle) * force * 14
            n.vy += Math.sin(angle) * force * 14
          }

          const fx = (targetX - n.x) * SPRING_STIFFNESS
          const fy = (targetY - n.y) * SPRING_STIFFNESS

          n.vx = (n.vx + fx) * DAMPING
          n.vy = (n.vy + fy) * DAMPING

          n.x += n.vx
          n.y += n.vy
        }
      }

      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'
      ctx.lineWidth = 1

      for (let r = 0; r <= rows; r++) {
        ctx.beginPath()
        for (let c = 0; c <= cols; c++) {
          const n = nodes[r]?.[c]
          if (!n) continue
          if (c === 0) {
            ctx.moveTo(n.x, n.y)
          } else {
            ctx.lineTo(n.x, n.y)
          }
        }
        ctx.stroke()
      }

      for (let c = 0; c <= cols; c++) {
        ctx.beginPath()
        for (let r = 0; r <= rows; r++) {
          const n = nodes[r]?.[c]
          if (!n) continue
          if (r === 0) {
            ctx.moveTo(n.x, n.y)
          } else {
            ctx.lineTo(n.x, n.y)
          }
        }
        ctx.stroke()
      }

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const n = nodes[r]?.[c]
          if (!n) continue
          const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
          const disp = Math.sqrt((n.x - n.x0) ** 2 + (n.y - n.y0) ** 2)

          const isDisplaced = disp > 2 || speed > 0.5
          const nodeRadius = isDisplaced ? Math.min(1.5 + speed * 0.4, 3.5) : 1.2

          if (isDisplaced) {
            const glowOpacity = Math.min(0.2 + disp * 0.02, 0.8)
            ctx.fillStyle =
              globalColor === 'monochrome'
                ? `rgba(255, 255, 255, ${glowOpacity})`
                : `rgba(16, 185, 129, ${glowOpacity})`
          } else {
            ctx.fillStyle = isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(0, 0, 0, 0.15)'
          }

          ctx.beginPath()
          ctx.arc(n.x, n.y, nodeRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.restore()
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('mouseleave', onPointerLeave)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [globalColor])

  return (
    <div
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />
      {children && (
        <div className="relative z-10 w-full h-full pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  )
}

export default KineticGrid
