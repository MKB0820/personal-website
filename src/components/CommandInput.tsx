import type { KeyboardEvent, RefObject } from 'react'
import { Prompt } from './Prompt'

interface Props {
  value: string
  onChange: (v: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  onBlur: () => void
  inputRef: RefObject<HTMLInputElement>
  wrapRef: RefObject<HTMLDivElement>
  expanded: boolean
  activeOptionId?: string
  listId: string
}

export function CommandInput({
  value,
  onChange,
  onKeyDown,
  onBlur,
  inputRef,
  wrapRef,
  expanded,
  activeOptionId,
  listId,
}: Props) {
  return (
    <div ref={wrapRef} className="relative flex items-center gap-2 py-0.5">
      <Prompt />
      <input
        ref={inputRef}
        className="t-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        aria-label="终端命令输入"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-activedescendant={expanded ? activeOptionId : undefined}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="send"
      />
    </div>
  )
}
