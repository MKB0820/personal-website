import type { ReactNode } from 'react'

/** 终端提示符：MKB@BJHS:~$ */
export function Prompt({ children }: { children?: ReactNode }) {
  return (
    <span className="shrink-0 select-none">
      <span className="t-accent-bright">MKB</span>
      <span className="t-dim">@</span>
      <span className="t-fg">BJHS</span>
      <span className="t-dim">:~$</span>
      {children !== undefined ? <span className="t-fg"> {children}</span> : null}
    </span>
  )
}
