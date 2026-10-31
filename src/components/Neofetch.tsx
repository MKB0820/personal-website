import type { ThemeName } from '../types'
import { Row } from './Term'

const ASCII = [
  '        ▄▄▄▄▄▄▄▄',
  '      ▄█        █▄',
  '     █           █',
  '     █  M K B    █',
  '     █           █',
  '      ▀█        █▀',
  '        ▀▀▀▀▀▀▀▀',
].join('\n')

export function Neofetch({ theme }: { theme: ThemeName }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
      <pre className="t-accent leading-tight select-none" aria-hidden="true">
        {ASCII}
      </pre>
      <div className="space-y-0.5 min-w-0">
        <Row k="user">MKB@BJHS</Row>
        <Row k="os">北京中学 · 高中生</Row>
        <Row k="role">全栈工程师</Row>
        <Row k="shell">terminal / zsh</Row>
        <Row k="theme">{theme}</Row>
        <Row k="skills">TypeScript · React · Node.js · Python</Row>
        <Row k="uptime">一直在学习</Row>
      </div>
    </div>
  )
}
