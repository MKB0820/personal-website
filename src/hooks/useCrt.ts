import { useCallback, useEffect, useState } from 'react'
import { load, save } from '../lib/storage'

/** CRT 扫描线效果开关：默认开启，持久化到 localStorage。 */
export function useCrt(): [boolean, () => void] {
  const [crt, setCrt] = useState<boolean>(() => load('mkb-crt') !== 'off')

  useEffect(() => {
    save('mkb-crt', crt ? 'on' : 'off')
  }, [crt])

  const toggle = useCallback(() => setCrt((v) => !v), [])

  return [crt, toggle]
}
