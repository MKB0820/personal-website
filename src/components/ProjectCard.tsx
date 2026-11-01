import { Link } from './Term'
import { TiltCard } from './TiltCard'

export interface Project {
  name: string
  desc: string
  stack: string[]
  /** 仓库链接；未公开时省略，卡片显示「仓库未公开」。 */
  repo?: string
  /** 在线演示链接；未部署时省略，卡片显示「暂无 Demo」。 */
  demo?: string
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <TiltCard className="t-card">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <span className="t-accent-bright font-bold">{project.name}</span>
        <span className="t-dim text-xs">{project.stack.join(' · ')}</span>
      </div>
      <p className="t-fg text-sm mt-1.5">{project.desc}</p>
      <div className="flex gap-5 mt-2.5 text-sm">
        {project.repo ? (
          <Link href={project.repo}>GitHub ↗</Link>
        ) : (
          <span className="t-dim">仓库未公开</span>
        )}
        {project.demo ? (
          <Link href={project.demo}>Demo ↗</Link>
        ) : (
          <span className="t-dim">暂无 Demo</span>
        )}
      </div>
    </TiltCard>
  )
}
