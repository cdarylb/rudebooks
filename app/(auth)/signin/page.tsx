'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function SigninPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Email ou mot de passe incorrect')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit} method="post" className="glass-card rounded-2xl p-6 space-y-4">
      <h2 className="font-heading text-xl font-semibold text-ink">Connexion</h2>

      {error && (
        <div className="bg-red-950/50 border border-red-800/60 text-red-400 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-ink-muted">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          required autoComplete="email" className="field" placeholder="vous@exemple.com" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-ink-muted">Mot de passe</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} value={password}
            onChange={(e) => setPassword(e.target.value)}
            required autoComplete="current-password"
            className="field pr-10" />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink-muted transition">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 gradient-primary text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50">
        <LogIn size={16} />
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>

      {/* <p className="text-center text-sm text-ink-muted">
        Pas de compte ?{' '}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Créer un compte
        </Link>
      </p> */}
    </form>
  )
}
