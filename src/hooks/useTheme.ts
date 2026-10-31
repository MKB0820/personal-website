import { useCallback, useEffect, useState } from 'react'
import type { ThemeName } from '../types'
import { load, save } from '../lib/storage'

const THEMES: ThemeName[] = ['green', 'cyan', 'amber']

function isTheme(v: string): v is ThemeName {
  return v === 'green' || v === 'cyan' || v === 'amber'
}

/**
 * 主题状态：持久化到 localStorage，并同步到 <html data-theme="...">。
 * 返回 [当前主题, 设置主题, 循环切换主题]。
 */
export function useTheme(): [ThemeName, (t: ThemeName) => void, () => void] {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = load('mkb-theme')
    return saved && isTheme(saved) ? saved : 'green'
  })

  useEffect(() => {
    save('mkb-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = useCallback((t: ThemeName) => setThemeState(t), [])
  const cycle = useCallback(
    () => setThemeState((cur) => THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length]),
    [],
  )

  return [theme, setTheme, cycle]
}
