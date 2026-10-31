import type { Project } from '../components/ProjectCard'

/**
 * 项目列表 —— 目前为占位示例，尚未关联真实仓库。
 * 有仓库时填写 repo / demo 即可自动显示链接；
 * 省略则卡片显示「仓库未公开」/「暂无 Demo」，不会产生死链。
 */
export const PROJECTS: Project[] = [
  {
    name: '校园工具箱',
    desc: '面向高中生的校园工具集合：课程表、作业提醒、倒计时与常用查询，纯前端实现。',
    stack: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    name: '个人博客系统',
    desc: 'Markdown 驱动的静态博客，支持标签、归档与 RSS，部署于静态托管平台。',
    stack: ['Vite', 'MDX', 'Node.js'],
  },
  {
    name: '全栈待办应用',
    desc: '前后端分离的待办清单：登录鉴权、REST API 与数据库持久化，支持多人协作。',
    stack: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    name: '开源 CLI 小工具',
    desc: '用 Node.js 编写的命令行小工具，提供脚手架、批量重命名等实用能力。',
    stack: ['Node.js', 'TypeScript', 'CLI'],
  },
]
