/**
 * 联系方式。
 *
 * 邮箱做了防爬虫处理：
 * 1. 源码中以 Base64 存储，页面 HTML/bundle 里不会出现明文 `@` 地址；
 * 2. 界面上只显示 `name [at] domain [dot] com` 形式；
 * 3. 不生成 mailto: 链接，避免 href 被直接提取；
 * 4. 只有用户点击「复制邮箱」时才解码出完整地址。
 *
 * 注意：这属于混淆（obfuscation），能挡住简单的文本爬虫，
 * 无法阻止执行 JS 的定向抓取——公开在网页上的信息没有绝对安全。
 */
const EMAIL_B64 = 'bWtiMjU5MTczQGdtYWlsLmNvbQ=='

export const CONTACT = {
  github: 'https://github.com/MKB0820',
  blog: 'https://yourname.example.com',
}

/** 解码得到完整邮箱（仅在用户主动复制时调用）。 */
export function getEmail(): string {
  try {
    return atob(EMAIL_B64)
  } catch {
    return ''
  }
}

/** 将邮箱转成可读但不可直接抓取的形式：a [at] b [dot] c */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  // 防御：格式异常时不要原样输出，否则等于泄露明文
  if (!local || !domain) return '[邮箱不可用]'
  return `${local} [at] ${domain.replace(/\./g, ' [dot] ')}`
}
