/** 技能分组，用于 skills 命令。 */
export interface SkillGroup {
  title: string
  items: string[]
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: '前端',
    items: ['HTML/CSS', 'JavaScript', 'TypeScript', 'React', 'Tailwind CSS'],
  },
  {
    title: '后端',
    items: ['Node.js', 'REST API', 'Python', '数据库基础'],
  },
  {
    title: '工具',
    items: ['Git', 'Linux', 'Vite', '命令行'],
  },
  {
    title: '正在学习',
    items: ['云部署', '工程化', 'Docker', '测试'],
  },
]
