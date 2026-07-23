import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const T = THREE as any

export function RobotBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationFrameId: number

    // 1. Scene, Camera, Renderer Setup
    const scene = new T.Scene()

    const camera = new T.PerspectiveCamera(
      40,
      (container.clientWidth || 1) / (container.clientHeight || 1),
      0.1,
      100
    )
    camera.position.set(0, 0.3, 5.2)

    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    if (T.PCFSoftShadowMap) {
      renderer.shadowMap.type = T.PCFSoftShadowMap
    }

    while (container.firstChild) container.removeChild(container.firstChild)
    container.appendChild(renderer.domElement)

    // 2. Lighting System (Dark Monochrome Accent Lights)
    const ambientLight = new T.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const mainLight = new T.DirectionalLight(0x00ffc6, 1.2)
    mainLight.position.set(2, 5, 4)
    mainLight.castShadow = true
    scene.add(mainLight)

    const rimLight = new T.DirectionalLight(0xffffff, 0.8)
    rimLight.position.set(-4, 3, -3)
    scene.add(rimLight)

    // 3. Procedural Robot Group Construction
    const robotGroup = new T.Group()
    robotGroup.position.set(0, -0.3, 0)
    scene.add(robotGroup)

    // Chassis Body
    const bodyMat = new T.MeshStandardMaterial({
      color: 0x16161a,
      roughness: 0.7,
      metalness: 0.3
    })
    const bodyGeo = new T.SphereGeometry(0.45, 48, 48, 0, Math.PI * 2, Math.PI * 0.15, Math.PI * 0.85)
    const bodyMesh = new T.Mesh(bodyGeo, bodyMat)
    bodyMesh.castShadow = true
    bodyMesh.receiveShadow = true
    robotGroup.add(bodyMesh)

    // Robot Head Group
    const headGroup = new T.Group()
    headGroup.position.set(0, 0.62, 0)
    robotGroup.add(headGroup)

    const headMat = new T.MeshStandardMaterial({
      color: 0x0c0c10,
      roughness: 0.8,
      metalness: 0.2
    })
    const headGeo = new T.SphereGeometry(0.29, 48, 48, 0, Math.PI * 2, 0, Math.PI)
    const headMesh = new T.Mesh(headGeo, headMat)
    headMesh.castShadow = true
    headMesh.receiveShadow = true
    headGroup.add(headMesh)

    // Glass Visor Glow Shader
    const visorShaderMat = new T.ShaderMaterial({
      uniforms: {
        color: { value: new T.Color(0x00ffc6) },
        power: { value: 3.5 },
        intensity: { value: 0.8 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float power;
        uniform float intensity;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
          fresnel = pow(fresnel, power);
          gl_FragColor = vec4(color, fresnel * intensity);
        }
      `,
      transparent: true,
      blending: T.AdditiveBlending,
      depthWrite: false
    })
    const visorGeo = new T.SphereGeometry(0.31, 48, 48, 0, Math.PI * 2, 0, Math.PI)
    const visorMesh = new T.Mesh(visorGeo, visorShaderMat)
    headGroup.add(visorMesh)

    // Robot Eyes
    const eyeMat = new T.MeshBasicMaterial({ color: new T.Color(0x00ffc6), transparent: true })

    const createEyePath = () => {
      const w = 0.025, h = 0.035, r = 0.02, g = 0.005
      const path = new T.CurvePath()
      path.add(new T.LineCurve3(new T.Vector3(-w, g, 0), new T.Vector3(-w, h - r, 0)))
      path.add(new T.QuadraticBezierCurve3(new T.Vector3(-w, h - r, 0), new T.Vector3(-w, h, 0), new T.Vector3(-w + r, h, 0)))
      path.add(new T.LineCurve3(new T.Vector3(-w + r, h, 0), new T.Vector3(w - r, h, 0)))
      path.add(new T.QuadraticBezierCurve3(new T.Vector3(w - r, h, 0), new T.Vector3(w, h, 0), new T.Vector3(w, h - r, 0)))
      path.add(new T.LineCurve3(new T.Vector3(w, h - r, 0), new T.Vector3(w, g, 0)))
      path.add(new T.LineCurve3(new T.Vector3(-w, -g, 0), new T.Vector3(-w, -(h - r), 0)))
      path.add(new T.QuadraticBezierCurve3(new T.Vector3(-w, -(h - r), 0), new T.Vector3(-w, -h, 0), new T.Vector3(-w + r, -h, 0)))
      path.add(new T.LineCurve3(new T.Vector3(-w + r, -h, 0), new T.Vector3(w - r, -h, 0)))
      path.add(new T.QuadraticBezierCurve3(new T.Vector3(w - r, -h, 0), new T.Vector3(w, -h, 0), new T.Vector3(w, -(h - r), 0)))
      path.add(new T.LineCurve3(new T.Vector3(w, -(h - r), 0), new T.Vector3(w, -g, 0)))
      return path
    }

    const eyeGroup = new T.Group()
    eyeGroup.position.set(0, -0.02, 0.30)
    headGroup.add(eyeGroup)

    const eyeGeo = new T.TubeGeometry(createEyePath(), 32, 0.0035, 8, false)

    const leftEye = new T.Mesh(eyeGeo, eyeMat)
    leftEye.position.set(-0.07, 0, 0)
    leftEye.rotation.set(0, -0.2, 0)
    eyeGroup.add(leftEye)

    const rightEye = new T.Mesh(eyeGeo, eyeMat)
    rightEye.position.set(0.07, 0, 0)
    rightEye.rotation.set(0, 0.2, 0)
    eyeGroup.add(rightEye)

    // Robot Antennas & Ears
    const earBaseMat = new T.MeshStandardMaterial({ color: 0x222226, roughness: 0.5 })
    const earTipMat = new T.MeshStandardMaterial({ color: 0x00ffc6, roughness: 0.2 })

    const addEar = (isLeft: boolean) => {
      const dir = isLeft ? -1 : 1
      const earGroup = new T.Group()
      earGroup.position.set(dir * 0.30, 0, 0)

      const earMesh = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.025, 32), earBaseMat)
      earMesh.rotation.z = Math.PI / 2
      earGroup.add(earMesh)

      const antStick = new T.Mesh(new T.CylinderGeometry(0.003, 0.003, 0.1, 8), earBaseMat)
      antStick.position.set(dir * 0.015, 0.06, 0)
      antStick.rotation.x = -0.4
      earGroup.add(antStick)

      const antTip = new T.Mesh(new T.SphereGeometry(0.007, 16, 16), earTipMat)
      antTip.position.set(dir * 0.015, 0.11, 0)
      earGroup.add(antTip)

      headGroup.add(earGroup)
    }

    addEar(true)
    addEar(false)

    // Floor Shadow Plane
    const shadowGeo = new T.PlaneGeometry(3, 3)
    const shadowMat = new T.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    })
    const shadowMesh = new T.Mesh(shadowGeo, shadowMat)
    shadowMesh.rotation.x = -Math.PI / 2
    shadowMesh.position.y = -0.78
    robotGroup.add(shadowMesh)

    // Mouse Tracking + Breathing Loop
    let mouseX = 0, mouseY = 0
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    const handleResize = () => {
      if (!container) return
      camera.aspect = (container.clientWidth || 1) / (container.clientHeight || 1)
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    const clock = new T.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Breathing float motion
      const floatY = Math.sin(elapsedTime * 0.9) * 0.07
      const floatX = Math.cos(elapsedTime * 0.6) * 0.04
      robotGroup.position.y = -0.3 + floatY
      robotGroup.position.x = floatX

      // Eye blink cycle
      const blinkCycle = elapsedTime % 3.5
      let targetEyeScaleY = 1
      if (blinkCycle < 0.15) {
        const progress = blinkCycle / 0.15
        targetEyeScaleY = Math.max(0.05, 1.0 - Math.sin(progress * Math.PI))
      }
      eyeGroup.scale.set(1.1, 1.1 * targetEyeScaleY, 1.1)

      // Pointer look-at lerp
      if (T.MathUtils) {
        robotGroup.rotation.y = T.MathUtils.lerp(robotGroup.rotation.y, mouseX * 0.25, 0.05)
        robotGroup.rotation.x = T.MathUtils.lerp(robotGroup.rotation.x, -mouseY * 0.15, 0.05)
        headGroup.rotation.y = T.MathUtils.lerp(headGroup.rotation.y, mouseX * 0.5, 0.08)
        headGroup.rotation.x = T.MathUtils.lerp(headGroup.rotation.x, -mouseY * 0.3, 0.08)
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30 transition-opacity duration-1000"
    />
  )
}

export default RobotBackdrop
