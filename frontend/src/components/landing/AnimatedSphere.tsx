import { useEffect, useRef } from 'react'

export function AnimatedSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const mouseRef = useRef({ x: -1000, y: -1000, active: false })
  const rotXOffset = useRef(0)
  const rotYOffset = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const chars = '░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯'
    let time = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = {
        x: -1000,
        y: -1000,
        active: false,
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    const render = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const radius = Math.min(rect.width, rect.height) * 0.42

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const mouse = mouseRef.current
      const hoverRadius = 80

      // Smoothly update rotation offset based on mouse position
      let targetRotX = 0
      let targetRotY = 0
      if (mouse.active) {
        // Tilt relative to center
        targetRotX = ((mouse.y - centerY) / centerY) * 0.45
        targetRotY = ((mouse.x - centerX) / centerX) * 0.45
      }
      rotXOffset.current += (targetRotX - rotXOffset.current) * 0.08
      rotYOffset.current += (targetRotY - rotYOffset.current) * 0.08

      const points: { x: number; y: number; z: number; char: string; size: number; isHovered: boolean }[] = []

      for (let phi = 0; phi < Math.PI * 2; phi += 0.15) {
        for (let theta = 0; theta < Math.PI; theta += 0.15) {
          const x = Math.sin(theta) * Math.cos(phi + time * 0.5)
          const y = Math.sin(theta) * Math.sin(phi + time * 0.5)
          const z = Math.cos(theta)

          // Rotate with mouse offsets
          const rotY = time * 0.3 + rotYOffset.current
          const newX = x * Math.cos(rotY) - z * Math.sin(rotY)
          const newZ = x * Math.sin(rotY) + z * Math.cos(rotY)

          const rotX = time * 0.2 + rotXOffset.current
          const newY = y * Math.cos(rotX) - newZ * Math.sin(rotX)
          const finalZ = y * Math.sin(rotX) + newZ * Math.cos(rotX)

          const depth = (finalZ + 1) / 2
          const charIndex = Math.floor(depth * (chars.length - 1))

          let px = centerX + newX * radius
          let py = centerY + newY * radius
          let size = 12
          let isHovered = false

          if (mouse.active) {
            const dx = px - mouse.x
            const dy = py - mouse.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < hoverRadius) {
              isHovered = true
              const force = (hoverRadius - dist) / hoverRadius
              // Repulse particles away from mouse
              const push = force * 22
              px += (dx / (dist || 1)) * push
              py += (dy / (dist || 1)) * push
              size = 12 + force * 6
            }
          }

          points.push({
            x: px,
            y: py,
            z: finalZ,
            char: chars[charIndex],
            size,
            isHovered,
          })
        }
      }

      points.sort((a, b) => a.z - b.z)

      const isDark = document.documentElement.classList.contains('dark')
      points.forEach((point) => {
        let alpha = 0.15 + (point.z + 1) * 0.4
        if (point.isHovered) {
          alpha = Math.min(1.0, alpha + 0.35)
        }
        
        ctx.font = point.isHovered 
          ? `bold ${Math.round(point.size)}px monospace` 
          : `${Math.round(point.size)}px monospace`
        
        ctx.fillStyle = isDark
          ? `rgba(240, 240, 230, ${alpha})`
          : `rgba(15, 12, 8, ${alpha})`
        
        ctx.fillText(point.char, point.x, point.y)
      })

      time += 0.018
      frameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
      }
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
}
