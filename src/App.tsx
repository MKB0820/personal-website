import Terminal from './components/Terminal'

export default function App() {
  return (
    <main className="bg-glow flex min-h-screen w-full items-center justify-center px-3 py-4 sm:px-6 sm:py-8">
      <h1 className="sr-only">MKB 的终端个人主页</h1>
      <div className="h-[min(90dvh,760px)] w-full min-w-0 max-w-4xl sm:h-[min(86dvh,820px)]">
        <Terminal />
      </div>
    </main>
  )
}
