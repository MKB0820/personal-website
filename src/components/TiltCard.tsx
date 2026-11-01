import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

interface TiltCardProps {
  children: ReactNode
  /** 附加到倾斜元素上的类（如卡片外观类）。 */
  className?: string
  /** 最大倾斜角度（度）。 */
  maxTilt?: number
}

const DEFAULT_MAX_TILT = 10

/**
 * 3D 倾斜卡片：鼠标悬停时根据指针位置轻微倾斜，并带一个跟随指针的高光。
 * - 触屏（pointerType === 'touch'）下禁用；
 * - prefers-reduced-motion 下禁用；
 * - 倾斜量由 CSS 变量 --rx / --ry 驱动，离开时平滑复位。
 */
export function TiltCard({ children, className, maxTilt = DEFAULT_MAX_TILT }: TiltCardProps) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (reduced || e.pointerType === 'touch') return
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      el.style.setProperty('--rx', `${((0.5 - py) * maxTilt * 2).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${((px - 0.5) * maxTilt * 2).toFixed(2)}deg`)
      el.style.setProperty('--gx', `${(px * 100).toFixed(2)}%`)
      el.style.setProperty('--gy', `${(py * 100).toFixed(2)}%`)
    },
    [reduced, maxTilt],
  )

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }, [])

  return (
    <div className="tilt">
      <div
        ref={ref}
        className={`tilt-inner ${className ?? ''}`}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {children}
        <div className="tilt-glare" aria-hidden="true" />
      </div>
    </div>
  )
}
