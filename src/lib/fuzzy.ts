import { COMMANDS } from '../commands'
import type { CommandDef } from '../types'

export interface CommandCandidate {
  def: CommandDef
  /** 实际匹配到的名字（命令名或别名）。 */
  matched: string
  score: number
}

const MAX_RESULTS = 6

/**
 * 前缀优先、子序列兜底的命令匹配。
 * 前缀匹配给高分；只有查询长度 >= 3 时才启用子序列匹配（避免噪声）。
 */
function subsequenceScore(query: string, target: string): number {
  let qi = 0
  let gaps = 0
  let last = -1
  for (let i = 0; i < target.length && qi < query.length; i++) {
    if (target[i] === query[qi]) {
      if (last >= 0) gaps += i - last - 1
      last = i
      qi++
    }
  }
  if (qi < query.length) return 0
  return Math.max(1, 400 - gaps * 8 - (target.length - query.length) * 2)
}

/** 返回按相关度排序的命令候选，按命令去重。 */
export function searchCommands(query: string, limit = MAX_RESULTS): CommandCandidate[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const best = new Map<string, CommandCandidate>()

  for (const def of COMMANDS) {
    const names = [def.name, ...(def.aliases ?? [])]
    let top: CommandCandidate | null = null

    for (let index = 0; index < names.length; index++) {
      const name = names[index]
      const lower = name.toLowerCase()
      let score = 0
      if (lower.startsWith(q)) {
        score = 1000 - index * 10 - (lower.length - q.length)
      } else if (q.length >= 3) {
        score = subsequenceScore(q, lower)
      }
      if (score > 0 && (!top || score > top.score)) {
        top = { def, matched: name, score }
      }
    }

    if (top) {
      const current = best.get(def.name)
      if (!current || top.score > current.score) best.set(def.name, top)
    }
  }

  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, limit)
}
