import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { CommandCandidate } from '../lib/fuzzy'

interface Props {
  listId: string
  candidates: CommandCandidate[]
  activeIndex: number
  style: CSSProperties
  onSelect: (candidate: CommandCandidate) => void
}

/**
 * 命令建议列表。作为 .t-scroll 的兄弟节点渲染，避免被滚动容器裁切。
 * 输入框保持焦点，通过 aria-activedescendant 指向当前项。
 */
export function CommandSuggestions({ listId, candidates, activeIndex, style, onSelect }: Props) {
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <div className="t-suggest-wrap" style={style}>
      <div id={listId} role="listbox" aria-label="命令建议" className="t-suggest">
        {candidates.map((candidate, index) => {
          const active = index === activeIndex
          return (
            <div
              key={candidate.def.name}
              ref={active ? activeRef : undefined}
              id={`${listId}-opt-${index}`}
              role="option"
              aria-selected={active}
              className={`t-suggest-row${active ? ' is-active' : ''}`}
              onClick={() => onSelect(candidate)}
            >
              <span className="t-suggest-name">{candidate.def.name}</span>
              {candidate.matched.toLowerCase() !== candidate.def.name.toLowerCase() && (
                <span className="t-dim text-xs">{candidate.matched}</span>
              )}
              <span className="t-suggest-desc t-dim text-xs">{candidate.def.description}</span>
            </div>
          )
        })}
      </div>
      <div className="t-suggest-hint" aria-hidden="true">
        ↑↓ 选择 · Enter 填入 · Esc 关闭 · Tab 补全
      </div>
    </div>
  )
}
