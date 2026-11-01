/** 简单的内存文件系统，用于 ls / cat 命令。 */

import { PROJECTS } from './projects'

export interface FsNode {
  type: 'file' | 'dir'
  name: string
  /** 列表 / 说明文案。 */
  desc: string
  /** 文件内容（纯文本）。 */
  content?: string
  /** 目录子节点。 */
  children?: FsNode[]
}

const ABOUT = `# 关于 MKB

你好，我是 MKB，北京中学的一名高中生，
同时也是一名在路上的全栈工程师。

热爱编程与开源，喜欢用代码解决实际问题。
前端、后端、工具链均有涉猎，正在持续学习
全栈开发与工程化。

这个终端就是我的个人主页：
输入 help 查看所有命令。`

const CONTACT_TXT = `邮箱    mkb259173 [at] gmail [dot] com   （防爬虫写法）
GitHub  https://github.com/MKB0820
Blog    https://mkb0820.pages.dev/

※ 邮箱请用 contact 命令一键复制。`

const SKILLS_TXT = `前端    HTML/CSS · JavaScript · TypeScript · React · Tailwind CSS
后端    Node.js · REST API · Python · 数据库基础
工具    Git · Linux · Vite · 命令行
学习中  云部署 · 工程化 · Docker · 测试`

/** 由 PROJECTS 自动生成项目文件，保证 cat 内容与项目卡片始终一致。 */
const PROJECT_FILES: FsNode[] = PROJECTS.map(
  (p): FsNode => ({
    type: 'file',
    name: `${p.slug}.md`,
    desc: p.name,
    content: [
      p.name,
      '----------------',
      p.desc,
      '',
      `技术栈  ${p.stack.join(' · ')}`,
      '仓库    未公开',
      'Demo    暂无',
    ].join('\n'),
  }),
)

export const ROOT: FsNode = {
  type: 'dir',
  name: '~',
  desc: 'home',
  children: [
    { type: 'file', name: 'about.md', desc: '个人简介', content: ABOUT },
    { type: 'file', name: 'contact.txt', desc: '联系方式', content: CONTACT_TXT },
    { type: 'file', name: 'skills.txt', desc: '技能清单', content: SKILLS_TXT },
    { type: 'dir', name: 'projects', desc: '项目目录', children: PROJECT_FILES },
  ],
}

/** 按简单路径解析节点；找不到返回 null。 */
export function resolve(path: string): FsNode | null {
  const parts = path.replace(/^~\/?/, '').split('/').filter(Boolean)
  let cur: FsNode = ROOT
  for (const p of parts) {
    if (cur.type !== 'dir') return null
    const next = cur.children?.find((c) => c.name === p)
    if (!next) return null
    cur = next
  }
  return cur
}
