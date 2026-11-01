import { useEffect } from 'react'
import type { RefObject } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * 终端内的指针聚光：
 * - 鼠标移动时用一次 rAF 写入 CSS 变量（transform 组合，不触发布局）；
 * - 触屏只在按下时闪一下，不干扰原生滚动；
 * - 键盘输入时把光晕停到提示行附近；
 * - prefers-reduced-motion 下完全不挂监听，由 CSS 提供静态弱光。
 */
export function useSpotlight(ref: RefObject<HTMLElement>) {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    let rect = el.getBoundingClientRect()
    let frame = 0
    let pingTimer = 0
    let typingTimer = 0
    let lastX = 0
    let lastY = 0

    const setPos = (x: number, y: number) => {
      el.style.setProperty('--spot-x', `${Math.round(x)}px`)
      el.style.setProperty('--spot-y', `${Math.round(y)}px`)
    }
    const setOpacity = (value: string) => el.style.setProperty('--spot-o', value)

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      rect = el.getBoundingClientRect()
      setPos(e.clientX - rect.left, e.clientY - rect.top)
      setOpacity('0.9')
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      lastX = e.clientX - rect.left
      lastY = e.clientY - rect.top
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setPos(lastX, lastY)
      })
    }

    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
      setOpacity('0')
    }

    // 触屏：单次点按的光晕，不做连续跟踪。
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      const r = el.getBoundingClientRect()
      rect = r
      setPos(e.clientX - r.left, e.clientY - r.top)
      setOpacity('0.6')
      window.clearTimeout(pingTimer)
      pingTimer = window.setTimeout(() => setOpacity('0'), 700)
    }

    // 键盘：停在提示行附近。
    const onKey = () => {
      const r = el.getBoundingClientRect()
      setPos(r.width / 2, r.height - 72)
      setOpacity('0.45')
      window.clearTimeout(typingTimer)
      typingTimer = window.setTimeout(() => setOpacity('0'), 650)
    }

    const onResize = () => {
      rect = el.getBoundingClientRect()
    }

    el.addEventListener('pointerenter', onEnter, { passive: true })
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave, { passive: true })
    el.addEventListener('pointerdown', onDown, { passive: true })
    el.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.clearTimeout(pingTimer)
      window.clearTimeout(typingTimer)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [ref, reduced])
}
