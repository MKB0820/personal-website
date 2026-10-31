/** 安全读取 localStorage，避免隐私模式下抛异常。 */
export function load(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** 安全写入 localStorage，失败时静默忽略（不阻塞主流程）。 */
export function save(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}
