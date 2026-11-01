/**
 * 项目列表 —— 全部为纯静态、可直接部署到静态托管的示例项目。
 *
 * 这里是项目的唯一数据源：项目卡片与 `ls` / `cat` 模拟文件系统都从这里生成，
 * 修改项目只需改这一处。有仓库时填写 repo / demo 即可自动显示链接；
 * 省略则卡片显示「仓库未公开」/「暂无 Demo」，不会产生死链。
 */
export interface Project {
  name: string
  desc: string
  stack: string[]
  /** 模拟文件系统中的文件名（不含 .md）。 */
  slug: string
  /** 仓库链接；未公开时省略，卡片显示「仓库未公开」。 */
  repo?: string
  /** 在线演示链接；未部署时省略，卡片显示「暂无 Demo」。 */
  demo?: string
}

export const PROJECTS: Project[] = [
  {
    name: '校园工具箱',
    slug: 'campus-toolbox',
    desc: '面向高中生的纯前端校园工具集：课程表、作业提醒、考试倒计时与常用查询，数据保存在浏览器本地，无需账号与后端。',
    stack: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    name: '个人博客系统',
    slug: 'blog',
    desc: 'Markdown 驱动的静态博客：构建时生成页面，支持标签、归档与 RSS，构建产物可直接部署到任意静态托管。',
    stack: ['Vite', 'MDX', 'Tailwind CSS'],
  },
  {
    name: '待办清单',
    slug: 'todo-app',
    desc: '纯前端待办应用：支持分组、筛选与拖拽排序，数据持久化在 localStorage，断网也能继续使用。',
    stack: ['React', 'TypeScript', 'localStorage'],
  },
  {
    name: 'Markdown 笔记站',
    slug: 'notes',
    desc: '静态笔记站点：Markdown 写作、客户端全文搜索与代码高亮，构建后是纯静态文件，无运行时依赖。',
    stack: ['Vite', 'Markdown', 'Pagefind'],
  },
]
