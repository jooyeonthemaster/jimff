'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Link from 'next/link'

interface ThreeButtonProps {
  href: string
  text: string
  className?: string
}

export default function ThreeButton({ href, text, className = '' }: ThreeButtonProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const buttonMeshRef = useRef<THREE.Mesh | null>(null)
  const animationRef = useRef<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 3

    // Renderer setup - 크기 대폭 증가
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(320, 80) // 200x60 → 320x80
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    mountRef.current.appendChild(renderer.domElement)

    // Create button geometry (rounded box) - 크기 증가
    const geometry = new THREE.BoxGeometry(4, 1, 0.4) // 3, 0.8, 0.3 → 4, 1, 0.4
    geometry.computeBoundingBox()

    // Create gradient material
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createLinearGradient(0, 0, 256, 0)
    gradient.addColorStop(0, '#8B5CF6') // purple-500
    gradient.addColorStop(0.5, '#7C3AED') // purple-600
    gradient.addColorStop(1, '#2563EB') // blue-600
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 128)
    
    const texture = new THREE.CanvasTexture(canvas)
    
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 100,
      specular: new THREE.Color(0x222222)
    })

    // Create button mesh
    const buttonMesh = new THREE.Mesh(geometry, material)
    buttonMesh.castShadow = true
    buttonMeshRef.current = buttonMesh
    scene.add(buttonMesh)

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0xffffff, 0.4, 100)
    pointLight.position.set(-5, 5, 5)
    scene.add(pointLight)

    // Animation loop
    function animate() {
      animationRef.current = requestAnimationFrame(animate)
      
      if (buttonMeshRef.current) {
        // Continuous gentle rotation
        buttonMeshRef.current.rotation.x += 0.003
        buttonMeshRef.current.rotation.y += 0.005
        
        // Hover animations
        if (isHovered) {
          buttonMeshRef.current.scale.x = THREE.MathUtils.lerp(buttonMeshRef.current.scale.x, 1.1, 0.1)
          buttonMeshRef.current.scale.y = THREE.MathUtils.lerp(buttonMeshRef.current.scale.y, 1.1, 0.1)
          buttonMeshRef.current.scale.z = THREE.MathUtils.lerp(buttonMeshRef.current.scale.z, 1.2, 0.1)
        } else {
          buttonMeshRef.current.scale.x = THREE.MathUtils.lerp(buttonMeshRef.current.scale.x, 1, 0.1)
          buttonMeshRef.current.scale.y = THREE.MathUtils.lerp(buttonMeshRef.current.scale.y, 1, 0.1)
          buttonMeshRef.current.scale.z = THREE.MathUtils.lerp(buttonMeshRef.current.scale.z, 1, 0.1)
        }
      }
      
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [isHovered])

  return (
    <Link href={href}>
      <div 
        className={`relative cursor-pointer ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div ref={mountRef} className="relative z-10" />
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="text-white font-bold text-xl drop-shadow-lg tracking-wide">
            {text}
          </span>
        </div>
      </div>
    </Link>
  )
} 