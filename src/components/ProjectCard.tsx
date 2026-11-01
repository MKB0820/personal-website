import { Link } from './Term'
import { TiltCard } from './TiltCard'
import type { Project } from '../data/projects'

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
