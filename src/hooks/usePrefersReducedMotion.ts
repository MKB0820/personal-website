import { useEffect, useState } from 'react'

/** 订阅 prefers-reduced-motion，返回当前是否要求减少动态效果。 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
