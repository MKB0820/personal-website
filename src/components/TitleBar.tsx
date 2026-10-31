import type { ThemeName } from '../types'

interface Props {
  theme: ThemeName
  crt: boolean
  onCycleTheme: () => void
  onToggleCrt: () => void
}

export function TitleBar({ theme, crt, onCycleTheme, onToggleCrt }: Props) {
  return (
    <div className="titlebar">
      <div className="dots" aria-hidden="true">
        <span className="dot dot-red" />
        <span className="dot dot-yellow" />
        <span className="dot dot-green" />
      </div>
      <div className="title t-dim">MKB@BJHS:~</div>
      <div className="controls">
        <button
          type="button"
          className="t-btn t-btn-sm"
          onClick={onCycleTheme}
          aria-label={`当前主题 ${theme}，点击切换`}
        >
          ◐ {theme}
        </button>
        <button
          type="button"
          className="t-btn t-btn-sm"
          onClick={onToggleCrt}
          aria-pressed={crt}
          aria-label="切换 CRT 扫描线效果"
        >
          CRT{crt ? ' on' : ' off'}
        </button>
      </div>
    </div>
  )
}
