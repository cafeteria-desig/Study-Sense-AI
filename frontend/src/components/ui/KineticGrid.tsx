import { useEffect, useRef, type ReactNode } from 'react'

const CELL_SIZE = 60
const DOT_SPACING = 30

export function KineticGrid({
  children,
  className = '',
}: {
  children?: ReactNode
  className?: string
  globalColor?: 'default' | 'monochrome'
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawGrid = () => {
      const W = window.innerWidth
      const H = window.innerHeight
      canvas.width = W
      canvas.height = H

      ctx.clearRect(0, 0, W, H)

      // Dark Background
      ctx.fillStyle = '#08080a'
      ctx.fillRect(0, 0, W, H)

      // Static Ambient Dot Matrix
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      for (let x = DOT_SPACING / 2; x < W; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < H; y += DOT_SPACING) {
          ctx.beginPath()
          ctx.arc(x, y, 0.75, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Static Hairline Monochrome Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1

      const cols = Math.ceil(W / CELL_SIZE)
      const rows = Math.ceil(H / CELL_SIZE)

      // Horizontal Lines
      for (let r = 0; r <= rows; r++) {
        const y = r * CELL_SIZE
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }

      // Vertical Lines
      for (let c = 0; c <= cols; c++) {
        const x = c * CELL_SIZE
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }

      // Ambient Intersection Nodes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          ctx.beginPath()
          ctx.arc(c * CELL_SIZE, r * CELL_SIZE, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    drawGrid()
    window.addEventListener('resize', drawGrid)
    return () => window.removeEventListener('resize', drawGrid)
  }, [])

  return (
    <div
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {children && <div className="relative z-10 w-full h-full pointer-events-auto">{children}</div>}
    </div>
  )
}

export default KineticGrid
