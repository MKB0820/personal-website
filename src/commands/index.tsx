import { useState } from 'react'
import type { CommandDef } from '../types'
import { Text, Title, Cmd, Key, Tag, Link, Row } from '../components/Term'
import { ProjectCard } from '../components/ProjectCard'
import { Neofetch } from '../components/Neofetch'
import { PROJECTS } from '../data/projects'
import { SKILL_GROUPS } from '../data/skills'
import { CONTACT, getEmail, maskEmail } from '../data/contact'
import { ROOT, resolve } from '../data/filesystem'

/**
 * 防爬虫邮箱展示：默认显示 `name [at] domain [dot] com`，
 * 只有用户主动复制或点击「显示」时才会把完整地址放进 DOM。
 */
function MaskedEmail({ email, onCopy }: { email: string; onCopy: (t: string) => Promise<boolean> }) {
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const handleCopy = () => {
    void onCopy(email).then((ok) => {
      if (!ok) return
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className={revealed ? 't-accent-bright' : 't-fg'}>
        {revealed ? email : maskEmail(email)}
      </span>
      <button type="button" className="t-btn" onClick={handleCopy} aria-label="复制完整邮箱地址">
        {copied ? '已复制 ✓' : '复制邮箱'}
      </button>
      <button
        type="button"
        className="t-btn"
        onClick={() => setRevealed((v) => !v)}
        aria-expanded={revealed}
        aria-label={revealed ? '隐藏完整邮箱地址' : '显示完整邮箱地址'}
      >
        {revealed ? '隐藏' : '显示'}
      </button>
    </span>
  )
}

/**
 * 命令注册表。所有命令集中在此定义，扩展时只需新增一项；
 * 输出统一返回 React 节点（React 自动转义，天然避免 XSS，全程不使用
 * dangerouslySetInnerHTML）。
 */
export const COMMANDS: CommandDef[] = [
  {
    name: 'help',
    description: '列出所有命令与说明',
    run() {
      return (
        <div>
          <Title>可用命令</Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
            {COMMANDS.map((c) => (
              <div key={c.name} className="flex gap-3">
                <code className="t-accent w-24 shrink-0">{c.name}</code>
                <span className="t-dim">{c.description}</span>
              </div>
            ))}
          </div>
          <div className="t-dim mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <Key>Tab</Key> 补全
            </span>
            <span>
              <Key>↑</Key> <Key>↓</Key> 历史
            </span>
            <span>
              <Cmd>theme</Cmd> 切换主题
            </span>
            <span>
              <Cmd>clear</Cmd> 清屏
            </span>
          </div>
        </div>
      )
    },
  },
  {
    name: 'whoami',
    aliases: ['who'],
    description: '我是谁',
    run() {
      return (
        <div>
          <div className="t-accent-bright font-bold text-lg">MKB</div>
          <Row k="身份">北京中学高中生 · 全栈工程师</Row>
          <Row k="方向">前端 · 后端 · 工具链，用代码解决实际问题</Row>
          <Row k="兴趣">编程 / 开源 / 工程化</Row>
        </div>
      )
    },
  },
  {
    name: 'about',
    description: '个人简介',
    run() {
      return (
        <div className="max-w-2xl space-y-1">
          <Title>关于我</Title>
          <Text>
            你好，我是 <span className="t-accent-bright">MKB</span>
            ，北京中学的一名高中生，同时也是一名在路上的全栈工程师。
          </Text>
          <Text>
            我热爱编程与开源，喜欢用代码解决实际问题。前端、后端、工具链都有涉猎，正在持续学习全栈开发与工程化。
          </Text>
          <Text>
            这个终端就是我的主页——输入 <Cmd>help</Cmd> 开始探索，像操作一个系统一样了解我。
          </Text>
        </div>
      )
    },
  },
  {
    name: 'education',
    aliases: ['edu'],
    description: '教育经历',
    run() {
      return (
        <div>
          <Title>教育经历</Title>
          <Row k="学校">北京中学（Beijing Middle School）</Row>
          <Row k="阶段">高中在读</Row>
          <Row k="方向">计算机 / 全栈开发</Row>
          <Row k="课余">编程实践 · 开源项目 · 算法与工程化学习</Row>
          <Text dim>※ 以上为占位信息，请替换为你的真实教育经历。</Text>
        </div>
      )
    },
  },
  {
    name: 'skills',
    description: '技能栈',
    run() {
      return (
        <div>
          <Title>技能栈</Title>
          {SKILL_GROUPS.map((g) => (
            <div key={g.title} className="mb-2.5">
              <div className="t-accent mb-1.5">{g.title}</div>
              <div className="flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    },
  },
  {
    name: 'projects',
    aliases: ['project'],
    description: '项目列表',
    run() {
      return (
        <div>
          <Title>项目</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr gap-3">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.name} project={p} />
            ))}
          </div>
          <Text dim>※ 除本站外，其余为静态示例项目，请替换为你的真实项目与链接。</Text>
        </div>
      )
    },
  },
  {
    name: 'contact',
    description: '联系方式',
    run(_args, ctx) {
      const email = getEmail()
      return (
        <div>
          <Title>联系方式</Title>
          <Row k="邮箱">
            {email ? (
              <MaskedEmail email={email} onCopy={ctx.copy} />
            ) : (
              <span className="t-dim">邮箱暂不可用</span>
            )}
          </Row>
          <Row k="GitHub">
            <Link href={CONTACT.github}>{CONTACT.github}</Link>
          </Row>
          <Row k="Blog">
            <Link href={CONTACT.blog}>{CONTACT.blog}</Link>
          </Row>
          <Text dim>※ 邮箱做了防爬虫处理，点击「复制邮箱」即可获得完整地址。</Text>
        </div>
      )
    },
  },
  {
    name: 'neofetch',
    aliases: ['sysinfo'],
    description: '系统信息面板',
    run(_args, ctx) {
      return <Neofetch theme={ctx.theme} />
    },
  },
  {
    name: 'ls',
    description: '列出目录内容',
    run(args) {
      const target = args[0]
      const node = target ? resolve(target) : ROOT
      if (!node) {
        return (
          <Text>
            <span className="t-warn">ls:</span> 无法访问 “{target}”：没有这个文件或目录
          </Text>
        )
      }
      if (node.type === 'file') {
        return (
          <div>
            <Title>{node.name}</Title>
            <Text>
              {node.name} — {node.desc}
            </Text>
          </div>
        )
      }
      const items = node.children ?? []
      const dirLabel =
        !target || target === '~' || target === '~/' ? '~' : `~/${target.replace(/^~?\//, '')}`
      return (
        <div>
          <Title>目录：{dirLabel}</Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            {items.map((it) =>
              it.type === 'dir' ? (
                <div key={it.name}>
                  <span className="t-accent">{it.name}/</span>{' '}
                  <span className="t-dim text-xs">{it.desc}</span>
                </div>
              ) : (
                <div key={it.name}>
                  <span className="t-fg">{it.name}</span>{' '}
                  <span className="t-dim text-xs">· {it.desc}</span>
                </div>
              ),
            )}
          </div>
          <div className="t-dim mt-2">
            <Cmd>cat 文件名</Cmd> 查看文件内容
          </div>
        </div>
      )
    },
  },
  {
    name: 'cat',
    description: '查看文件内容',
    run(args) {
      const name = args[0]
      if (!name) {
        return (
          <Text>
            用法：<Cmd>cat &lt;文件名&gt;</Cmd>，试试 <Cmd>cat about.md</Cmd>
          </Text>
        )
      }
      const node = resolve(name)
      if (!node || node.type !== 'file') {
        return (
          <Text>
            <span className="t-warn">cat:</span> {name}: 没有这个文件
          </Text>
        )
      }
      return (
        <div>
          <div className="t-dim text-xs mb-1">~/{name.replace(/^~?\//, '')}</div>
          <pre className="t-fg whitespace-pre-wrap leading-relaxed">{node.content}</pre>
        </div>
      )
    },
  },
  {
    name: 'date',
    description: '显示当前时间',
    run() {
      const now = new Date()
      return (
        <div>
          <Text>{now.toLocaleString('zh-CN', { hour12: false })}</Text>
          <Text dim>{now.toString()}</Text>
        </div>
      )
    },
  },
  {
    name: 'theme',
    description: '切换主题（green / cyan / amber）',
    run(args, ctx) {
      const t = args[0]
      if (t === 'green' || t === 'cyan' || t === 'amber') {
        ctx.setTheme(t)
        return (
          <Text>
            主题已切换为 <Cmd>{t}</Cmd>（已记住你的选择）
          </Text>
        )
      }
      return (
        <div>
          <Text>
            用法：<Cmd>theme green|cyan|amber</Cmd>
          </Text>
          <Text>
            当前主题：<Cmd>{ctx.theme}</Cmd>
          </Text>
        </div>
      )
    },
  },
  {
    name: 'clear',
    description: '清空屏幕',
    run(_args, ctx) {
      ctx.clear()
      return null
    },
  },
  {
    name: 'sudo',
    description: '尝试提升权限',
    run() {
      return (
        <div>
          <Text>MKB 已经拥有管理员权限 :)</Text>
          <Text dim>sudo: 无需密码——你本来就是 root。</Text>
        </div>
      )
    },
  },
  {
    name: 'exit',
    description: '退出（告别）',
    run() {
      return (
        <div>
          <Text>感谢来访，再见！👋</Text>
          <Text dim>（这只是网页，页面不会真的关闭；刷新即可重新开始。）</Text>
        </div>
      )
    },
  },
  {
    name: 'echo',
    description: '回显输入',
    run(args) {
      return <Text>{args.join(' ')}</Text>
    },
  },
  {
    name: 'history',
    description: '查看命令历史',
    run(_args, ctx) {
      if (ctx.history.length === 0) {
        return <Text dim>还没有历史记录。</Text>
      }
      return (
        <div>
          {ctx.history.map((h, i) => (
            <div key={i} className="flex gap-3">
              <span className="t-dim w-8 text-right shrink-0">{i + 1}</span>
              <span className="t-fg">{h}</span>
            </div>
          ))}
        </div>
      )
    },
  },
]

const MAP = new Map<string, CommandDef>()
for (const c of COMMANDS) {
  MAP.set(c.name, c)
  for (const a of c.aliases ?? []) MAP.set(a, c)
}

/** 按名称（含别名）查找命令，找不到返回 undefined。 */
export function findCommand(name: string): CommandDef | undefined {
  return MAP.get(name.toLowerCase())
}

/** 所有可补全的命令名（含别名），用于 Tab 补全。 */
export function commandNames(): string[] {
  const set = new Set<string>()
  for (const c of COMMANDS) {
    set.add(c.name)
    for (const a of c.aliases ?? []) set.add(a)
  }
  return [...set]
}
