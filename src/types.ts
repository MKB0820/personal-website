import type { ReactNode } from 'react'

/** 终端主题名称，green / cyan / amber。 */
export type ThemeName = 'green' | 'cyan' | 'amber'

/** 命令运行时可以访问的上下文，由 Terminal 注入。 */
export interface CommandContext {
  /** 当前主题名。 */
  theme: ThemeName
  /** 切换主题。 */
  setTheme: (theme: ThemeName) => void
  /** 清空终端输出。 */
  clear: () => void
  /** 复制文本到剪贴板，返回是否成功。 */
  copy: (text: string) => Promise<boolean>
  /** 已执行的命令历史（不含当前命令）。 */
  history: string[]
}

/** 命令的返回值：一段安全的 React 节点，或 null（表示不产生输出，如 clear）。 */
export type CommandResult = ReactNode

/** 一条命令的定义。命令全部通过该结构注册，便于扩展。 */
export interface CommandDef {
  /** 命令名，用户输入的标识符。 */
  name: string
  /** 别名，同样能触发该命令。 */
  aliases?: string[]
  /** 一句话说明，显示在 help 中。 */
  description: string
  /** 执行逻辑。args 为空格分隔的参数，ctx 见 CommandContext。 */
  run: (args: string[], ctx: CommandContext) => CommandResult | null
}

/** 用户输入的一行（回显）。 */
export interface InputLine {
  id: number
  role: 'input'
  text: string
}

/** 命令产生的一行输出。 */
export interface OutputLine {
  id: number
  role: 'output'
  node: ReactNode
}

/** 终端中的一行：输入回显或输出。 */
export type TermLine = InputLine | OutputLine
