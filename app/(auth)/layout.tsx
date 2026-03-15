export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-background px-4"
         style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(155,122,239,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(240,150,58,0.08) 0%, transparent 60%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold gradient-text">RudeBooks</h1>
          <p className="text-ink-muted mt-1 text-sm">Less chaos. More books</p>
        </div>
        {children}
      </div>
    </div>
  )
}
