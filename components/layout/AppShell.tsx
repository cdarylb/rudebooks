import TopBar from './TopBar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col bg-background">
      <TopBar />
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
