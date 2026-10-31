import type { ReactNode } from 'react'

/** 终端输出的基础原子组件，供命令输出复用，保证风格统一。 */

export function Text({ children, dim }: { children?: ReactNode; dim?: boolean }) {
  return <p className={dim ? 't-dim' : 't-fg'}>{children}</p>
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <div className="t-accent-bright font-bold mb-2 mt-1 flex items-center gap-2">
      <span className="t-dim select-none">##</span>
      {children}
    </div>
  )
}

export function Cmd({ children }: { children: ReactNode }) {
  return <code className="t-cmd">{children}</code>
}

export function Key({ children }: { children: ReactNode }) {
  return <kbd className="t-key">{children}</kbd>
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="t-tag">{children}</span>
}

export function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="t-link">
      {children}
    </a>
  )
}

export function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 flex-wrap">
      <span className="t-row-k">{k}</span>
      <span className="t-fg min-w-0">{children}</span>
    </div>
  )
}
