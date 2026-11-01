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
    name: '终端个人主页',
    slug: 'personal-website',
    desc: '你现在看到的这个站点：纯静态的终端风格个人主页，支持命令解析、历史记录、Tab 补全、主题切换与移动端快捷键。',
    stack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS'],
    repo: 'https://github.com/MKB0820/personal-website',
    demo: 'https://mkb0820.pages.dev/',
  },
  {
    name: '图片压缩工作台',
    slug: 'image-compressor',
    desc: '纯前端批量图片压缩与格式转换：Canvas 与 Web Worker 并行处理大图，保留 EXIF 方向，拖拽导入后打包下载。',
    stack: ['React', 'TypeScript', 'Web Worker', 'Canvas'],
  },
  {
    name: '本地加密密码库',
    slug: 'secure-vault',
    desc: '零后端的密码管理器：Web Crypto 的 AES-GCM 加密与 PBKDF2 密钥派生，数据只存 IndexedDB，支持自动锁定与剪贴板清除。',
    stack: ['TypeScript', 'Web Crypto', 'IndexedDB'],
  },
  {
    name: 'WebGL 图像滤镜实验室',
    slug: 'webgl-filters',
    desc: 'GLSL 实时图像滤镜：亮度、对比度、色相与高斯模糊，双缓冲渲染并支持导出 PNG，全部在浏览器内完成。',
    stack: ['WebGL2', 'GLSL', 'TypeScript'],
  },
]
