# MKB — 终端风格个人主页

一个酷、干净、可读的终端风格单页个人站。进入后是一个终端窗口，可以输入命令探索个人信息。纯前端静态部署，无后端。

技术栈：**React + Vite + TypeScript + Tailwind CSS v4**。

## 项目结构

```
personal website/
├── index.html                 # 入口 HTML（含 meta / OG / 字体）
├── package.json
├── vite.config.ts             # Vite + React + Tailwind 插件
├── tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx               # React 挂载入口
    ├── App.tsx                # 页面布局
    ├── index.css              # Tailwind + 主题变量 + 终端样式
    ├── types.ts               # 全局类型（命令注册表类型等）
    ├── commands/
    │   └── index.tsx          # 命令注册表：所有命令集中在此
    ├── components/
    │   ├── Terminal.tsx       # 终端主体：状态、历史、补全、滚动
    │   ├── TitleBar.tsx       # 顶部栏（红黄绿圆点 + 标题 + 开关）
    │   ├── CommandInput.tsx   # 输入行
    │   ├── QuickCommands.tsx  # 底部快捷命令按钮
    │   ├── ProjectCard.tsx    # 项目卡片
    │   ├── Neofetch.tsx       # neofetch 信息面板
    │   ├── Prompt.tsx         # 提示符 MKB@BJHS:~$
    │   └── Term.tsx           # 输出原子组件（Text/Title/Cmd/Tag/Link…）
    ├── data/
    │   ├── projects.ts        # 项目数据（占位）
    │   ├── skills.ts          # 技能分组
    │   ├── contact.ts         # 联系方式（占位）
    │   └── filesystem.ts      # 内存文件系统（ls / cat）
    ├── hooks/
    │   ├── useTheme.ts        # 主题状态 + localStorage
    │   └── useCrt.ts          # CRT 扫描线开关
    └── lib/
        ├── storage.ts         # 安全读写 localStorage
        ├── clipboard.ts       # 剪贴板复制（含回退）
        └── welcome.ts         # 欢迎语
```

## 运行

```bash
npm install     # 安装依赖
npm run dev     # 开发模式，浏览器打开 http://localhost:5173
npm run build   # 类型检查 + 生产构建，产物在 dist/
npm run preview # 本地预览构建产物
```

## 支持的命令

`help` `whoami` `about` `education` `skills` `projects` `contact` `neofetch` `ls` `cat` `date` `theme` `clear` `sudo` `exit` `echo` `history`

交互：`↑`/`↓` 命令历史 · `Tab` 补全 · `Ctrl+L` 清屏 · 底部快捷按钮（移动端友好）。

## 需要替换的占位信息

发布前请全局搜索并替换以下占位符：

| 位置 | 占位符 | 说明 |
| --- | --- | --- |
| `src/data/projects.ts` | `repo` / `demo`（可选字段） | 项目仓库与 Demo 链接 |
| `src/data/filesystem.ts` | 对应的文件内容 | `cat` 输出的项目信息 |

> 邮箱做了防爬虫处理：在 `src/data/contact.ts` 中以 Base64 存储，界面只显示 `mkb259173 [at] gmail [dot] com`，点击「复制邮箱」时才解码出完整地址；不使用 `mailto:` 链接，避免 href 被直接抓取。
>
> GitHub 已设置为真实账号 `https://github.com/MKB0820`，Blog 指向已部署站点 `https://mkb0820.pages.dev/`。项目卡片的 `repo` / `demo` 为可选字段：目前 4 个项目尚未关联真实仓库，卡片显示「仓库未公开」「暂无 Demo」，填上链接后自动变为可点击。
