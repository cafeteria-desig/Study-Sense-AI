import { useEffect, useRef } from 'react'

const VS_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FS_SOURCE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform vec2  u_scroll;

// 2D Random
float hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p.x + p.y) * 43758.5453123);
}

// 2D Value Noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// 4-Octave FBM
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  for (int i = 0; i < 4; ++i) {
    v += a * noise(p);
    p = p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Base background void #08080a
  vec3 col = vec3(0.031, 0.031, 0.039);

  // Column grid setup (~130 vertical spectrum bars across width)
  float totalBars = 130.0;
  float barId = floor(uv.x * totalBars);
  float barUvX = fract(uv.x * totalBars);

  // Discrete bar gap (small gap on either side of each bar column)
  float barMask = smoothstep(0.05, 0.15, barUvX) * (1.0 - smoothstep(0.85, 0.95, barUvX));

  // Time & Scroll vertical noise field offset
  float scrollOffset = u_scroll.x * 2.5;
  float t = u_time * 0.4;

  // Bar height driven by 4-octave FBM noise
  vec2 noiseCoord = vec2(barId * 0.045, scrollOffset + t * 0.15);
  float nVal = fbm(noiseCoord);

  // Mirrored top/bottom around vertical center (0.5)
  float distFromCenter = abs(uv.y - 0.5) * 2.0; // 0 at center, 1 at top/bottom
  float barHeight = nVal * 0.85 + 0.1;

  // Bar vertical cutoff mask
  float barLengthMask = smoothstep(barHeight, barHeight - 0.08, distFromCenter);

  // Vignette fade towards top and bottom edges
  float edgeVignette = smoothstep(1.0, 0.35, distFromCenter);

  // Blue -> Amber iridescent spectrum gradient
  vec3 blueCol  = vec3(0.36, 0.56, 1.0);  // rgb(0.36, 0.56, 1.0)
  vec3 amberCol = vec3(1.0, 0.62, 0.34);  // rgb(1.0, 0.62, 0.34)
  vec3 whiteHighlight = vec3(1.0, 0.98, 0.92);

  // Interpolate color per bar based on bar ID + noise peak highlights
  float colorMix = sin(barId * 0.12 + t * 0.3) * 0.5 + 0.5;
  vec3 spectrumCol = mix(blueCol, amberCol, colorMix);

  // Add white highlight at noise peaks
  if (nVal > 0.65) {
    float peak = (nVal - 0.65) / 0.35;
    spectrumCol = mix(spectrumCol, whiteHighlight, peak * 0.6);
  }

  // Combine spectrum color with masks and opacity
  float intensity = barMask * barLengthMask * edgeVignette * (0.65 + nVal * 0.35);
  col = mix(col, spectrumCol, intensity * 0.75);

  // Film grain noise
  float grain = (hash(gl_FragCoord.xy + vec2(u_time * 0.05)) - 0.5) * 0.025;
  col += grain;

  gl_FragColor = vec4(col, 1.0);
}
`

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type)
  if (!sh) return null
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('Spectrum Shader Compile Error:', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export function SpectrumShaderCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = (canvas.getContext('webgl2') ||
               canvas.getContext('webgl') ||
               canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return

    const vs = compileShader(gl, gl.VERTEX_SHADER, VS_SOURCE)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE)
    if (!vs || !fs) return

    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('Spectrum Shader Link Error:', gl.getProgramInfoLog(prog))
      return
    }

    gl.useProgram(prog)

    const buf = gl.createBuffer()
    if (!buf) return
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
      gl.STATIC_DRAW
    )

    const posLoc = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'u_resolution')
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uScroll = gl.getUniformLocation(prog, 'u_scroll')

    const resize = () => {
      // Cap device pixel ratio at 1.5 for performance
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    let scrollProgress = 0
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    let rafId = 0
    let startTime: number | null = null

    const render = (ts: number) => {
      if (document.hidden) {
        rafId = requestAnimationFrame(render)
        return
      }

      if (!startTime) startTime = ts
      const t = (ts - startTime) * 0.001

      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height)
      if (uTime) gl.uniform1f(uTime, t)
      if (uScroll) gl.uniform2f(uScroll, scrollProgress, 0.0)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', handleScroll)
      gl.deleteBuffer(buf)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteProgram(prog)
    }
  }, [])

  return (
    <div className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full block" />
      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#08080a]/30 to-[#08080a]/80 pointer-events-none" />
    </div>
  )
}

export default SpectrumShaderCanvas
