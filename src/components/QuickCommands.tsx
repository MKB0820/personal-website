const QUICK = ['help', 'whoami', 'projects', 'contact', 'clear'] as const

export function QuickCommands({ onRun }: { onRun: (cmd: string) => void }) {
  return (
    <div
      className="t-footer flex flex-wrap gap-2 px-4 py-2.5"
      role="toolbar"
      aria-label="快捷命令"
    >
      <span className="t-dim text-xs self-center mr-1 hidden sm:inline">快捷：</span>
      {QUICK.map((c) => (
        <button
          key={c}
          type="button"
          className="t-btn"
          onClick={() => onRun(c)}
          aria-label={`运行命令 ${c}`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
