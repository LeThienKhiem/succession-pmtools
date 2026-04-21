'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import {
  LAYER_TASKS, SCREENS, LAYERS, getScreenSummaries,
  type LayerTask, type LayerStatus,
} from '@/lib/layermap'
import { RotateCcw, GitBranch, AlertTriangle, Eye, EyeOff, RefreshCw, ChevronRight, X } from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────

const SX = 7.0    // screen spacing X
const LY = 4.5    // layer spacing Y
const DOT_R = 0.22
const SPREAD_R = 0.58

const STATUS_COLOR: Record<LayerStatus, number> = {
  done:    0x22c97a,
  wip:     0xf0a232,
  todo:    0x4a5068,
  blocked: 0xe84545,
  missing: 0xcc44aa,
}

const STATUS_LABEL: Record<LayerStatus, string> = {
  done: 'Xong', wip: 'Đang làm', todo: 'Todo', blocked: 'Blocked', missing: 'Thiếu',
}

// ─── Tooltip state ────────────────────────────────────────────────────────────

interface TooltipState {
  x: number; y: number
  task: LayerTask
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LayerMap3D() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef      = useRef<THREE.Scene | null>(null)
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null)
  const frameRef      = useRef<number>(0)
  const ringsRef      = useRef<THREE.Mesh[]>([])
  const dotsRef       = useRef<{ mesh: THREE.Mesh; task: LayerTask }[]>([])
  const originalColors = useRef<Map<string, number>>(new Map())

  // orbit state
  const isDragging   = useRef(false)
  const prevMouse    = useRef({ x: 0, y: 0 })
  const orbitRef     = useRef({ theta: 0.28, phi: 0.62, radius: 42 })
  const autoRotate   = useRef(false)

  // UI state
  const [tooltip,    setTooltip]   = useState<TooltipState | null>(null)
  const [showDeps,   setShowDeps]  = useState(true)
  const [showMissing,setShowMissing] = useState(true)
  const [autoRot,    setAutoRot]   = useState(false)
  const [selected,   setSelected]  = useState<string | null>(null)
  const [panelOpen,  setPanelOpen] = useState(false)
  const summaries = getScreenSummaries()

  // center of scene
  const CX = ((SCREENS.length - 1) * SX) / 2
  const CY = ((LAYERS.length - 1) * LY) / 2

  // Build positions: group tasks by (screen, layer) cell
  function buildCellMap() {
    const map = new Map<string, LayerTask[]>()
    for (const t of LAYER_TASKS) {
      const key = `${t.screenIndex},${t.layerIndex}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return map
  }

  function taskPosition(t: LayerTask, idx: number, total: number): THREE.Vector3 {
    const bx = t.screenIndex * SX
    const by = t.layerIndex  * LY
    if (total === 1) return new THREE.Vector3(bx, by, 0)
    const angle = (idx / total) * Math.PI * 2
    const r = total <= 3 ? 0.4 : total <= 6 ? SPREAD_R : SPREAD_R * 1.1
    return new THREE.Vector3(bx + Math.cos(angle) * r, by, Math.sin(angle) * r)
  }

  function cameraTarget() {
    return new THREE.Vector3(CX, CY, 0)
  }

  function orbitPosition(theta: number, phi: number, radius: number) {
    const x = CX + radius * Math.sin(phi) * Math.cos(theta)
    const y = CY + radius * Math.cos(phi)
    const z =      radius * Math.sin(phi) * Math.sin(theta)
    return new THREE.Vector3(x, y, z)
  }

  // ── Init scene ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x080a0f, 1)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x080a0f, 55, 90)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 200)
    const { theta, phi, radius } = orbitRef.current
    camera.position.copy(orbitPosition(theta, phi, radius))
    camera.lookAt(cameraTarget())
    cameraRef.current = camera

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.9))
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(10, 20, 10)
    scene.add(dir)

    // ── Layer planes ──────────────────────────────────────────────────────────
    const planeW = (SCREENS.length - 1) * SX + 4.5
    const planeH = (SCREENS.length - 1) * SX * 0.18 + 3 // depth feel
    LAYERS.forEach((layer, li) => {
      const y = li * LY
      const color = new THREE.Color(layer.color)

      // Plane fill
      const geo = new THREE.PlaneGeometry(planeW, planeH)
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.045, side: THREE.DoubleSide, depthWrite: false })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.set(CX, y, 0)
      scene.add(mesh)

      // Outline edges
      const edges = new THREE.EdgesGeometry(geo)
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.18 })
      const lineLoop = new THREE.LineSegments(edges, lineMat)
      lineLoop.rotation.x = -Math.PI / 2
      lineLoop.position.set(CX, y, 0.01)
      scene.add(lineLoop)

      // Layer label sprite
      const canvas2d = document.createElement('canvas')
      canvas2d.width = 512; canvas2d.height = 64
      const ctx = canvas2d.getContext('2d')!
      ctx.fillStyle = layer.color
      ctx.font = 'bold 36px Inter, sans-serif'
      ctx.fillText(layer.label, 8, 46)
      const tex = new THREE.CanvasTexture(canvas2d)
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.65 })
      const sprite = new THREE.Sprite(spriteMat)
      sprite.scale.set(6, 0.75, 1)
      sprite.position.set(-3.8, y + 0.12, 0)
      scene.add(sprite)
    })

    // ── Screen column guides + labels ─────────────────────────────────────────
    SCREENS.forEach((screen, si) => {
      const x = si * SX
      // Vertical guide line
      const pts = [new THREE.Vector3(x, -0.5, 0), new THREE.Vector3(x, (LAYERS.length - 1) * LY + 0.5, 0)]
      const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(screen.color), transparent: true, opacity: 0.06 })
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
      scene.add(new THREE.Line(lineGeo, lineMat))

      // Screen label sprite
      const lines = screen.label.split('\n')
      const c2 = document.createElement('canvas')
      c2.width = 340; c2.height = 80
      const cx2 = c2.getContext('2d')!
      cx2.fillStyle = screen.color
      cx2.font = 'bold 28px Inter, sans-serif'
      cx2.textAlign = 'center'
      lines.forEach((line, li) => cx2.fillText(line, 170, 28 + li * 34))
      const tex2 = new THREE.CanvasTexture(c2)
      const spr2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex2, transparent: true, opacity: 0.8 }))
      spr2.scale.set(4.5, 1.05, 1)
      spr2.position.set(x, (LAYERS.length - 1) * LY + 2.3, 0)
      scene.add(spr2)
    })

    // ── Task dots ─────────────────────────────────────────────────────────────
    const cellMap = buildCellMap()
    const dots: { mesh: THREE.Mesh; task: LayerTask }[] = []
    const rings: THREE.Mesh[] = []

    for (const [, tasks] of cellMap) {
      tasks.forEach((task, idx) => {
        const pos = taskPosition(task, idx, tasks.length)
        const color = STATUS_COLOR[task.status]

        // Dot sphere
        const geo = new THREE.SphereGeometry(DOT_R, 16, 12)
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 })
        const dot = new THREE.Mesh(geo, mat)
        dot.position.copy(pos)
        dot.userData = { taskId: task.id }
        scene.add(dot)
        dots.push({ mesh: dot, task })
        originalColors.current.set(task.id, color)

        // Ring (billboard)
        const layerColor = new THREE.Color(LAYERS[task.layerIndex].color)
        const ringGeo = new THREE.RingGeometry(0.30, 0.42, 24)
        const ringMat = new THREE.MeshBasicMaterial({ color: layerColor, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.position.copy(pos)
        scene.add(ring)
        rings.push(ring)

        // Missing spike
        if (task.status === 'missing') {
          const spikePts = [pos.clone(), pos.clone().add(new THREE.Vector3(0, 1.8, 0))]
          const spikeGeo = new THREE.BufferGeometry().setFromPoints(spikePts)
          const spikeMat = new THREE.LineBasicMaterial({ color: 0xcc44aa, transparent: true, opacity: 0.7 })
          scene.add(new THREE.Line(spikeGeo, spikeMat))
        }
      })
    }

    dotsRef.current = dots
    ringsRef.current = rings

    // ── Dependency arcs (blocked ones) ────────────────────────────────────────
    // Show sprint flow arcs: S1→S2→S3 connections (visual only)
    const sprintColors = [0x4F46E5, 0x10B981, 0x10B981, 0xF59E0B, 0xEC4899]
    const sprintArcs = [
      { from: 0, to: 2, colorIdx: 0 }, // E01→E03
      { from: 1, to: 2, colorIdx: 1 }, // E02→E03
      { from: 2, to: 3, colorIdx: 2 }, // E03→E04
      { from: 2, to: 4, colorIdx: 2 }, // E03→E05
      { from: 4, to: 6, colorIdx: 3 }, // E05→E08
    ]
    const depsGroup = new THREE.Group()
    depsGroup.name = 'deps'
    for (const arc of sprintArcs) {
      const fromX = arc.from * SX
      const toX   = arc.to   * SX
      const midY  = CY + 2.5
      const pts: THREE.Vector3[] = []
      for (let t = 0; t <= 1; t += 1 / 24) {
        const x = (1 - t) * (1 - t) * fromX + 2 * t * (1 - t) * (fromX + toX) / 2 + t * t * toX
        const y = (1 - t) * (1 - t) * CY + 2 * t * (1 - t) * midY + t * t * CY
        pts.push(new THREE.Vector3(x, y, 0))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      const mat = new THREE.LineBasicMaterial({ color: sprintColors[arc.colorIdx], transparent: true, opacity: 0.22 })
      depsGroup.add(new THREE.Line(geo, mat))
    }
    scene.add(depsGroup)

    // ── Animation loop ────────────────────────────────────────────────────────
    function animate() {
      frameRef.current = requestAnimationFrame(animate)

      // Auto-rotate
      if (autoRotate.current) {
        orbitRef.current.theta += 0.003
        const { theta, phi, radius } = orbitRef.current
        cameraRef.current!.position.copy(orbitPosition(theta, phi, radius))
        cameraRef.current!.lookAt(cameraTarget())
      }

      // Billboard rings
      const cam = cameraRef.current!
      for (const ring of ringsRef.current) {
        ring.quaternion.copy(cam.quaternion)
      }

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ────────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      if (!container) return
      const w = container.clientWidth, h = container.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(frameRef.current)
      ro.disconnect()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Sync showDeps / showMissing toggles ────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const depsGroup = scene.getObjectByName('deps')
    if (depsGroup) depsGroup.visible = showDeps
  }, [showDeps])

  // ── Sync autoRotate ────────────────────────────────────────────────────────
  useEffect(() => { autoRotate.current = autoRot }, [autoRot])

  // ── Mouse events ──────────────────────────────────────────────────────────
  const raycaster = useRef(new THREE.Raycaster())
  const mouse     = useRef(new THREE.Vector2())

  const getIntersect = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current
    const camera    = cameraRef.current
    if (!container || !camera) return null
    const rect = container.getBoundingClientRect()
    mouse.current.x = ((e.clientX - rect.left) / container.clientWidth)  * 2 - 1
    mouse.current.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
    raycaster.current.setFromCamera(mouse.current, camera)
    const meshes = dotsRef.current.map(d => d.mesh)
    const hits   = raycaster.current.intersectObjects(meshes)
    if (!hits.length) return null
    const hit  = hits[0]
    const entry = dotsRef.current.find(d => d.mesh === hit.object)
    return entry ? { entry, clientX: e.clientX, clientY: e.clientY } : null
  }, [])

  function resetColors() {
    for (const { mesh, task } of dotsRef.current) {
      const orig = originalColors.current.get(task.id)
      if (orig !== undefined) {
        ;(mesh.material as THREE.MeshStandardMaterial).color.setHex(orig)
        ;(mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000)
      }
    }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const hit = getIntersect(e)
    if (hit) {
      setTooltip({ x: hit.clientX + 14, y: hit.clientY - 14, task: hit.entry.task })
    } else {
      setTooltip(null)
    }
  }, [getIntersect])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const hit = getIntersect(e)
    if (!hit) {
      resetColors()
      setSelected(null)
      return
    }
    const tid = hit.entry.task.id
    if (selected === tid) {
      resetColors()
      setSelected(null)
      return
    }
    setSelected(tid)
    resetColors()
    for (const { mesh, task } of dotsRef.current) {
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (task.id === tid) {
        mat.color.setHex(0x7b8cf0)
        mat.emissive.setHex(0x3b3ca0)
      } else {
        mat.color.setHex(0x1a1b2e)
        mat.emissive.setHex(0x000000)
      }
    }
  }, [getIntersect, selected])

  // ── Orbit drag ────────────────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent) {
    isDragging.current = true
    prevMouse.current  = { x: e.clientX, y: e.clientY }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current) return
    const dx = e.clientX - prevMouse.current.x
    const dy = e.clientY - prevMouse.current.y
    prevMouse.current = { x: e.clientX, y: e.clientY }
    orbitRef.current.theta -= dx * 0.007
    orbitRef.current.phi    = Math.max(0.2, Math.min(Math.PI * 0.82, orbitRef.current.phi + dy * 0.007))
    const { theta, phi, radius } = orbitRef.current
    cameraRef.current?.position.copy(
      (() => {
        const cx = CX + radius * Math.sin(phi) * Math.cos(theta)
        const cy = CY + radius * Math.cos(phi)
        const cz =      radius * Math.sin(phi) * Math.sin(theta)
        return new THREE.Vector3(cx, cy, cz)
      })()
    )
    cameraRef.current?.lookAt(new THREE.Vector3(CX, CY, 0))
  }

  function onPointerUp() { isDragging.current = false }

  function onWheel(e: React.WheelEvent) {
    orbitRef.current.radius = Math.max(12, Math.min(80, orbitRef.current.radius + e.deltaY * 0.04))
    const { theta, phi, radius } = orbitRef.current
    const cx = CX + radius * Math.sin(phi) * Math.cos(theta)
    const cy = CY + radius * Math.cos(phi)
    const cz =      radius * Math.sin(phi) * Math.sin(theta)
    cameraRef.current?.position.set(cx, cy, cz)
    cameraRef.current?.lookAt(new THREE.Vector3(CX, CY, 0))
  }

  function resetCamera() {
    orbitRef.current = { theta: 0.28, phi: 0.62, radius: 42 }
    const { theta, phi, radius } = orbitRef.current
    const cx = CX + radius * Math.sin(phi) * Math.cos(theta)
    const cy = CY + radius * Math.cos(phi)
    const cz =      radius * Math.sin(phi) * Math.sin(theta)
    cameraRef.current?.position.set(cx, cy, cz)
    cameraRef.current?.lookAt(new THREE.Vector3(CX, CY, 0))
  }

  // ─── Status summary counts ────────────────────────────────────────────────
  const counts = {
    done:    LAYER_TASKS.filter(t => t.status === 'done').length,
    wip:     LAYER_TASKS.filter(t => t.status === 'wip').length,
    blocked: LAYER_TASKS.filter(t => t.status === 'blocked').length,
    missing: LAYER_TASKS.filter(t => t.status === 'missing').length,
    todo:    LAYER_TASKS.filter(t => t.status === 'todo').length,
  }
  const total = LAYER_TASKS.length
  const pct   = total ? Math.round(counts.done * 100 / total) : 0

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-[#080a0f] overflow-hidden select-none">

      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        onClick={handleClick}
        onWheel={onWheel}
      />

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-center gap-3 pointer-events-none z-20">
        <div className="pointer-events-auto flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 rounded-2xl px-4 py-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest">LayerMap</span>
          <span className="text-[11px] text-white/40 ml-1">{total} tasks · {pct}% done</span>
        </div>

        {/* Legend pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 ml-auto">
          {([
            { status: 'done',    label: 'Xong',     hex: '#22c97a' },
            { status: 'wip',     label: 'Đang làm', hex: '#f0a232' },
            { status: 'todo',    label: 'Todo',      hex: '#4a5068' },
            { status: 'blocked', label: 'Blocked',   hex: '#e84545' },
            { status: 'missing', label: 'Thiếu',     hex: '#cc44aa' },
          ] as const).map(({ status, label, hex }) => (
            <div key={status} className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
              <span className="text-[10px] font-medium text-white/60">{label}</span>
              <span className="text-[10px] font-bold text-white/80">{counts[status as keyof typeof counts]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        <button
          onClick={() => setShowDeps(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${showDeps ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/5 border-white/10 text-white/40'}`}
        >
          <GitBranch size={13} />Dependencies
        </button>
        <button
          onClick={() => setShowMissing(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${showMissing ? 'bg-pink-500/20 border-pink-500/40 text-pink-300' : 'bg-white/5 border-white/10 text-white/40'}`}
        >
          {showMissing ? <Eye size={13} /> : <EyeOff size={13} />}Missing
        </button>
        <button
          onClick={() => setAutoRot(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${autoRot ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/5 border-white/10 text-white/40'}`}
        >
          <RefreshCw size={13} className={autoRot ? 'animate-spin' : ''} />Auto
        </button>
        <button
          onClick={resetCamera}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white/50 hover:text-white/80 transition-all"
        >
          <RotateCcw size={13} />Reset
        </button>
        <button
          onClick={() => setPanelOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600/50 transition-all"
        >
          <AlertTriangle size={13} />PM Readiness
          <ChevronRight size={12} className={`transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── Tooltip ──────────────────────────────────────────────────────────── */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 max-w-[280px] bg-[#0e1117]/95 border border-white/10 rounded-2xl shadow-xl px-4 py-3"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="flex items-start gap-2 mb-2">
            <span
              className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: `#${STATUS_COLOR[tooltip.task.status].toString(16).padStart(6, '0')}` }}
            />
            <p className="text-xs font-semibold text-white leading-snug">{tooltip.task.label}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: `${SCREENS[tooltip.task.screenIndex]?.color}25`, color: SCREENS[tooltip.task.screenIndex]?.color }}>
              {SCREENS[tooltip.task.screenIndex]?.code}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/8 text-white/60 text-[10px] font-medium">
              {LAYERS[tooltip.task.layerIndex]?.label}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/8 text-white/60 text-[10px]">
              {tooltip.task.sprint}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/50">{tooltip.task.assignee}</span>
            <span className="font-semibold" style={{ color: `#${STATUS_COLOR[tooltip.task.status].toString(16).padStart(6, '0')}` }}>
              {STATUS_LABEL[tooltip.task.status]}
            </span>
          </div>
          {tooltip.task.note && (
            <p className="mt-2 text-[10px] text-white/35 leading-relaxed border-t border-white/8 pt-2">{tooltip.task.note}</p>
          )}
        </div>
      )}

      {/* ── PM Readiness Panel ───────────────────────────────────────────────── */}
      <div className={`absolute top-0 right-0 bottom-0 w-[340px] bg-[#0b0d13]/95 backdrop-blur border-l border-white/8 z-30 flex flex-col transition-transform duration-300 ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8 flex-shrink-0">
          <div>
            <p className="text-sm font-bold text-white">PM Readiness</p>
            <p className="text-[11px] text-white/40 mt-0.5">Tổng quan {total} tasks · {pct}% hoàn thành</p>
          </div>
          <button onClick={() => setPanelOpen(false)} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={14} className="text-white/50" />
          </button>
        </div>

        {/* Overall progress bar */}
        <div className="px-5 py-3 border-b border-white/6 flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-white/50">Tiến độ tổng thể</span>
            <span className="text-xs font-bold text-white">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
              style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center gap-3 mt-2 text-[10px]">
            <span className="text-emerald-400">{counts.done} xong</span>
            <span className="text-amber-400">{counts.wip} đang làm</span>
            <span className="text-rose-400">{counts.blocked} blocked</span>
            <span className="text-pink-400">{counts.missing} thiếu</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {summaries.map(sc => (
            <div key={sc.screenIndex} className={`rounded-xl border p-3 ${
              sc.verdict === 'danger' ? 'border-rose-500/30 bg-rose-500/8' :
              sc.verdict === 'warn'   ? 'border-amber-500/25 bg-amber-500/6' :
              'border-white/8 bg-white/3'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sc.color }} />
                  <span className="text-xs font-semibold text-white">{sc.label}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  {sc.blocked > 0 && (
                    <span className="flex items-center gap-1 text-rose-400 font-semibold">
                      <AlertTriangle size={10} />{sc.blocked} blocked
                    </span>
                  )}
                  {sc.missing > 0 && (
                    <span className="text-pink-400 font-medium">{sc.missing} thiếu</span>
                  )}
                  <span className="font-bold text-white/70">{sc.pct}%</span>
                </div>
              </div>
              {/* Mini progress */}
              <div className="h-1 bg-white/8 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${sc.pct}%`, backgroundColor: sc.color }} />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                <span>{sc.done}/{sc.total} tasks</span>
                {sc.wip > 0 && <span className="text-amber-400/80">{sc.wip} WIP</span>}
                <span className={`ml-auto font-semibold ${
                  sc.verdict === 'danger' ? 'text-rose-400' :
                  sc.verdict === 'warn'   ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {sc.verdict === 'danger' ? '🔴 Bị block' : sc.verdict === 'warn' ? '🟡 Cần check' : '🟢 Ổn'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sprint readiness verdict */}
        <div className="px-5 py-4 border-t border-white/8 flex-shrink-0">
          {summaries.some(s => s.verdict === 'danger') ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30">
              <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-300">Có task bị block</p>
                <p className="text-[10px] text-rose-400/80 mt-0.5">Cần giải quyết blocker trước khi sprint</p>
              </div>
            </div>
          ) : summaries.some(s => s.verdict === 'warn') ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/12 border border-amber-500/25">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-300">Một số module chưa đầy đủ</p>
                <p className="text-[10px] text-amber-400/80 mt-0.5">Kiểm tra task thiếu trước khi assign</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/12 border border-emerald-500/25">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] text-white font-bold">✓</span>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300">Sprint sẵn sàng</p>
                <p className="text-[10px] text-emerald-400/80 mt-0.5">Tất cả module đang tiến triển tốt</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
