import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AnimationEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { TitleBar } from './TitleBar'
import { CommandInput } from './CommandInput'
import { CommandSuggestions } from './CommandSuggestions'
import { QuickCommands } from './QuickCommands'
import { Prompt } from './Prompt'
import { Cmd } from './Term'
import { findCommand, commandNames } from '../commands'
import { searchCommands } from '../lib/fuzzy'
import type { CommandCandidate } from '../lib/fuzzy'
import type { CommandContext, TermLine } from '../types'
import { useTheme } from '../hooks/useTheme'
import { useCrt } from '../hooks/useCrt'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useSpotlight } from '../hooks/useSpotlight'
import { copyText } from '../lib/clipboard'
import { WELCOME } from '../lib/welcome'

let nextId = 1

const CHARS_PER_TICK = 6
const TYPE_INTERVAL = 14
const LIST_ID = 'cmd-suggestions'

/** 这些元素上的点击不应该触发「聚焦输入框」。 */
const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"]'

interface PanelPos {
  left: number
  width: number
  maxHeight: number
  top?: number
  bottom?: number
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function Terminal() {
  const [theme, setTheme, cycleTheme] = useTheme()
  const [crt, toggleCrt] = useCrt()
  const reducedMotion = usePrefersReducedMotion()

  const [lines, setLines] = useState<TermLine[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [welcomeText, setWelcomeText] = useState('')
  const [welcomeComplete, setWelcomeComplete] = useState(false)
  const [activity, setActivity] = useState(0)
  const [clearFlash, setClearFlash] = useState(0)
  const [suggestIndex, setSuggestIndex] = useState(0)
  const [dismissedToken, setDismissedToken] = useState<string | null>(null)
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null)
  const [resizeTick, setResizeTick] = useState(0)
  const [powering, setPowering] = useState(() => crt && !reducedMotion)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputWrapRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<string[]>([])
  const historyIndex = useRef(-1)
  const draft = useRef('')
  const welcomeTimer = useRef(0)
  const welcomeDone = useRef(false)
  const blurTimer = useRef(0)

  // 指针聚光：直接挂在整个终端主体上。
  useSpotlight(bodyRef)

  const clear = useCallback(() => {
    setLines([])
    setClearFlash((n) => n + 1)
  }, [])

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

  // 输入是单个命令词时才给补全；含空格视为参数，不介入。
  const token = useMemo(() => {
    const t = input.trimStart()
    return t.includes(' ') ? '' : t
  }, [input])

  const candidates = useMemo(() => (token.length >= 2 ? searchCommands(token) : []), [token])
  const exact = token ? findCommand(token) : undefined
  const suggestionsVisible =
    token.length >= 2 && !exact && candidates.length > 0 && dismissedToken !== token
  const candidateKey = candidates.map((c) => c.def.name).join('|')
  const activeIndex = candidates.length > 0 ? Math.min(suggestIndex, candidates.length - 1) : 0

  const tokenRef = useRef(token)
  tokenRef.current = token

  // 欢迎语打字机：可跳过，不阻塞输入，尊重 prefers-reduced-motion。
  // 开机动画期间先不开始，避免用户在屏幕还没亮完时错过。
  useEffect(() => {
    if (powering) return
    if (welcomeDone.current) return
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
  }, [powering])

  const skipWelcome = useCallback(() => {
    if (welcomeDone.current) return
    welcomeDone.current = true
    window.clearInterval(welcomeTimer.current)
    setWelcomeText(WELCOME)
    setWelcomeComplete(true)
  }, [])

  // 任意按键或点击都会跳过打字机动画。开机遮罩也在此跳过。
  useEffect(() => {
    const onKey = () => {
      if (powering) setPowering(false)
      skipWelcome()
    }
    const onPointer = () => {
      if (powering) setPowering(false)
      skipWelcome()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [skipWelcome, powering])

  // 开机遮罩的兜底：动画事件没触发也不会盖住终端。
  useEffect(() => {
    if (!powering) return
    const id = window.setTimeout(() => setPowering(false), 700)
    return () => window.clearTimeout(id)
  }, [powering])

  useEffect(() => {
    if (!crt) setPowering(false)
  }, [crt])

  // 只在产生新输出时滚动到底部；单纯打字不打断用户向上翻阅历史。
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, welcomeText])

  // 自动聚焦输入框（preventScroll 避免把用户从已滚动的位置拽回底部）。
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    historyRef.current = history
  }, [history])

  // 候选变化时回到第一项；输入词变化时解除 Esc 关闭状态。
  useEffect(() => {
    setSuggestIndex(0)
  }, [candidateKey])

  useEffect(() => {
    setDismissedToken(null)
  }, [token])

  useEffect(() => {
    const onResize = () => setResizeTick((t) => t + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 计算建议面板的位置：渲染在 .t-scroll 之外，避免被滚动容器裁切。
  useEffect(() => {
    if (!suggestionsVisible) {
      setPanelPos(null)
      return
    }
    const body = bodyRef.current
    const wrap = inputWrapRef.current
    if (!body || !wrap) return
    const br = body.getBoundingClientRect()
    const ir = wrap.getBoundingClientRect()
    if (ir.bottom <= br.top || ir.top >= br.bottom) {
      setPanelPos(null)
      return
    }
    const width = Math.max(180, Math.min(ir.width, br.width - 16))
    const left = Math.max(8, Math.min(ir.left - br.left, br.width - width - 8))
    const spaceAbove = ir.top - br.top
    const above = spaceAbove >= 200
    const maxHeight = above
      ? Math.min(256, spaceAbove - 12)
      : Math.min(256, Math.max(120, br.bottom - ir.bottom - 72))
    setPanelPos(
      above
        ? { left, width, maxHeight, bottom: br.bottom - ir.top + 8 }
        : { left, width, maxHeight, top: ir.bottom - br.top + 8 },
    )
  }, [suggestionsVisible, candidateKey, resizeTick])

  const submit = useCallback(
    (rawOverride?: string) => {
      const raw = rawOverride ?? input
      setLines((ls) => [...ls, { id: nextId++, role: 'input', text: raw }])
      const trimmed = raw.trim()
      if (trimmed) {
        setActivity((n) => n + 1)
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
    const raw = input.trimStart()
    const single = raw.includes(' ') ? '' : raw
    // 与建议面板使用同一套匹配，避免两处结果不一致。
    if (single.length >= 2) {
      const top = searchCommands(single)[0]
      if (top) {
        setInput(`${top.def.name} `)
        return
      }
    }

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

  const acceptSuggestion = useCallback((candidate: CommandCandidate) => {
    setInput(`${candidate.def.name} `)
    setSuggestIndex(0)
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // 中文输入法组词期间（keyCode 229 / isComposing），回车、方向键、Tab
      // 都属于输入法操作，不能被终端拦截。
      if (e.nativeEvent.isComposing || e.keyCode === 229) return

      // 补全面板打开时：方向键在选择项间移动，Esc 关闭，Enter 填入但不执行。
      if (suggestionsVisible) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSuggestIndex((i) => Math.min(i + 1, candidates.length - 1))
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSuggestIndex((i) => Math.max(i - 1, 0))
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          setDismissedToken(token)
          return
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          const pick = candidates[activeIndex]
          if (pick) acceptSuggestion(pick)
          return
        }
      }

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
    [suggestionsVisible, candidates, activeIndex, token, acceptSuggestion, submit, navHistory, complete, clear],
  )

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  /** 失焦后稍等再收起建议，避免点选建议时面板先消失。 */
  const handleBlur = useCallback(() => {
    window.clearTimeout(blurTimer.current)
    blurTimer.current = window.setTimeout(() => {
      if (document.activeElement !== inputRef.current) {
        setDismissedToken(tokenRef.current)
      }
    }, 200)
  }, [])

  useEffect(() => () => window.clearTimeout(blurTimer.current), [])

  /** 点击终端空白处聚焦输入框；点击输出中的链接/按钮或正在选择文本时不抢焦点。 */
  const handleLogClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null
      if (target?.closest(INTERACTIVE_SELECTOR)) return
      if (window.getSelection()?.toString()) return
      if (suggestionsVisible) setDismissedToken(tokenRef.current)
      inputRef.current?.focus({ preventScroll: true })
    },
    [suggestionsVisible],
  )

  const handleScroll = useCallback(() => {
    if (suggestionsVisible) setDismissedToken(tokenRef.current)
  }, [suggestionsVisible])

  const endPower = useCallback((e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.animationName !== 'crt-open') return
    setPowering(false)
  }, [])

  const runQuick = useCallback(
    (cmd: string) => {
      submit(cmd)
      focusInput()
    },
    [submit, focusInput],
  )

  return (
    <div
      className="t-window relative flex h-full w-full min-w-0 flex-col"
      data-crt={crt ? 'true' : 'false'}
    >
      <div className="t-picture flex min-h-0 w-full flex-1 flex-col">
        <TitleBar
          theme={theme}
          crt={crt}
          activity={activity}
          onCycleTheme={cycleTheme}
          onToggleCrt={toggleCrt}
        />
        <div ref={bodyRef} className="relative flex min-h-0 flex-1 flex-col">
          <div className="t-ambient" aria-hidden="true">
            <div className="t-spot" />
          </div>
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
            onScroll={handleScroll}
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
              onBlur={handleBlur}
              inputRef={inputRef}
              wrapRef={inputWrapRef}
              expanded={suggestionsVisible}
              activeOptionId={`${LIST_ID}-opt-${activeIndex}`}
              listId={LIST_ID}
            />
          </div>
          {suggestionsVisible && panelPos && (
            <CommandSuggestions
              listId={LIST_ID}
              candidates={candidates}
              activeIndex={activeIndex}
              style={{
                left: panelPos.left,
                width: panelPos.width,
                maxHeight: panelPos.maxHeight,
                top: panelPos.top,
                bottom: panelPos.bottom,
              }}
              onSelect={acceptSuggestion}
            />
          )}
          <QuickCommands onRun={runQuick} />
          {clearFlash > 0 && (
            <div key={clearFlash} className="t-clear-flash" aria-hidden="true" />
          )}
        </div>
      </div>
      {powering && <div className="crt-power" aria-hidden="true" onAnimationEnd={endPower} />}
    </div>
  )
}

function notFound(cmd: string): ReactNode {
  return (
    <div className="err-line">
      <span className="t-warn">command not found:</span> {cmd}
      <span className="t-dim"> —— 输入 </span>
      <Cmd>help</Cmd>
      <span className="t-dim"> 查看可用命令</span>
    </div>
  )
}
