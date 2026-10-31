import type { KeyboardEvent, RefObject } from 'react'
import { Prompt } from './Prompt'

interface Props {
  value: string
  onChange: (v: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  inputRef: RefObject<HTMLInputElement>
}

export function CommandInput({ value, onChange, onKeyDown, inputRef }: Props) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <Prompt />
      <input
        ref={inputRef}
        className="t-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label="终端命令输入"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="send"
      />
    </div>
  )
}
