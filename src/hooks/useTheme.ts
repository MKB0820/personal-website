import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { ThemeName } from '../types'
import { load, save } from '../lib/storage'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const THEMES: ThemeName[] = ['green', 'cyan', 'amber']

function isTheme(v: string): v is ThemeName {
  return v === 'green' || v === 'cyan' || v === 'amber'
}

function initialTheme(): ThemeName {
  const saved = load('mkb-theme')
  return saved && isTheme(saved) ? saved : 'green'
}

interface ViewTransitionLike {
  ready: Promise<void>
  finished: Promise<void>
}

type DocumentWithVT = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionLike
}

/** 同时只允许一个主题切换动画。 */
let vtBusy = false

/**
 * 主题状态：持久化到 localStorage，并同步到 <html data-theme="...">。
 * 支持 View Transitions API 时，以主题按钮为原点做径向擦除；
 * 不支持或用户要求减少动态效果时直接切换。
 * 返回 [当前主题, 设置主题, 循环切换主题]。
 */
export function useTheme(): [ThemeName, (t: ThemeName) => void, () => void] {
  const reduced = usePrefersReducedMotion()
  const [theme, setThemeState] = useState<ThemeName>(initialTheme)
  const themeRef = useRef(theme)
  themeRef.current = theme

  useEffect(() => {
    save('mkb-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const applyTheme = useCallback(
    (next: ThemeName) => {
      if (next === themeRef.current) return

      const apply = () => {
        flushSync(() => setThemeState(next))
        document.documentElement.setAttribute('data-theme', next)
      }

      const doc = document as DocumentWithVT

      // 减少动态效果、浏览器不支持、动画进行中、或 CRT 开机遮罩还在时，直接切换。
      if (reduced || !doc.startViewTransition || vtBusy || document.querySelector('.crt-power')) {
        apply()
        return
      }

      const toggle = document.querySelector('[data-theme-toggle]') as HTMLElement | null
      const rect = toggle?.getBoundingClientRect()
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
      const y = rect ? rect.top + rect.height / 2 : 72
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )

      const root = document.documentElement
      root.style.setProperty('--vt-x', `${x}px`)
      root.style.setProperty('--vt-y', `${y}px`)
      root.style.setProperty('--vt-r', `${radius}px`)

      vtBusy = true
      try {
        const transition = doc.startViewTransition(apply)
        transition.finished
          .catch(() => {
            /* 动画被中断也算结束 */
          })
          .finally(() => {
            vtBusy = false
          })
      } catch {
        vtBusy = false
        apply()
      }
    },
    [reduced],
  )

  const cycle = useCallback(() => {
    const current = themeRef.current
    applyTheme(THEMES[(THEMES.indexOf(current) + 1) % THEMES.length])
  }, [applyTheme])

  return [theme, applyTheme, cycle]
}
