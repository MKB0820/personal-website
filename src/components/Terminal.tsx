import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { TitleBar } from './TitleBar'
import { CommandInput } from './CommandInput'
import { QuickCommands } from './QuickCommands'
import { Prompt } from './Prompt'
import { Cmd } from './Term'
import { findCommand, commandNames } from '../commands'
import type { CommandContext, TermLine } from '../types'
import { useTheme } from '../hooks/useTheme'
import { useCrt } from '../hooks/useCrt'
import { copyText } from '../lib/clipboard'
import { WELCOME } from '../lib/welcome'

let nextId = 1

const CHARS_PER_TICK = 6
const TYPE_INTERVAL = 14

/** 这些元素上的点击不应该触发「聚焦输入框」。 */
const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"]'

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Terminal() {
  const [theme, setTheme, cycleTheme] = useTheme()
  const [crt, toggleCrt] = useCrt()
  const [lines, setLines] = useState<TermLine[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [welcomeText, setWelcomeText] = useState('')
  const [welcomeComplete, setWelcomeComplete] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<string[]>([])
  const historyIndex = useRef(-1)
  const draft = useRef('')
  const welcomeTimer = useRef(0)
  const welcomeDone = useRef(false)

  const clear = useCallback(() => setLines([]), [])

  const ctx = useMemo<CommandContext>(
    () => ({
      theme,
      setTheme,
      clear,
      copy: copyText,
      history,
    }),
    [theme, setTheme, clear, history],
  )

  // 欢迎语打字机：可跳过，不阻塞输入，尊重 prefers-reduced-motion。
  useEffect(() => {
    if (prefersReducedMotion()) {
      setWelcomeText(WELCOME)
      setWelcomeComplete(true)
      welcomeDone.current = true
      return
    }
    let i = 0
    const id = window.setInterval(() => {
      i += CHARS_PER_TICK
      if (i >= WELCOME.length) {
        window.clearInterval(id)
        welcomeDone.current = true
        setWelcomeText(WELCOME)
        setWelcomeComplete(true)
      } else {
        setWelcomeText(WELCOME.slice(0, i))
      }
    }, TYPE_INTERVAL)
    welcomeTimer.current = id
    return () => window.clearInterval(id)
  }, [])

  // 任意按键或点击都会跳过打字机动画。
  const skipWelcome = useCallback(() => {
    if (welcomeDone.current) return
    welcomeDone.current = true
    window.clearInterval(welcomeTimer.current)
    setWelcomeText(WELCOME)
    setWelcomeComplete(true)
  }, [])

  useEffect(() => {
    const onKey = () => skipWelcome()
    const onPointer = () => skipWelcome()
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [skipWelcome])

  // 只在产生新输出时滚动到底部；单纯打字不打断用户向上翻阅历史。
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, welcomeText])

  // 自动聚焦输入框（preventScroll 避免把用户从已滚动的位置拽回底部）。
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  // historyRef 由 effect 同步，避免在 setState updater 里做副作用。
  useEffect(() => {
    historyRef.current = history
  }, [history])

  const submit = useCallback(
    (rawOverride?: string) => {
      const raw = rawOverride ?? input
      setLines((ls) => [...ls, { id: nextId++, role: 'input', text: raw }])
      const trimmed = raw.trim()
      if (trimmed) {
        setHistory((h) => [...h, raw])
        historyIndex.current = -1
        draft.current = ''
        const [name, ...args] = trimmed.split(/\s+/)
        const def = findCommand(name)
        if (!def) {
          setLines((ls) => [...ls, { id: nextId++, role: 'output', node: notFound(name) }])
        } else {
          const result = def.run(args, ctx)
          if (result != null) {
            setLines((ls) => [...ls, { id: nextId++, role: 'output', node: result }])
          }
        }
      }
      setInput('')
    },
    [input, ctx],
  )

  const navHistory = useCallback(
    (dir: 1 | -1) => {
      const h = historyRef.current
      if (h.length === 0) return
      if (dir === 1) {
        if (historyIndex.current === -1) draft.current = input
        if (historyIndex.current < h.length - 1) {
          historyIndex.current += 1
          setInput(h[h.length - 1 - historyIndex.current])
        }
      } else {
        if (historyIndex.current > 0) {
          historyIndex.current -= 1
          setInput(h[h.length - 1 - historyIndex.current])
        } else if (historyIndex.current === 0) {
          historyIndex.current = -1
          setInput(draft.current)
        }
      }
    },
    [input],
  )

  const complete = useCallback(() => {
    const names = commandNames()
    const parts = input.split(/\s+/)
    const word = (parts[parts.length - 1] ?? '').toLowerCase()
    if (word === '') {
      setLines((ls) => [
        ...ls,
        { id: nextId++, role: 'output', node: <div className="t-dim">可用命令：{names.join('  ')}</div> },
      ])
      return
    }
    const matches = names.filter((n) => n.toLowerCase().startsWith(word))
    if (matches.length === 0) return
    if (matches.length === 1) {
      parts[parts.length - 1] = `${matches[0]} `
      setInput(parts.join(' '))
      return
    }
    // 多个匹配：补全到最长公共前缀，否则列出候选。
    let lcp = matches[0]
    for (const m of matches) {
      while (!m.startsWith(lcp)) lcp = lcp.slice(0, -1)
      if (lcp.length === 0) break
    }
    if (lcp.length > word.length) {
      parts[parts.length - 1] = lcp
      setInput(parts.join(' '))
    } else {
      setLines((ls) => [
        ...ls,
        { id: nextId++, role: 'output', node: <div className="t-dim">匹配：{matches.join('  ')}</div> },
      ])
    }
  }, [input])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // 中文输入法组词期间（keyCode 229 / isComposing），回车、方向键、Tab
      // 都属于输入法操作，不能被终端拦截。
      if (e.nativeEvent.isComposing || e.keyCode === 229) return

      if (e.key === 'Enter') {
        e.preventDefault()
        submit()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        navHistory(1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        navHistory(-1)
      } else if (e.key === 'Tab' && !e.shiftKey) {
        // Shift+Tab 保留默认行为，键盘用户仍能移出输入框访问其它控件。
        e.preventDefault()
        complete()
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault()
        clear()
      }
    },
    [submit, navHistory, complete, clear],
  )

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  /** 点击终端空白处聚焦输入框；点击输出中的链接/按钮或正在选择文本时不抢焦点。 */
  const handleLogClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null
    if (target?.closest(INTERACTIVE_SELECTOR)) return
    if (window.getSelection()?.toString()) return
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const runQuick = useCallback(
    (cmd: string) => {
      submit(cmd)
      focusInput()
    },
    [submit, focusInput],
  )

  return (
    <div className="t-window relative flex h-full w-full min-w-0 flex-col">
      <TitleBar theme={theme} crt={crt} onCycleTheme={cycleTheme} onToggleCrt={toggleCrt} />
      <div className="relative flex min-h-0 flex-1 flex-col">
        {crt && (
          <>
            <div className="crt-noise" aria-hidden="true" />
            <div className="crt-vignette" aria-hidden="true" />
            <div className="crt-overlay" aria-hidden="true" />
          </>
        )}
        <div
          ref={scrollRef}
          className="t-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-6"
          onClick={handleLogClick}
        >
          {/* 给读屏用户的静态欢迎语；动画本身对辅助技术隐藏，避免逐字播报。 */}
          <p className="sr-only">
            欢迎来到 MKB 的终端主页。MKB 是北京中学高中生、全栈工程师。输入 help 查看所有命令。
          </p>
          <div
            className="space-y-1.5"
            role="log"
            aria-live={welcomeComplete ? 'polite' : 'off'}
            aria-label="终端输出"
          >
            {welcomeText.length > 0 && (
              <pre
                aria-hidden="true"
                className="welcome-art t-accent leading-tight whitespace-pre-wrap break-words select-none mb-3"
              >
                {welcomeText}
                {!welcomeComplete && <span className="t-cursor-block">█</span>}
              </pre>
            )}
            {lines.map((line) =>
              line.role === 'input' ? (
                <div key={line.id} className="t-fg line-enter">
                  <Prompt>{line.text}</Prompt>
                </div>
              ) : (
                <div key={line.id} className="t-fg line-enter">
                  {line.node}
                </div>
              ),
            )}
          </div>
          <CommandInput
            value={input}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
          />
        </div>
        <QuickCommands onRun={runQuick} />
      </div>
    </div>
  )
}

function notFound(cmd: string): ReactNode {
  return (
    <div>
      <span className="t-warn">command not found:</span> {cmd}
      <span className="t-dim"> —— 输入 </span>
      <Cmd>help</Cmd>
      <span className="t-dim"> 查看可用命令</span>
    </div>
  )
}
